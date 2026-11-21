# Flisk Analytics

Cookieless web analytics for the Flisk sites. One Cloudflare Worker, Analytics Engine for events, GitHub login. Built to stay inside the Workers Free plan.

- `public/a.js` is the tracker. It lives in the flisk.sh Jekyll repo so GitHub Pages serves it and no Worker request is spent on the script. One beacon per page per session, no cookie, nothing identifying stored.
- `scripts/install-jekyll.sh` is the one-line Jekyll installer (`curl -fsSL https://flisk.sh/install/jekyll | sh -s -- example.com`). Host it at `flisk.sh/install/jekyll`.
- `src/ingest.js` takes the beacon: drops bots, unknown sites and wrong origins, applies the daily cap, writes one Analytics Engine data point.
- The visitor's browser language (first `Accept-Language` tag, primary subtag only such as `nl`) is stored per pageview and shown in the Visitor languages tab, so you can see which languages to add per site. No schema change: Analytics Engine blobs need no migration, and it counts from the first deploy on.
- `src/stats.js` reads the dashboard numbers through the Analytics Engine SQL API and caches every answer.
- The cabinet (`src/ui.js`) is the approved Ledger design. Only the logins in `ALLOWED_LOGINS` can sign in.

## Free-plan budget

Workers Free is 100,000 requests a day for the whole account, shared with chat, fleet and inference. One counted pageview is one request. Analytics Engine free is 100,000 data points written and 10,000 SQL reads a day; the cache keeps reads far below that. D1 holds only the list of sites.

## Run and test

    bun test
    bun scripts/dev.mjs      # http://localhost:8815/dev-login, fake bindings and synthetic numbers

## Deploy (not done yet)

1. `bunx wrangler@4 d1 create analytics`, put the id in `wrangler.toml`, then `bunx wrangler@4 d1 execute analytics --remote --file schema.sql`.
2. Create a GitHub OAuth app with callback `https://analytics.flisk.si/auth/callback`, then set the secrets listed in `wrangler.toml`.
3. `bunx wrangler@4 deploy`.
4. Add `a.js` and `install/jekyll` to the website repo, add the include to its layout, check the dashboard for one real pageview, then remove Plausible and add the Growth link.

## For agents (MCP and skill)

Make a key at `/tokens`, then:

```bash
claude mcp add --transport http flisk-analytics https://analytics.flisk.si/mcp --header "Authorization: Bearer fa_<key>"
```

Tools: `list_sites`, `add_site`, `install_snippet`, `site_stats`. The same key works as `Authorization: Bearer` on `/api/sites` and `/api/stats`. Only a SHA-256 of a key is stored. A ready skill is in `skills/flisk-analytics/`.

## License

MIT, see [LICENSE](LICENSE).
