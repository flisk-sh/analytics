import { readFileSync } from 'node:fs';

// Wrangler keeps local secrets in .dev.vars; node_modules is never source.
const PATHS = ['node_modules/', '.dev.vars', '.wrangler/'];
// Read .gitignore directly instead of spawning git: no PATH lookup, no child process.
const lines = new Set(
  readFileSync(new URL('../.gitignore', import.meta.url), 'utf8')
    .split('\n')
    .map((l) => l.trim().replace(/^\//, ''))
    .filter((l) => l && !l.startsWith('#')),
);
const missing = PATHS.filter((p) => !lines.has(p) && !lines.has(p.replace(/\/$/, '')));
if (missing.length) {
  console.error(`.gitignore does not ignore: ${missing.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`.gitignore covers ${PATHS.join(', ')}`);
}
