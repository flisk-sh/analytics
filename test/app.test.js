import { beforeEach, expect, test } from 'bun:test';
import { cleanDomain, handle } from '../src/index.js';
import { resetSitesCache } from '../src/ingest.js';
import { makeSession } from '../src/session.js';
import { allowed, githubLogin } from '../src/auth.js';
import { beacon, fakeEnv } from './helpers.js';

beforeEach(() => resetSitesCache());
const cookieOf = (setCookie) => setCookie.split(';')[0];
async function as(env, login, path, init = {}) {
  const c = cookieOf(await makeSession(env, login));
  return handle(new Request(`https://analytics.flisk.si${path}`, { ...init, headers: { cookie: c, origin: 'https://analytics.flisk.si', ...(init.headers || {}) } }), env);
}

test('signed out visitors see the GitHub login, and the API says 401', async () => {
  const env = fakeEnv();
  const page = await handle(new Request('https://analytics.flisk.si/'), env);
  expect(page.status).toBe(200);
  expect(await page.text()).toContain('Continue with GitHub');
  expect((await handle(new Request('https://analytics.flisk.si/api/sites'), env)).status).toBe(401);
});

test('only logins on the list get in, even with a valid GitHub sign-in', async () => {
  const env = fakeEnv();
  expect(allowed(env, 'ODYKYI')).toBe(true);
  expect(allowed(env, 'someone')).toBe(false);
  expect(allowed({ ALLOWED_LOGINS: '' }, 'odykyi')).toBe(false);
  const cookie = cookieOf(await makeSession(env, 'someone'));
  const res = await handle(new Request('https://analytics.flisk.si/api/sites', { headers: { cookie } }), env);
  expect(res.status).toBe(401);
});

test('the OAuth callback rejects a wrong state', async () => {
  const env = fakeEnv();
  const res = await handle(new Request('https://analytics.flisk.si/auth/callback?code=c&state=bad', { headers: { cookie: 'fa_state=good' } }), env);
  expect(res.status).toBe(400);
});

test('githubLogin returns the login or null', async () => {
  const ok = async (u) => new Response(JSON.stringify(String(u).includes('access_token') ? { access_token: 't' } : { login: 'odykyi' }));
  expect(await githubLogin({}, 'c', ok)).toBe('odykyi');
  expect(await githubLogin({}, 'c', async () => new Response('{}'))).toBeNull();
});

test('cleanDomain keeps only a bare domain', () => {
  expect(cleanDomain('https://www.Flisk.sh/docs?x=1')).toBe('flisk.sh');
  expect(cleanDomain('flisk.sh')).toBe('flisk.sh');
  expect(cleanDomain('not a domain')).toBe('');
  expect(cleanDomain('localhost')).toBe('');
});

test('adding a site registers it for the signed-in owner and goes to install', async () => {
  const env = fakeEnv();
  const form = new URLSearchParams({ domain: 'https://Inference.flisk.si/' });
  const res = await as(env, 'odykyi', '/sites', { method: 'POST', body: form });
  expect(res.status).toBe(303);
  expect(res.headers.get('location')).toBe('/site/inference.flisk.si/install');
  expect(env.sites.get('inference.flisk.si')).toBe('odykyi');
});

test('adding a site from another origin is refused', async () => {
  const env = fakeEnv();
  const res = await as(env, 'odykyi', '/sites', { method: 'POST', body: new URLSearchParams({ domain: 'x.com' }), headers: { origin: 'https://evil.example' } });
  expect(res.status).toBe(403);
  expect(env.sites.has('x.com')).toBe(false);
});

test("another owner's site is a 404 and its stats are closed", async () => {
  const env = fakeEnv();
  env.sites.set('theirs.example', 'other');
  expect((await as(env, 'odykyi', '/site/theirs.example')).status).toBe(404);
  expect((await as(env, 'odykyi', '/api/stats?site=theirs.example')).status).toBe(404);
});

test('the dashboard and install pages render for an owned site, with the right snippet', async () => {
  const env = fakeEnv();
  const dash = await as(env, 'odykyi', '/site/flisk.sh');
  expect(dash.status).toBe(200);
  expect(dash.headers.get('content-security-policy')).toContain("connect-src 'self'");
  expect(await dash.text()).toContain('"flisk.sh"');
  const inst = await (await as(env, 'odykyi', '/site/flisk.sh/install')).text();
  expect(inst).toContain('data-domain=&quot;flisk.sh&quot; src=&quot;https://flisk.sh/a.js&quot;');
  expect(inst).toContain('curl -fsSL https://flisk.sh/install/jekyll | sh -s -- flisk.sh');
});

test('stats failures degrade instead of crashing the page', async () => {
  const env = fakeEnv(); // no CF token: the SQL call fails
  const sites = await as(env, 'odykyi', '/api/sites');
  expect(sites.status).toBe(200);
  const j = await sites.json();
  expect(j.sites.map((s) => s.domain).sort()).toEqual(['chat.flisk.si', 'flisk.sh']);
  expect((await as(env, 'odykyi', '/api/stats?site=flisk.sh')).status).toBe(502);
});

test('the beacon route needs no session and answers CORS', async () => {
  const env = fakeEnv();
  const pre = await handle(new Request('https://analytics.flisk.si/e', { method: 'OPTIONS' }), env);
  expect(pre.status).toBe(204);
  expect(pre.headers.get('access-control-allow-origin')).toBe('*');
});

test('the sign-in page loads our own tracker, and the CSP allows its script', async () => {
  const res = await handle(new Request('https://analytics.flisk.si/'), fakeEnv());
  const html = await res.text();
  const head = html.slice(html.indexOf('<head>'), html.indexOf('</head>'));
  expect(head).toContain('<script defer data-domain="analytics.flisk.si" src="https://flisk.sh/a.js"></script>');
  expect(res.headers.get('content-security-policy')).toMatch(/script-src [^;]*https:\/\/flisk\.sh/);
  expect(res.headers.get('content-security-policy')).toMatch(/connect-src [^;]*https:\/\/flisk\.sh/);
});

test('signed out: real pages show the login, any other address is a 404, /health is public', async () => {
  const env = fakeEnv();
  const get = (p) => handle(new Request(`https://analytics.flisk.si${p}`), env);
  for (const p of ['/', '/new', '/tokens', '/site/flisk.sh', '/site/flisk.sh/install']) expect((await get(p)).status).toBe(200);
  for (const p of ['/nonexistent-xyz', '/snippet.js', '/s.js', '/a.js']) expect((await get(p)).status).toBe(404);
  const health = await get('/health');
  expect(health.status).toBe(200);
  expect(await health.json()).toEqual({ ok: true });
});

test('dashboard chart uses whole-number axis ticks, and the sites page explains an empty search', async () => {
  const env = fakeEnv();
  const dash = await (await as(env, 'odykyi', '/')).text();
  expect(dash).toContain('No sites match');
  const chartSrc = (await import('../src/ui.js')).dashboardPage('odykyi', 'flisk.sh');
  expect(chartSrc).toContain('st*(4-k)');
  expect(chartSrc).not.toContain('Math.round(mx*(1-k/4))');
  const keys = await (await as(env, 'odykyi', '/tokens')).text();
  expect(keys).toContain('margin:24px;">Server:');
});

test('write verbs on a page route get a 405 with Allow, not the page', async () => {
  const env = fakeEnv();
  for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) {
    const res = await handle(new Request('https://analytics.flisk.si/', { method }), env);
    expect(res.status, method).toBe(405);
    expect(res.headers.get('allow'), method).toBe('GET, HEAD');
    expect(await res.text(), method).toBe('');
  }
});

test('a signed-in POST to the cabinet still gets the 405', async () => {
  const env = fakeEnv();
  for (const path of ['/', '/new', '/site/flisk.sh']) {
    const res = await as(env, 'odykyi', path, { method: 'POST' });
    expect(res.status, path).toBe(405);
    expect(res.headers.get('allow'), path).toBe('GET, HEAD');
  }
});

test('GET and HEAD on the home page still render it', async () => {
  const env = fakeEnv();
  const get = await handle(new Request('https://analytics.flisk.si/'), env);
  expect(get.status).toBe(200);
  const head = await handle(new Request('https://analytics.flisk.si/', { method: 'HEAD' }), env);
  expect(head.status).toBe(200);
});

test('the tracking beacon still takes POST', async () => {
  const env = fakeEnv();
  const res = await handle(beacon({ p: '/', e: 'pageview', d: 'flisk.sh', n: 'r' }), env);
  expect(res.status).not.toBe(405);
});

test('GET / has exactly one main landmark, signed out and signed in', async () => {
  const env = fakeEnv();
  const pages = [await (await handle(new Request('https://analytics.flisk.si/'), env)).text(), await (await as(env, 'odykyi', '/')).text()];
  for (const html of pages) {
    expect(html.match(/<main[\s>]/g)?.length).toBe(1);
    expect(html.match(/<\/main>/g)?.length).toBe(1);
  }
  const signedIn = pages[1];
  expect(signedIn.indexOf('<header class="top">')).toBeLessThan(signedIn.indexOf('<main'));
});

