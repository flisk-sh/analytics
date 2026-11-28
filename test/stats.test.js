import { expect, test } from 'bun:test';
import { fakeCache } from './helpers.js';
import { fillBuckets, fillSeries, resolveWindow, siteLogs, sitesOverview, siteStats, validDomain } from '../src/stats.js';

const day = (n, now) => new Date(now - n * 86400e3).toISOString().slice(0, 10) + ' 00:00:00';

test('empty days are filled with zero so the chart has no holes', () => {
  const now = Date.UTC(2026, 10, 13, 15);
  const s = fillSeries([{ t: day(0, now), v: '7' }, { t: day(2, now), v: 3 }], '7d', now);
  expect(s).toHaveLength(7);
  expect(s.at(-1).v).toBe(7);
  expect(s.at(-3).v).toBe(3);
  expect(s.at(-2).v).toBe(0);
});

test('site stats: the five overview queries, then one per panel, and a second call is served from cache', async () => {
  const seen = [];
  const sql = async (q) => {
    seen.push(q);
    if (q.includes('GROUP BY k')) return [{ k: 'GitHub', v: '5' }];
    if (q.includes('GROUP BY t')) return [];
    if (q.includes('FROM (SELECT')) return [{ sessions: '10', bounces: '4', dur: '132' }];
    if (q.includes("INTERVAL '5' MINUTE")) return [{ v: '3' }];
    return [{ pv: '65', uv: '6', visits: '9' }];
  };
  const cache = fakeCache();
  const out = await siteStats({}, 'flisk.sh', '30d', ['sources'], { sql, cache });
  expect(out.current).toEqual({ visitors: 6, visits: 9, pageviews: 65, viewsPerVisit: 7.22, bounceRate: 40, duration: 132 });
  expect(out.live).toBe(3);
  expect(out.panels.sources).toEqual([{ k: 'GitHub', v: 5 }]);
  expect(seen).toHaveLength(6);
  await siteStats({}, 'flisk.sh', '30d', ['sources'], { sql, cache });
  expect(seen).toHaveLength(6); // all cached
  await siteStats({}, 'flisk.sh', '30d', ['sources', 'pages'], { sql, cache });
  expect(seen).toHaveLength(7); // only the new panel asked
  expect(seen.every((q) => q.includes("index1 = 'flisk.sh'") || q.includes('FROM ('))).toBe(true);
});

test('a refused subquery shows dashes for bounce and duration instead of failing', async () => {
  const sql = async (q) => { if (q.includes('FROM (SELECT')) throw new Error('nope'); if (q.includes('GROUP BY t')) return []; return [{ pv: 1, uv: 1, visits: 1, v: 0 }]; };
  const out = await siteStats({}, 'flisk.sh', 'today', [], { sql, cache: fakeCache() });
  expect(out.current.bounceRate).toBeNull();
  expect(out.current.duration).toBeNull();
});

test('a domain that could break out of the SQL string is refused before any query', async () => {
  let asked = 0;
  const sql = async () => { asked++; return []; };
  for (const bad of ["x' OR '1'='1", 'a b.com', 'nodot', '', "flisk.sh'--"]) {
    expect(validDomain(bad)).toBe(false);
    expect(await siteStats({}, bad, '30d', [], { sql, cache: fakeCache() })).toBeNull();
  }
  expect(await siteStats({}, 'flisk.sh', 'forever', [], { sql, cache: fakeCache() })).toBeNull();
  expect(asked).toBe(0);
});

test('the sites page asks for every site at once: one query each for visits, languages and served paths', async () => {
  const now = Date.now();
  let n = 0;
  const sql = async () => { n++; return [{ site: 'flisk.sh', t: day(0, now), v: '4' }, { site: 'flisk.sh', t: day(45, now), v: '2' }]; };
  const out = await sitesOverview({}, ['flisk.sh', 'chat.flisk.si'], { sql, cache: fakeCache() });
  expect(n).toBe(3); // not one per site
  expect(out.find((s) => s.domain === 'flisk.sh')).toMatchObject({ total: 4, previous: 2, change: 100 });
  expect(out.find((s) => s.domain === 'chat.flisk.si')).toMatchObject({ total: 0, change: null });
  expect(out[0].days).toHaveLength(30);
});

test('the themes panel reads blob13, skips empty themes and is accepted like campaigns', async () => {
  const seen = [];
  const sql = async (q) => { seen.push(q); return q.includes('GROUP BY k') ? [{ k: 'ivory', v: '4' }] : q.includes('GROUP BY t') ? [] : q.includes('FROM (SELECT') ? [] : [{ pv: '1', uv: '1', visits: '1', v: '1' }]; };
  const out = await siteStats({}, 'chat.flisk.si', '7d', ['themes', 'campaigns'], { sql, cache: fakeCache() });
  expect(out.panels.themes).toEqual([{ k: 'ivory', v: 4 }]);
  const q = seen.find((x) => x.includes('blob13 AS k'));
  expect(q).toContain("blob13 != ''");
});

test('resolveWindow: presets, custom windows rounded to hours, auto step, the by override and bad input', () => {
  const now = Date.UTC(2026, 10, 17, 12, 30);
  expect(resolveWindow({ range: '7d' }, now).step).toBe('DAY');
  expect(resolveWindow({ range: '7d', by: 'hour' }, now).count).toBe(168);
  expect(resolveWindow({ range: 'nope' }, now)).toBeNull();
  const h = resolveWindow({ from: Date.UTC(2026, 10, 15, 3, 20), to: Date.UTC(2026, 10, 16, 5, 10) }, now);
  expect(h.step).toBe('HOUR');
  expect(h.from).toBe(Date.UTC(2026, 10, 15, 3));
  expect(h.to).toBe(Date.UTC(2026, 10, 16, 6));
  expect(h.count).toBe(27);
  expect(resolveWindow({ from: now - 60 * 86400e3, to: now }, now).step).toBe('DAY');
  expect(resolveWindow({ from: now - 200 * 86400e3, to: now }, now).step).toBe('WEEK');
  expect(resolveWindow({ from: now, to: now - 86400e3 }, now)).toBeNull();
  expect(resolveWindow({ from: now - 500 * 86400e3, to: now }, now)).toBeNull();
  expect(resolveWindow({ range: '12m', by: 'hour' }, now).step).not.toBe('HOUR'); // too many buckets, coarsened
});

test('fillBuckets carries visitors, visits and pageviews per bucket', () => {
  const now = Date.UTC(2026, 10, 17, 12);
  const s = fillBuckets([{ t: '2026-11-17 12:00:00', v: '4', pv: '9', vs: '5' }], 'HOUR', 3, now);
  expect(s).toHaveLength(3);
  expect(s.at(-1)).toMatchObject({ v: 4, pv: 9, vs: 5 });
  expect(s[0]).toMatchObject({ v: 0, pv: 0, vs: 0 });
});

test('weekly buckets keep Monday labels even in weeks without traffic', () => {
  const friday = Date.UTC(2027, 0, 8, 12);
  const rows = [{ t: '2026-12-21 00:00:00', v: 2 }, { t: '2027-01-04 00:00:00', v: 5 }];
  expect(fillBuckets(rows, 'WEEK', 3, friday).map(({ t, v }) => [t, v])).toEqual([
    ['2026-12-21 00:00:00', 2],
    ['2026-12-28 00:00:00', 0],
    ['2027-01-04 00:00:00', 5],
  ]);
});

test('a weekly window includes both partial weeks but excludes a Monday end boundary', () => {
  const from = Date.UTC(2027, 0, 3, 23);
  const monday = Date.UTC(2027, 0, 4);
  const to = monday + 3600e3;
  expect(resolveWindow({ from, to, by: 'week' }, to).count).toBe(2);
  expect(resolveWindow({ from, to: monday, by: 'week' }, to).count).toBe(1);
});

test('the yearly series covers the oldest partial week', () => {
  const friday = Date.UTC(2027, 0, 8, 12);
  const series = fillSeries([{ t: '2026-01-05 00:00:00', v: 3 }], '12m', friday);
  expect(series).toHaveLength(53);
  expect(series[0]).toMatchObject({ t: '2026-01-05 00:00:00', v: 3 });
});

test('siteLogs: newest events, kind filter, limit clamp, cache, bad domain', async () => {
  const seen = [];
  const sql = async (q) => { seen.push(q); return [{ t: '2026-11-17 10:00:00', kind: 'click', path: '/', target: 'x.com/a', source: 'GitHub', country: 'DE', city: 'Berlin', browser: 'Chrome', os: 'macOS', device: 'Desktop', visitor: 'abcdef0123456789' }]; };
  const cache = fakeCache();
  const ev = await siteLogs({}, 'flisk.sh', { limit: 9999, kind: 'click' }, { sql, cache });
  expect(ev[0]).toMatchObject({ t: '2026-11-17T10:00:00Z', kind: 'click', target: 'x.com/a', visitor: 'abcdef' });
  expect(seen[0]).toContain("blob14 = 'click'");
  expect(seen[0]).toContain('LIMIT 200');
  await siteLogs({}, 'flisk.sh', { limit: 9999, kind: 'click' }, { sql, cache });
  expect(seen).toHaveLength(1);
  expect(await siteLogs({}, "x'; DROP", {}, { sql, cache })).toBeNull();
});
