import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createCatalog, families, root } from './component-catalog.mjs';
import { auditAdoption } from './audit-adoption.mjs';
const catalog = createCatalog();
for (const component of catalog.components)
  for (const attribute of component.nativeProps)
    assert.ok(catalog.nativeAttributes[attribute], `Missing inherited prop ${component.id}`);
for (const [family, metadata] of Object.entries(families)) {
  assert.ok(
    catalog.components.some((component) => component.family === family),
    `Empty family ${family}`,
  );
  assert.ok(fs.existsSync(path.join(root, metadata.example)), `Missing example ${family}`);
}
for (const file of ['controls.tsx', 'shell.tsx', 'client-patterns.tsx', 'conversation.tsx']) {
  const source = fs.readFileSync(path.join(root, 'src', file), 'utf8');
  assert.doesNotMatch(source, /<\w|function\s|forwardRef\s*\(/, `Implementation in stable facade: ${file}`);
}
for (const file of ['button', 'input', 'textarea', 'internal-scroll-area']) {
  const source = fs.readFileSync(path.join(root, 'src/compat', file + '.tsx'), 'utf8');
  assert.match(source, /components\//, `Adapter bypasses canonical renderer: ${file}`);
  assert.doesNotMatch(source, /<(?:button|input|textarea|div)\b/, `Duplicate native renderer: ${file}`);
}
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
assert.deepEqual(manifest.sideEffects, ['**/*.css']);
assert.ok(manifest.exports['./components/*'], 'Missing modular exports');
const adoption = auditAdoption([root], { integration: false });
assert.deepEqual(
  adoption.unreferencedExports.filter((id) => id.startsWith('chatgpt-desktop-kit:')),
  [],
  'Public components need a real composition; aliases share adoption evidence.',
);
console.log(
  JSON.stringify({
    status: 'passed',
    componentExports: catalog.components.length,
    families: Object.keys(families).length,
    stableFacades: 4,
    sharedNativeRenderers: 4,
  }),
);
