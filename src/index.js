import { allowed, githubAuthorizeUrl, githubLogin } from './auth.js';
import { clearSession, makeSession, readSession, sameOrigin } from './session.js';
import { CORS, handleBeacon } from './ingest.js';
import { DEFAULT_PANELS, siteLogs, siteStats, sitesOverview, validDomain } from './stats.js';
import { dashboardPage, installPage, loginPage, messagePage, newSitePage, sitesPage, tokensPage } from './ui.js';
import { addSite, cleanDomain, listDomains, ownerOf } from './sites.js';
import { bearerLogin, createToken, listTokens, revokeToken } from './tokens.js';
import { mcpResponse } from './mcp.js';
import { publicFile } from './public-files.js';
import { notFoundPage } from './not-found.js';
import { withSecurityHeaders } from './security-headers.js';

export { cleanDomain };

const SECURITY = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'same-origin',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-security-policy': "default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'unsafe-inline' https://flisk.si https://flisk.sh https://flisk.sh; img-src 'self' data: https:; form-action 'self'; connect-src 'self' https://flisk.sh https://flisk.sh; frame-ancestors 'none'; base-uri 'none'",
};
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
const html = (body, status = 200) => new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', ...SECURITY } });
const redirect = (location, cookie) => { const h = new Headers({ location }); if (cookie) for (const c of [].concat(cookie)) h.append('set-cookie', c); return new Response(null, { status: 303, headers: h }); };

const STATE = 'fa_state';
const PAGES = /^\/(new|tokens|sites|site\/[^/]+(\/install)?)?$/;
// Pages that only ever read. `/sites` and `/tokens` also take a POST.
const READ_ONLY_PAGES = /^\/(new|site\/[^/]+(\/install)?)?$/;
const cookieOf = (request, name) => new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(request.headers.get('cookie') || '')?.[1] || '';

export async function handle(request, env) {
  return withSecurityHeaders(await route(request, env));
}

async function route(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // A page route only reads. Answer write verbs with 405 instead of rendering
  // the page with a 200, so a script posting to the wrong address cannot look
  // like it worked.
  if (method !== 'GET' && method !== 'HEAD' && READ_ONLY_PAGES.test(path)) {
    return new Response(null, { status: 405, headers: { allow: 'GET, HEAD', ...SECURITY } });
  }

  // The beacon first: it is the hot path and needs no session.
  if (path === '/e') {
    if (method === 'POST' || method === 'OPTIONS') return handleBeacon(request, env);
    return new Response(null, { status: 405, headers: CORS });
  }
  if (path === '/health') return json(200, { ok: true });
  const file = publicFile(path, method, env.PUBLIC_ORIGIN || url.origin);
  if (file) return file;

  if (path === '/auth/login') {
    const state = crypto.randomUUID();
    return redirect(githubAuthorizeUrl(env, state), `${STATE}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  }
  if (path === '/auth/callback') {
    const state = url.searchParams.get('state') || '';
    const code = url.searchParams.get('code') || '';
    if (!code || !state || state !== cookieOf(request, STATE)) return html(loginPage('Sign-in expired. Try again.'), 400);
    const login = await githubLogin(env, code).catch(() => null);
    if (!login) return html(loginPage('GitHub did not sign you in. Try again.'), 400);
    if (!allowed(env, login)) return html(loginPage(`${login} is not on the list yet.`), 403);
    return redirect('/', [await makeSession(env, login), `${STATE}=; Path=/; Max-Age=0`]);
  }
  if (path === '/logout' && method === 'POST') {
    if (!sameOrigin(request, env.PUBLIC_ORIGIN)) return html(messagePage('Not allowed', 'Sign out from the cabinet.'), 403);
    return redirect('/', clearSession());
  }

  // Agents send `Authorization: Bearer fa_...` to /mcp and /api/*; people use the GitHub session cookie.
  const isApi = path.startsWith('/api/');
  if (path === '/mcp') {
    const who = await bearerLogin(env, request);
    return who ? mcpResponse(request, env, who) : json(401, { error: 'send Authorization: Bearer <key>. Make a key at /tokens.' });
  }
  const session = await readSession(env, request);
  const bearer = isApi && !session ? await bearerLogin(env, request) : '';
  if (!bearer && (!session || !allowed(env, session.login))) {
    if (isApi) return json(401, { error: 'sign in' });
    // Only real pages show the sign-in; any other address is a plain 404.
    return PAGES.test(path) ? html(loginPage()) : html(notFoundPage(), 404);
  }
  const login = bearer || session.login;

  if (path === '/' && (method === 'GET' || method === 'HEAD')) return html(sitesPage(login));
  if (path === '/new' && method === 'GET') return html(newSitePage(login));
  if (path === '/sites' && method === 'POST') {
    if (!sameOrigin(request, env.PUBLIC_ORIGIN)) return html(messagePage('Not allowed', 'Add sites from the cabinet.', login), 403);
    const r = await addSite(env, login, (await request.formData().catch(() => null))?.get('domain'));
    if (r.error) return html(newSitePage(login, r.error), r.status);
    const domain = r.domain;
    return redirect(`/site/${domain}/install`);
  }

  if (path === '/tokens' && method === 'GET') return html(tokensPage(login, await listTokens(env, login)));
  if (path === '/tokens' && method === 'POST') {
    if (!sameOrigin(request, env.PUBLIC_ORIGIN)) return html(messagePage('Not allowed', 'Make keys from the cabinet.', login), 403);
    const form = await request.formData().catch(() => null);
    if (form?.get('revoke')) { await revokeToken(env, login, String(form.get('revoke'))); return redirect('/tokens'); }
    const made = await createToken(env, login, form?.get('label'));
    return html(tokensPage(login, await listTokens(env, login), made));
  }

  const m = /^\/site\/([^/]+)(\/install)?$/.exec(path);
  if (m && method === 'GET') {
    const domain = decodeURIComponent(m[1]);
    if (!validDomain(domain) || (await ownerOf(env, domain)) !== login) return html(messagePage('Site not found', 'It is not in your list.', login), 404);
    return html(m[2] ? installPage(login, domain) : dashboardPage(login, domain));
  }

  if (path === '/api/sites' && method === 'GET') {
    const domains = await listDomains(env, login);
    try {
      return json(200, { sites: await sitesOverview(env, domains) });
    } catch {
      return json(200, { sites: domains.map((domain) => ({ domain, total: 0, previous: 0, change: null, days: Array(30).fill(0) })), note: 'stats unavailable' });
    }
  }
  if (path === '/api/stats' && method === 'GET') {
    const site = url.searchParams.get('site') || '';
    if (!validDomain(site) || (await ownerOf(env, site)) !== login) return json(404, { error: 'site not found' });
    const parts = (url.searchParams.get('parts') ?? DEFAULT_PANELS.join(',')).split(',').filter(Boolean);
    try {
      const q = url.searchParams;
      const out = await siteStats(env, site, q.get('range') || '30d', parts, { from: q.get('from') ?? undefined, to: q.get('to') ?? undefined, by: q.get('by') ?? undefined });
      return out ? json(200, out) : json(400, { error: 'bad range' });
    } catch {
      return json(502, { error: 'stats unavailable' });
    }
  }
  if (path === '/api/logs' && method === 'GET') {
    const site = url.searchParams.get('site') || '';
    if (!validDomain(site) || (await ownerOf(env, site)) !== login) return json(404, { error: 'site not found' });
    try {
      return json(200, { site, events: await siteLogs(env, site, { limit: url.searchParams.get('limit') || 50, kind: url.searchParams.get('kind') || '' }) });
    } catch {
      return json(502, { error: 'logs unavailable' });
    }
  }
  return html(notFoundPage(), 404);
}

export default { fetch: (request, env) => handle(request, env) };
