// Flisk's existing icon: https://github.com/flisk-sh/flisk.si/blob/main/assets/favicon.svg
const FAVICON = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"64\" height=\"64\" viewBox=\"0 0 64 64\">\n  <defs>\n    <linearGradient id=\"bg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#040A12\"/>\n      <stop offset=\"0.6\" stop-color=\"#07131D\"/>\n      <stop offset=\"1\" stop-color=\"#0B2A22\"/>\n    </linearGradient>\n    <linearGradient id=\"bolt\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#6EE7A0\"/>\n      <stop offset=\"1\" stop-color=\"#22C55E\"/>\n    </linearGradient>\n  </defs>\n  <rect width=\"64\" height=\"64\" rx=\"14\" fill=\"url(#bg)\"/>\n  <g transform=\"translate(32 32) scale(0.6) translate(-276 -91)\">\n    <polygon points=\"283,50 252,98 273,98 261,132 300,82 278,82\" fill=\"url(#bolt)\"/>\n  </g>\n</svg>\n";
const TYPES = {
  '/favicon.ico': 'image/svg+xml',
  '/sitemap.xml': 'application/xml; charset=utf-8',
  '/llms.txt': 'text/plain; charset=utf-8',
  '/robots.txt': 'text/plain; charset=utf-8',
  '/.well-known/security.txt': 'text/plain; charset=utf-8',
};

export function publicFile(path, method, origin) {
  if (!Object.hasOwn(TYPES, path)) return null;
  if (method !== 'GET' && method !== 'HEAD') return new Response(null, { status: 405, headers: { allow: 'GET, HEAD' } });
  const home = new URL('/', origin).href;
  const bodies = {
    '/favicon.ico': FAVICON,
    '/sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${home}</loc></url></urlset>
`,
    '/llms.txt': `# Flisk Analytics

Cookieless web analytics for the Flisk sites, using a Cloudflare Worker and Analytics Engine.

- [Sign in](${home}): GitHub sign-in is limited to allowed logins; dashboards and site data are private.
- [Source and setup](https://github.com/flisk-sh/analytics): tracker installation and local development.
- MCP: ${home}mcp. Requires Authorization: Bearer <key>, made in the signed-in cabinet at /tokens.
- Authenticated tools: list_sites, add_site, install_snippet, site_stats. The same key works on /api/sites and /api/stats.
`,
    '/robots.txt': `User-agent: *
Disallow: /
Sitemap: ${home}sitemap.xml
`,
    '/.well-known/security.txt': `Contact: mailto:security@flisk.si
Expires: 2027-01-01T00:00:00.000Z
Preferred-Languages: en
Canonical: ${home}.well-known/security.txt
`,
  };
  return new Response(method === 'HEAD' ? null : bodies[path], {
    headers: { 'content-type': TYPES[path], 'cache-control': 'public, max-age=3600', 'x-content-type-options': 'nosniff' },
  });
}
