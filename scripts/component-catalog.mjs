import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slash = (value) => value.replaceAll('\\', '/');
export const families = {
  actions: {
    description: 'Buttons, icon actions and floating launchers.',
    states: 'idle, hover, focus, disabled, icon-only',
    example: 'examples/catalog/Examples.tsx',
  },
  forms: {
    description: 'Text entry and selection with Host-controlled values.',
    states: 'empty, populated, disabled, invalid, IME',
    example: 'examples/catalog/Examples.tsx',
  },
  navigation: {
    description: 'Keyboard-operable tabs with stable action IDs.',
    states: 'selected, disabled, keyboard focus',
    example: 'examples/gallery/App.tsx',
  },
  layout: {
    description: 'Full-width workspaces and contextual action rows.',
    states: 'compact, wide, overflow',
    example: 'examples/catalog/Examples.tsx',
  },
  overlays: {
    description: 'Menus and guarded dialogs; Host owns intent and draft.',
    states: 'open, closed, collision, Escape, focus return',
    example: 'examples/catalog/Examples.tsx',
  },
  lists: {
    description: 'Internal scrolling and bounded dynamic-size lists.',
    states: 'empty, long, restored anchor',
    example: 'examples/gallery/App.tsx',
  },
  feedback: {
    description: 'Empty, failure, loading and rich content presentation.',
    states: 'loading, empty, failure, recovery',
    example: 'examples/catalog/Examples.tsx',
  },
  shell: {
    description: 'Portable shell and grouped settings navigation.',
    states: 'selected, pinned, collapsed, filtered',
    example: 'examples/gallery/App.tsx',
  },
  client: {
    description: 'Measured Windows client profile, retained disclosures and menus.',
    states: 'selected, collapsed, submenu, grouped settings',
    example: 'examples/demo/ClientDemo.tsx',
  },
  conversation: {
    description: 'Controlled work/chat composer and message geometry.',
    states: 'empty, draft, multiline, sending, stopped',
    example: 'examples/demo/ClientChat.tsx',
  },
  runtime: {
    description: 'Theme, localization, input confirmation and fixed-size virtualization.',
    states: 'light, dark, system, IME, retained state',
    example: 'examples/catalog/Examples.tsx',
  },
  compat: {
    description: 'Compound Radix and Tailwind adapters over shared controls/tokens.',
    states: 'controlled, disabled, keyboard, hidden Surface',
    example: 'examples/catalog/CompatExamples.tsx',
  },
};

export function createCatalog() {
  const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile).config;
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root);
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const checker = program.getTypeChecker();
  const entries = [];
  const modules = [
    'src/index.ts',
    ...fs
      .readdirSync(path.join(root, 'src/compat'))
      .filter((name) => /\.tsx$/.test(name))
      .map((name) => 'src/compat/' + name),
  ];
  for (const entry of modules) {
    const source = program.getSourceFile(path.join(root, entry));
    const module = checker.getSymbolAtLocation(source);
    const importPath =
      entry === 'src/index.ts'
        ? 'chatgpt-desktop-kit'
        : 'chatgpt-desktop-kit/compat/' + path.basename(entry, '.tsx');
    for (const exported of checker.getExportsOfModule(module)) {
      const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      if (!(symbol.flags & ts.SymbolFlags.Value) || !/^[A-Z]/.test(exported.name)) continue;
      const declaration = symbol.valueDeclaration || symbol.declarations?.[0];
      if (!declaration || declaration.getSourceFile().fileName.includes('node_modules')) continue;
      const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
      const signature = type.getCallSignatures()[0];
      if (!signature || !signature.parameters.length) continue;
      const implementation = slash(path.relative(root, declaration.getSourceFile().fileName));
      if (implementation === 'src/navigation.tsx') continue; // Icon API has its own ownership contract.
      const family = entry.includes('/compat/')
        ? 'compat'
        : implementation.match(/components\/([^/]+)/)?.[1] ||
          ({
            'src/shell.tsx': 'shell',
            'src/client-patterns.tsx': 'client',
            'src/conversation.tsx': 'conversation',
          }[implementation] ??
            'runtime');
      if (!families[family]) throw Error(`Unregistered family: ${implementation}`);
      const propsType = checker.getTypeOfSymbolAtLocation(signature.parameters[0], declaration);
      const props = checker
        .getPropertiesOfType(propsType)
        .filter((prop) => !prop.name.startsWith('__'))
        .map((prop) => {
          const value = checker.getTypeOfSymbolAtLocation(prop, declaration);
          const location = prop.declarations?.[0]?.getSourceFile().fileName || '';
          return {
            name: prop.name,
            required: !(prop.flags & ts.SymbolFlags.Optional),
            type: checker
              .typeToString(value, declaration, ts.TypeFormatFlags.NoTruncation)
              .replace(/import\("[^"]+"\)\./g, ''),
            native: location.includes('node_modules/@types/react'),
            description: ts.displayPartsToString(prop.getDocumentationComment(checker)),
          };
        });
      entries.push({
        id: `${importPath}:${exported.name}`,
        name: exported.name,
        importPath,
        aliasOf:
          exported.name !== symbol.name
            ? `${importPath}:${symbol.name}`
            : ts.isVariableDeclaration(declaration) &&
                declaration.initializer &&
                ts.isIdentifier(declaration.initializer)
              ? `${importPath}:${declaration.initializer.text}`
              : undefined,
        family,
        implementation,
        description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
        props,
      });
    }
  }
  return { schemaVersion: 1, families, components: entries.sort((a, b) => a.id.localeCompare(b.id)) };
}

export function catalogOutputs(catalog) {
  const outputs = new Map([['docs/design-system/catalog.json', JSON.stringify(catalog, null, 2) + '\n']]);
  for (const [family, metadata] of Object.entries(families)) {
    let text = `# ${family}\n\n${metadata.description}\n\nStates: ${metadata.states}.\n\nRunnable composition: [example](../../../${metadata.example}).\n\nGenerated from TypeScript exports; edit implementation props/JSDoc, then run \`npm run docs:generate\`. Native React attributes remain available in the online API catalog.\n`;
    for (const component of catalog.components.filter((item) => item.family === family)) {
      text += `\n## ${component.name} (${component.importPath})\n\n[Implementation](../../../${component.implementation})\n\n`;
      if (component.description) text += component.description + '\n\n';
      text += '| Prop | Required | Type |\n| --- | --- | --- |\n';
      for (const prop of component.props.filter(
        (item) => !item.native && !['ref', 'key'].includes(item.name),
      ))
        text += `| ${prop.name} | ${prop.required ? 'yes' : 'no'} | \`${prop.type.replaceAll('|', '\\|').replaceAll('\n', ' ')}\` |\n`;
    }
    outputs.set(`docs/design-system/components/${family}.md`, text);
  }
  return outputs;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const catalog = createCatalog();
  const check = process.argv.includes('--check');
  for (const [file, content] of catalogOutputs(catalog)) {
    const destination = path.join(root, file);
    if (check) {
      if (!fs.existsSync(destination) || fs.readFileSync(destination, 'utf8') !== content)
        throw Error(`Stale API documentation: ${file}; run npm run docs:generate`);
    } else {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, content);
    }
  }
  console.log(
    JSON.stringify({
      status: 'passed',
      mode: check ? 'check' : 'generate',
      componentExports: catalog.components.length,
      families: Object.keys(families).length,
    }),
  );
}
