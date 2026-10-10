import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import postcss from 'postcss';

/** Source findings complement rendered checks; a shared import alone is not compliance. */
export function auditControls(directory, files) {
  const nativeControls = [],
    exceptions = [],
    controlOverrides = [];
  const sharedClasses = new Map();
  const scope = (file) =>
    path
      .relative(directory, file)
      .replaceAll('\\', '/')
      .match(/^tools\/[^/]+\//)?.[0] || 'host';
  const sources = files.map((file) => ({ file, source: fs.readFileSync(file, 'utf8') }));
  for (const { file, source } of sources.filter((item) => /\.[jt]sx?$/.test(item.file))) {
    const classes = sharedClasses.get(scope(file)) || new Set();
    sharedClasses.set(scope(file), classes);
    const tree = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      /\.tsx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const controls = new Set();
    tree.forEachChild((node) => {
      if (
        !ts.isImportDeclaration(node) ||
        !/^(?:@phd\/ui|chatgpt-desktop-kit|@\/components\/ui)/.test(node.moduleSpecifier.text)
      )
        return;
      const bindings = node.importClause?.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings)) return;
      for (const binding of bindings.elements)
        if (
          /^(?:Button|IconButton|Input|Textarea|Select|SelectTrigger|Checkbox|Radio|Switch|Table|TableHeaderCell|TableCell)$/.test(
            (binding.propertyName || binding.name).text,
          )
        )
          controls.add(binding.name.text);
    });
    function visit(node) {
      if (
        (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        controls.has(node.tagName.getText(tree))
      ) {
        const attribute = node.attributes.properties.find(
          (item) => ts.isJsxAttribute(item) && item.name.getText(tree) === 'className',
        );
        function strings(value) {
          if (
            ts.isStringLiteral(value) ||
            ts.isNoSubstitutionTemplateLiteral(value) ||
            ts.isTemplateHead(value) ||
            ts.isTemplateTail(value) ||
            ts.isTemplateMiddle(value)
          )
            for (const token of value.text.split(/\s+/)) if (/^[\w-]+$/.test(token)) classes.add(token);
          ts.forEachChild(value, strings);
        }
        if (attribute) strings(attribute);
      }
      ts.forEachChild(node, visit);
    }
    visit(tree);
  }
  for (const { file, source } of sources) {
    const relative = path.relative(directory, file).replaceAll('\\', '/');
    if (/\.css$/.test(file)) {
      if (/^(?:node_modules|src\/compat|src\/components)\//.test(relative)) continue;
      postcss.parse(source, { from: file }).walkRules((rule) => {
        const classes = sharedClasses.get(scope(file)) || new Set();
        const privateControlClass = rule.selectors.some((selector) =>
          [
            ...selector
              .replace(/:where\((.*)\)$/, '$1')
              .split(/[\s>+~]+/)
              .at(-1)
              .matchAll(/\.([\w-]+)/g),
          ].some((match) => classes.has(match[1])),
        );
        if (
          !privateControlClass &&
          !/(?:\.desktop-(?:button|input|textarea|select|table)(?=[\s.:#>+~\[]|$)|\b(?:button|input|textarea|select)\b)/.test(
            rule.selector,
          )
        )
          return;
        const properties = [];
        rule.walkDecls((decl) => {
          if (
            /^(?:background(?:-color)?|color|border(?:-.+)?|font(?:-.+)?|line-height|white-space|text-overflow|box-shadow|padding(?:-.+)?)$/.test(
              decl.prop,
            ) ||
            (/\.desktop-select(?:[\s.:#>+~\[-]|$)/.test(rule.selector) &&
              /^(?:height|max-height|overflow)$/.test(decl.prop))
          )
            properties.push(decl.prop);
        });
        const exception = [...source.matchAll(/desktop-ui-exception\s+\.([\w-]+):\s*([^\n*]+)/g)].find(
          (match) => rule.selector.includes('.' + match[1]),
        );
        if (properties.length && exception)
          exceptions.push({
            file: relative,
            line: rule.source.start.line,
            tag: 'css',
            selector: rule.selector,
            reason: exception[2].trim(),
          });
        else if (properties.length)
          controlOverrides.push({
            file: relative,
            line: rule.source.start.line,
            selector: rule.selector,
            properties,
          });
      });
      continue;
    }
    const tree = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      /\.tsx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    function visit(node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = node.tagName.getText(tree);
        if (/^(?:button|input|textarea|select|table)$/.test(tag)) {
          const attributes = node.attributes.getText(tree);
          const item = {
            file: relative,
            line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1,
            tag,
          };
          if (
            tag === 'input' &&
            /type=["']file["']/.test(attributes) &&
            /\bhidden\b|visually-hidden-file|sr-only/.test(attributes)
          )
            exceptions.push({
              ...item,
              reason: 'Hidden native file chooser; the visible trigger is a shared action.',
            });
          else nativeControls.push(item);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(tree);
  }
  return { nativeControls, controlOverrides, exceptions };
}
