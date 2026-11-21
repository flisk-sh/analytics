import { expect, test } from 'bun:test';
import { handle } from '../src/index.js';
import { makeSession } from '../src/session.js';
import { fakeEnv } from './helpers.js';

const origin = 'https://analytics.flisk.si';
const bodyOf = async (response) => {
  const body = await response.text();
  expect(Buffer.byteLength(body)).toBeLessThan(4096);
  expect(body).toContain('<meta name="robots" content="noindex">');
  expect(body).toContain('href="/"');
  expect(body).not.toContain('Continue with GitHub');
  expect(body).not.toContain('flisk.sh/a.js');
  expect(body).not.toContain('*{box-sizing:border-box}');
  return body;
};

test('unknown paths get a small standalone 404 page', async () => {
  const res = await handle(new Request(`${origin}/nope-xyz`), fakeEnv());
  expect(res.status).toBe(404);
  await bodyOf(res);
});

test('signed-in unknown paths use the same small 404 page', async () => {
  const env = fakeEnv();
  const cookie = (await makeSession(env, 'odykyi')).split(';')[0];
  const res = await handle(new Request(`${origin}/nope-xyz`, { headers: { cookie } }), env);
  expect(res.status).toBe(404);
  await bodyOf(res);
});
