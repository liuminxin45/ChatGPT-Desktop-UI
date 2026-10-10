import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import postcss from 'postcss';

/** Source findings complement rendered checks; a shared import alone is not compliance. */
export function auditControls(directory, files) {
  const nativeControls = [],
    exceptions = [],
    controlOverrides = [];
  for (const file of files) {
    const relative = path.relative(directory, file).replaceAll('\\', '/');
    const source = fs.readFileSync(file, 'utf8');
    if (/\.css$/.test(file)) {
      if (/^(?:node_modules|src\/compat|src\/components)\//.test(relative)) continue;
      postcss.parse(source, { from: file }).walkRules((rule) => {
        if (
          !/(?:\.desktop-(?:button|input|textarea|select)(?=[\s.:#>+~\[]|$)|\b(?:button|input|textarea|select)\b)/.test(
            rule.selector,
          )
        )
          return;
        const properties = [];
        rule.walkDecls((decl) => {
          if (
            /^(?:background(?:-color)?|color|border(?:-.+)?|font(?:-.+)?|box-shadow|padding(?:-.+)?)$/.test(
              decl.prop,
            )
          )
            properties.push(decl.prop);
        });
        if (properties.length)
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
