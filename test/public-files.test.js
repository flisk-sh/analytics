import { expect, test } from 'bun:test';
import { handle } from '../src/index.js';

const get = (path, init = {}, env = {}) => handle(new Request(`https://analytics.flisk.si${path}`, init), env);

test('the public favicon is the Flisk SVG, without sign-in or external requests', async () => {
  const res = await get('/favicon.ico');
  expect(res.status).toBe(200);
  expect(res.headers.get('content-type')).toBe('image/svg+xml');
  expect(await res.text()).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
});

test('the sitemap lists only the public landing page', async () => {
  const res = await get('/sitemap.xml');
  expect(res.status).toBe(200);
  expect(res.headers.get('content-type')).toBe('application/xml; charset=utf-8');
  const xml = await res.text();
  expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  expect(xml.match(/<loc>.*?<\/loc>/g)).toEqual(['<loc>https://analytics.flisk.si/</loc>']);
});

test('llms.txt describes the service and its authenticated tools', async () => {
  const res = await get('/llms.txt');
  expect(res.status).toBe(200);
  expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
  const text = await res.text();
  expect(text).toContain('# Flisk Analytics');
  expect(text).toContain('https://analytics.flisk.si/');
  expect(text).toContain('/mcp');
  expect(text).toContain('Bearer');
});

test('robots.txt references the sitemap and keeps the cabinet disallowed', async () => {
  const res = await get('/robots.txt');
  expect(res.status).toBe(200);
  expect(await res.text()).toBe('User-agent: *\nDisallow: /\nSitemap: https://analytics.flisk.si/sitemap.xml\n');
});

test('/.well-known/security.txt publishes a contact and a future expiry', async () => {
  const res = await get('/.well-known/security.txt');
  expect(res.status).toBe(200);
  expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
  expect(res.headers.get('cache-control')).toBe('public, max-age=3600');
  const text = await res.text();
  expect(text).toContain('Contact: mailto:security@flisk.si');
  expect(text).toMatch(/^Expires: \d{4}-\d{2}-\d{2}T/m);
  expect(new Date(/^Expires: (.*)$/m.exec(text)[1]).getTime()).toBeGreaterThan(Date.now());
  expect(text).toContain('Canonical: https://analytics.flisk.si/.well-known/security.txt');
});

test.each(['/favicon.ico', '/sitemap.xml', '/llms.txt', '/robots.txt', '/.well-known/security.txt'])('HEAD %s keeps GET headers with no body', async (path) => {
  const getRes = await get(path);
  const head = await get(path, { method: 'HEAD' });
  expect(head.status).toBe(200);
  expect([...head.headers]).toEqual([...getRes.headers]);
  expect(head.headers.get('cache-control')).toBe('public, max-age=3600');
  expect(head.headers.get('x-content-type-options')).toBe('nosniff');
  expect(await head.text()).toBe('');
});

test.each(['/favicon.ico', '/sitemap.xml', '/llms.txt', '/robots.txt', '/.well-known/security.txt'])('POST %s is refused', async (path) => {
  const res = await get(path, { method: 'POST' });
  expect(res.status).toBe(405);
  expect(res.headers.get('allow')).toBe('GET, HEAD');
});

test.each(['https://public.example', 'https://public.example/'])('site files follow configured origin %s', async (origin) => {
  const env = { PUBLIC_ORIGIN: origin };
  expect(await (await get('/sitemap.xml', {}, env)).text()).toContain('<loc>https://public.example/</loc>');
  expect(await (await get('/robots.txt', {}, env)).text()).toContain('Sitemap: https://public.example/sitemap.xml\n');
  expect(await (await get('/llms.txt', {}, env)).text()).toContain('https://public.example/');
});
