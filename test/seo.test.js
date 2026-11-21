import { expect, test } from 'bun:test';
import { handle } from '../src/index.js';
import { fakeEnv } from './helpers.js';

const home = async () => {
  const res = await handle(new Request('https://analytics.flisk.si/'), fakeEnv());
  const html = await res.text();
  return html.slice(0, html.indexOf('</head>'));
};

test('home page has a canonical link to the site', async () => {
  expect(await home()).toContain('<link rel="canonical" href="https://analytics.flisk.si/">');
});

test('home page has Open Graph title, description, URL and image', async () => {
  const head = await home();
  for (const name of ['og:title', 'og:description', 'og:url', 'og:image']) expect(head).toContain(`property="${name}"`);
  expect(head).toContain('content="https://analytics.flisk.si/"');
  expect(head).toMatch(/property="og:image" content="https:\/\/[^"]+\.(png|jpg|webp)"/);
});

test('home page has a Twitter card', async () => {
  expect(await home()).toMatch(/<meta name="twitter:card" content="summary(?:_large_image)?">/);
});
