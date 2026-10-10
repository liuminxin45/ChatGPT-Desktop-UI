import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { auditControls } from '../scripts/audit-controls.mjs';
test('adoption scans pages and resolves private shared-control classes without matching descendants', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-audit-'));
  try {
    const files = {
      'pages/view.tsx':
        'import {Button as Action} from "@phd/ui"; const entryClass="entry"; const className="bg-red-500"; export const view=<Action className={entryClass}>Open</Action>;',
      'styles/view.css': '.entry {padding:0;background:red}.entry small{color:gray}',
      'tools/other/style.css': '.entry {background:blue}',
      'pages/files.tsx': 'export const view=<input type="file" hidden/>;',
    };
    for (const [file, source] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      fs.writeFileSync(path.join(root, file), source);
    }
    const result = auditControls(
      root,
      Object.keys(files).map((file) => path.join(root, file)),
    );
    assert.equal(result.nativeControls.length, 0);
    assert.equal(result.controlOverrides.length, 1);
    assert.equal(result.controlOverrides[0].selector, '.entry');
    assert.equal(result.exceptions.length, 1);
    fs.writeFileSync(
      path.join(root, 'pages/view.tsx'),
      'import {Button as Action} from "@phd/ui"; const entryClass="entry px-0 text-[11px]"; export const view=<Action className={entryClass}>Open</Action>;',
    );
    const inline = auditControls(
      root,
      Object.keys(files).map((file) => path.join(root, file)),
    );
    assert.equal(inline.controlOverrides.length, 2);
    assert.deepEqual(
      inline.controlOverrides.find((item) => item.selector === 'Action className').properties,
      ['px-0', 'text-[11px]'],
    );
    fs.writeFileSync(path.join(root, 'pages/view.tsx'), files['pages/view.tsx']);
    fs.writeFileSync(
      path.join(root, 'styles/view.css'),
      '/* desktop-ui-exception .entry: Semantic timeline cells require grid boundaries. */\n.entry{padding:0}',
    );
    const accepted = auditControls(
      root,
      Object.keys(files).map((file) => path.join(root, file)),
    );
    assert.equal(accepted.controlOverrides.length, 0);
    assert.equal(
      accepted.exceptions.find((item) => item.tag === 'css').reason,
      'Semantic timeline cells require grid boundaries.',
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
