import { execFileSync } from 'node:child_process';

// Wrangler keeps local secrets in .dev.vars; node_modules is never source.
const PATHS = ['node_modules/', '.dev.vars', '.wrangler/'];
const missing = [];
for (const path of PATHS) {
  try {
    execFileSync('git', ['check-ignore', '-q', path], { stdio: 'ignore' });
  } catch {
    missing.push(path);
  }
}
if (missing.length) {
  console.error(`.gitignore does not ignore: ${missing.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`.gitignore covers ${PATHS.join(', ')}`);
}
