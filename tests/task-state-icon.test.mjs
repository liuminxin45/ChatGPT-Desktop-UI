import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { transformSync } from 'esbuild';
const require = createRequire(import.meta.url);
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const compiled = { exports: {} };
new Function('require', 'module', 'exports', transformSync(fs.readFileSync(new URL('../src/task-state-icon.tsx', import.meta.url), 'utf8'), { loader: 'tsx', format: 'cjs', jsx: 'automatic' }).code)(require, compiled, compiled.exports);
const render = props => renderToStaticMarkup(createElement(compiled.exports.TaskStateIcon, props));
test('task states retain distinct shapes and excluded variants retain their base state', () => {
  const states = ['not-started', 'in-progress', 'paused', 'completed', 'cancelled', 'unknown'];
  const shapes = states.map(state => render({ state }));
  assert.equal(new Set(shapes).size, states.length);
  for (const svg of shapes) { assert.match(svg, /width="16"/); assert.match(svg, /aria-hidden="true"/); }
  assert.match(shapes[0], /stroke-dasharray="2 3"/);
  for (const state of ['in-progress', 'completed']) {
    const excluded = render({ state, excludedFromStats: true });
    assert.match(excluded, new RegExp('desktop-task-state--' + state));
    assert.match(excluded, /data-excluded="true"/);
    assert.match(excluded, /M17 19h4/);
  }
});
