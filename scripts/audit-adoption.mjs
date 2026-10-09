import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
import { createCatalog, root } from './component-catalog.mjs';
import { checkConsumer } from './check-consumer.mjs';

const sourceRoots = ['src', 'app', 'components', 'hooks', 'lib', 'tools', 'packages', 'examples'];
const excluded = /^(?:node_modules|artifacts|build|dist|release|\.next|\.git|coverage|output|__fixtures__)$/;
function filesIn(directory) {
  const files = [];
  if (!fs.existsSync(directory)) return files;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory() && !excluded.test(entry.name)) files.push(...filesIn(file));
    else if (entry.isFile() && /\.(?:tsx?|jsx?)$/.test(entry.name) && !entry.name.endsWith('.d.ts'))
      files.push(file);
  }
  return files;
}
function moduleFor(specifier, file, directory, contract) {
  if (specifier === 'chatgpt-desktop-kit' || specifier.startsWith('chatgpt-desktop-kit/compat/'))
    return specifier;
  const relative = specifier.startsWith('.')
    ? path.resolve(path.dirname(file), specifier)
    : specifier.startsWith('@/')
      ? path.resolve(directory, specifier.slice(2))
      : null;
  if (directory === root && relative) {
    if (relative === path.join(root, 'src') || relative === path.join(root, 'src/index'))
      return 'chatgpt-desktop-kit';
    if (relative.startsWith(path.join(root, 'src/compat') + path.sep))
      return 'chatgpt-desktop-kit/compat/' + path.basename(relative).replace(/\.tsx?$/, '');
  }
  for (const adapter of contract.adapterManifests || []) {
    if (JSON.parse(fs.readFileSync(path.join(directory, adapter), 'utf8')).name === specifier)
      return 'chatgpt-desktop-kit';
  }
  if (relative)
    for (const forwarder of contract.forwarders || []) {
      const target = path.join(directory, forwarder);
      if (target.replace(/\.tsx?$/, '') === relative.replace(/\.tsx?$/, '')) {
        return fs
          .readFileSync(target, 'utf8')
          .match(/from\s+['"](chatgpt-desktop-kit(?:\/[^'"]+)?)['"]/)?.[1];
      }
    }
  return null;
}
export function auditAdoption(directories, { integration = true } = {}) {
  const catalog = createCatalog();
  const expectedVersion = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
  const usage = new Map(catalog.components.map((component) => [component.id, []]));
  const consumers = [];
  for (const directory of directories.map((value) => path.resolve(value))) {
    const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
    const contractFile = path.join(directory, 'ui.integration.json');
    const contract = fs.existsSync(contractFile) ? JSON.parse(fs.readFileSync(contractFile, 'utf8')) : {};
    const integrationResult =
      directory === root || !integration ? undefined : checkConsumer(directory, { version: expectedVersion });
    let importedComponents = 0;
    const inputs = sourceRoots.flatMap((folder) => filesIn(path.join(directory, folder)));
    for (const file of inputs) {
      const tree = ts.createSourceFile(
        file,
        fs.readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        /\.tsx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );
      const referenced = new Set();
      const visit = (node) => {
        if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
        if (ts.isIdentifier(node)) referenced.add(node.text);
        ts.forEachChild(node, visit);
      };
      visit(tree);
      for (const node of tree.statements.filter(ts.isImportDeclaration)) {
        if (node.importClause?.isTypeOnly) continue;
        const module = moduleFor(node.moduleSpecifier.text, file, directory, contract);
        if (!module) continue;
        const bindings = node.importClause?.namedBindings;
        if (bindings && ts.isNamedImports(bindings))
          for (const binding of bindings.elements) {
            if (binding.isTypeOnly || !referenced.has(binding.name.text)) continue;
            const id = `${module}:${binding.propertyName?.text || binding.name.text}`;
            if (usage.has(id)) {
              usage.get(id).push({
                consumer: manifest.name,
                file: path.relative(directory, file).replaceAll('\\', '/'),
              });
              importedComponents++;
            }
          }
      }
    }
    consumers.push({
      name: manifest.name,
      sourceFiles: inputs.length,
      componentImports: importedComponents,
      integration: integrationResult,
    });
  }
  // Alias exports share implementation and adoption evidence; do not count aliases as dead controls.
  for (const component of catalog.components) {
    if (component.aliasOf && usage.has(component.aliasOf)) {
      const combined = [...usage.get(component.id), ...usage.get(component.aliasOf)];
      usage.set(component.id, combined);
      usage.set(component.aliasOf, combined);
    }
  }
  const components = catalog.components.map(({ id, name, importPath, family, aliasOf }) => ({
    id,
    name,
    importPath,
    family,
    aliasOf,
    usage: usage.get(id),
  }));
  return {
    schemaVersion: 1,
    status:
      consumers.some((item) => item.integration?.status === 'failed' || !item.componentImports) ||
      new Set(consumers.map((item) => item.integration?.revision).filter(Boolean)).size > 1
        ? 'failed'
        : 'passed',
    consumers,
    components,
    unreferencedExports: components.filter((item) => !item.usage.length).map((item) => item.id),
  };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directories = process.argv.slice(2).filter((value) => !value.startsWith('--'));
  const report = auditAdoption([root, ...directories], {
    integration: !process.argv.includes('--source-only'),
  });
  const output = path.join(root, 'artifacts/adoption.json');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(
    JSON.stringify(
      {
        status: report.status,
        consumers: report.consumers,
        unreferencedExports: report.unreferencedExports,
        report: 'artifacts/adoption.json',
      },
      null,
      2,
    ),
  );
  if (report.status !== 'passed') process.exitCode = 1;
}
