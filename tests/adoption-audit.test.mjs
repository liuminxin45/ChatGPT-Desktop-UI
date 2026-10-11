import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { auditControls } from '../scripts/audit-controls.mjs';

test('record ownership follows aliases, roles and returned class properties', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-record-audit-'));
  try {
    const source=path.join(root,'view.tsx'), styles=path.join(root,'view.css');
    fs.writeFileSync(source,'import {RecordRow as Row} from "chatgpt-desktop-kit";const styles=()=>({row:"bg-red-500 px-3"});const appearance=styles();export const view=<Row role="listitem" className={appearance.row}/>;');
    fs.writeFileSync(styles,'.records > [role = "listitem"]:nth-child(even){background:red;padding:16px}.records [role=listitem] small{color:gray}');
    assert.deepEqual(auditControls(root,[source,styles]).controlOverrides.map(row=>row.selector),['Row className','.records > [role = "listitem"]:nth-child(even)']);
    fs.writeFileSync(source,'import {RecordRow as Row} from "chatgpt-desktop-kit";export const view=<Row role="listitem" density="compact" separator className="grid gap-3"/>;');
    fs.writeFileSync(styles,'.records > [role = "listitem"]{display:grid;gap:16px}.records [role=listitem] small{color:gray}');
    assert.equal(auditControls(root,[source,styles]).controlOverrides.length,0);
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
});

test('compatibility names and browser modals cannot bypass shared UI ownership', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-audit-alias-'));
  try {
    const source = path.join(root, 'view.tsx');
    fs.writeFileSync(source, 'import {SelectControl as Choice, TabsTrigger} from "chatgpt-desktop-kit/compat/select"; export const view=<><Choice className="px-2 text-xs"/><TabsTrigger className="p-0"/></>; window.confirm("discard"); globalThis["alert"]("failed");');
    assert.deepEqual(auditControls(root, [source]).controlOverrides.map(item=>item.selector), ['Choice className','TabsTrigger className','window.confirm','globalThis.alert']);
    fs.writeFileSync(source, 'import {SelectControl} from "chatgpt-desktop-kit/compat/select"; export const view=<SelectControl size="sm" className="min-w-0 flex-1"/>;');
    assert.equal(auditControls(root, [source]).controlOverrides.length, 0);
  } finally { fs.rmSync(root, {recursive:true,force:true}); }
});
test('painted feedback cannot hide behind an arbitrary business class', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-audit-feedback-'));
  try {
    const source = path.join(root, 'view.tsx'),
      styles = path.join(root, 'view.css');
    fs.writeFileSync(
      source,
      'export const view=<div role="status" className="operation-result">Saved</div>;',
    );
    fs.writeFileSync(
      styles,
      '.operation-result{background:green;border-left:3px solid green}.field-error{color:red}',
    );
    assert.equal(auditControls(root, [source, styles]).controlOverrides[0].selector, '.operation-result');
    fs.writeFileSync(source, 'export const view=<p role="alert" className="field-error">Invalid field</p>;');
    fs.writeFileSync(styles, '.field-error{color:red}');
    const domain = auditControls(root, [source, styles]);
    assert.equal(domain.controlOverrides.length, 0);
    assert.equal(domain.exceptions.length, 0);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
test('custom floating notifications and popovers cannot bypass ownership checks', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-audit-floats-'));
  try {
    const source = path.join(root, 'view.tsx'),
      styles = path.join(root, 'view.css');
    fs.writeFileSync(
      source,
      'import {Toaster} from "sonner"; import {PopoverContent as Popup} from "@phd/ui"; export const view=<Popup className="bg-red-500 p-0"/>',
    );
    fs.writeFileSync(
      styles,
      '.dinner-toast{position:fixed;background:red;border-left:3px solid green}.people-popover{position:absolute;background:white}.business-meta{color:gray}',
    );
    const result = auditControls(root, [source, styles]);
    assert.deepEqual(
      result.controlOverrides.map((item) => item.selector),
      ['sonner import', 'Popup className', '.dinner-toast', '.people-popover'],
    );
    fs.writeFileSync(
      source,
      'import {ToastNotice,PopoverContent} from "chatgpt-desktop-kit"; export const view=<PopoverContent/>',
    );
    fs.writeFileSync(styles, '.business-meta{color:gray}');
    assert.equal(auditControls(root, [source, styles]).controlOverrides.length, 0);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
test('adoption scans pages and resolves private shared-control classes without matching descendants', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-audit-'));
  try {
    const files = {
      'pages/view.tsx':
        'import {Button as Action} from "@phd/ui"; const entryClass="entry"; const className="bg-red-500"; export const view=<Action className={entryClass}>Open</Action>;',
      'styles/view.css': '.entry {padding:0;background:red}.entry small{color:gray}.table-wrap{padding:10px}',
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
    fs.appendFileSync(path.join(root, 'styles/view.css'), '.document th,.document td{padding:0}');
    const tableStyles = auditControls(
      root,
      Object.keys(files).map((file) => path.join(root, file)),
    );
    assert.equal(tableStyles.controlOverrides.length, 2);
    assert.equal(tableStyles.controlOverrides[1].selector, '.document th,.document td');
    fs.writeFileSync(path.join(root, 'styles/view.css'), files['styles/view.css']);
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

test('navigation, metadata and semantic actions cannot bypass control ownership', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-audit-expanded-'));
  try {
    const source = path.join(root, 'view.tsx'),
      styles = path.join(root, 'view.css');
    fs.writeFileSync(
      source,
      'import {Badge as Count,AlertDialogAction,DropdownMenuItem} from "@phd/ui";export const view=<><Count className="text-xs"/><AlertDialogAction className="bg-destructive"/><DropdownMenuItem className="py-2"/><div className="absolute rounded-xl shadow-lg bg-white">Popup</div></>',
    );
    fs.writeFileSync(styles, '.trend .desktop-tabs{background:red;padding:3px;border-radius:12px}');
    const result = auditControls(root, [source, styles]);
    assert.equal(result.controlOverrides.length, 5);
    fs.writeFileSync(
      source,
      'import {AlertDialogAction,DropdownMenuItem,FloatingPanel} from "@phd/ui";export const view=<><AlertDialogAction variant="destructive"/><DropdownMenuItem variant="destructive"/><FloatingPanel className="absolute"/></>',
    );
    fs.writeFileSync(styles, '.trend{display:flex;gap:8px}');
    assert.equal(auditControls(root, [source, styles]).controlOverrides.length, 0);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
