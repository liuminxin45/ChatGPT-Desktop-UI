import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

assert.equal(
  process.platform,
  'win32',
  'This measured system-font baseline uses Windows/Edge. Other platforms run geometry and accessibility gates.',
);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'tests/output/package-contract');
const baseline = path.join(root, 'tests/visual-baseline/windows-edge');
const update = process.argv.includes('--update');
const report = JSON.parse(await fs.readFile(path.join(source, 'report.json'), 'utf8'));
assert.equal(report.status, 'passed');
await fs.mkdir(baseline, { recursive: true });
const results = [];
const names = ['light', 'dark'].flatMap((theme) => [
  ...[
    [1920, 1],
    [1280, 1],
    [1024, 1.25],
  ].map(([width, scale]) => `${theme}-${width}-${scale}.png`),
  `calendar-${theme}.png`,
]);
for (const name of names) {
  const actualPath = path.join(source, name);
  const expectedPath = path.join(baseline, name);
  if (update) {
    await fs.copyFile(actualPath, expectedPath);
    results.push({ name, baseline: 'reviewed initial capture' });
    continue;
  }
  const actual = PNG.sync.read(await fs.readFile(actualPath));
  const expected = PNG.sync.read(await fs.readFile(expectedPath));
  assert.equal(actual.width, expected.width, name);
  assert.equal(actual.height, expected.height, name);
  const diff = new PNG({ width: actual.width, height: actual.height });
  const changed = pixelmatch(expected.data, actual.data, diff.data, actual.width, actual.height, {
    threshold: 0.1,
    includeAA: false,
  });
  const ratio = changed / (actual.width * actual.height);
  if (ratio > 0.002) await fs.writeFile(path.join(source, 'diff-' + name), PNG.sync.write(diff));
  results.push({ name, changed, ratio });
  assert.ok(
    ratio <= 0.002,
    `${name}: ${changed} pixels differ (${(ratio * 100).toFixed(3)}%). Review diff; never auto-update CI baselines.`,
  );
}
await fs.writeFile(
  path.join(source, 'visual-report.json'),
  JSON.stringify(
    { status: 'passed', update, platform: 'windows-edge', threshold: 0.1, maxChangedRatio: 0.002, results },
    null,
    2,
  ),
);
console.log(JSON.stringify({ status: 'passed', update, cases: results.length }));
