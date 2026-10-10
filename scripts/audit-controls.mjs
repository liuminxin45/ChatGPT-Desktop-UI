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
  const feedbackClasses = new Map();
  const scope = (file) =>
    path
      .relative(directory, file)
      .replaceAll('\\', '/')
      .match(/^tools\/[^/]+\//)?.[0] || 'host';
  const sources = files.map((file) => ({ file, source: fs.readFileSync(file, 'utf8') }));
  for (const { file, source } of sources.filter((item) => /\.[jt]sx?$/.test(item.file))) {
    const classes = sharedClasses.get(scope(file)) || new Set();
    sharedClasses.set(scope(file), classes);
    const feedback = feedbackClasses.get(scope(file)) || new Set();
    feedbackClasses.set(scope(file), feedback);
    const tree = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      /\.tsx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const controls = new Set();
    const definitions = new Map();
    function index(node) {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer)
        definitions.set(node.name.text, node.initializer);
      ts.forEachChild(node, index);
    }
    index(tree);
    tree.forEachChild((node) => {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier.text === 'sonner') {
        controlOverrides.push({
          file: path.relative(directory, file).replaceAll('\\', '/'),
          line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1,
          selector: 'sonner import',
          properties: ['notification ownership must use chatgpt-desktop-kit'],
        });
      }
      if (
        !ts.isImportDeclaration(node) ||
        !/(?:^@phd\/ui|^chatgpt-desktop-kit|components\/ui|packages\/ph[d]-ui)/.test(
          node.moduleSpecifier.text,
        )
      )
        return;
      const bindings = node.importClause?.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings)) return;
      for (const binding of bindings.elements)
        if (
          /^(?:Button|IconButton|Input|Textarea|Select|SelectTrigger|Checkbox|Radio|Switch|Table|TableHeaderCell|TableCell|ToastNotice|Toaster|DropOverlay|PopoverContent|DropdownMenuContent|TooltipContent|DialogContent|DialogHeader|DialogTitle|DialogDescription|DialogFooter|DialogBody|AlertDialogContent|AlertDialogHeader|AlertDialogTitle|AlertDialogDescription|AlertDialogFooter|InlineNotice|ErrorState|EmptyState)$/.test(
            (binding.propertyName || binding.name).text,
          )
        )
          controls.add(binding.name.text);
    });
    function visit(node) {
      if (
        (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        /^(?:div|p|section|aside)$/.test(node.tagName.getText(tree))
      ) {
        const role = node.attributes.properties.find(
          (item) => ts.isJsxAttribute(item) && item.name.getText(tree) === 'role',
        );
        if (role?.initializer && /^(?:"|')(?:alert|status)(?:"|')$/.test(role.initializer.getText(tree))) {
          const className = node.attributes.properties.find(
            (item) => ts.isJsxAttribute(item) && item.name.getText(tree) === 'className',
          );
          const painted = new Set();
          function inspect(value) {
            if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value))
              for (const token of value.text.split(/\s+/)) {
                if (/^[\w-]+$/.test(token)) feedback.add(token);
                if (/(^|:)(?:bg-|rounded|border(?:-|$)|shadow)/.test(token)) painted.add(token);
              }
            ts.forEachChild(value, inspect);
          }
          if (className?.initializer) inspect(className.initializer);
          if (painted.size)
            controlOverrides.push({
              file: path.relative(directory, file).replaceAll('\\', '/'),
              line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1,
              selector: 'custom ' + role.initializer.text + ' surface',
              properties: [...painted],
            });
        }
      }
      if (
        (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        controls.has(node.tagName.getText(tree))
      ) {
        const attribute = node.attributes.properties.find(
          (item) => ts.isJsxAttribute(item) && item.name.getText(tree) === 'className',
        );
        const utilities = new Set();
        const visited = new Set();
        function strings(value) {
          if (
            ts.isStringLiteral(value) ||
            ts.isNoSubstitutionTemplateLiteral(value) ||
            ts.isTemplateHead(value) ||
            ts.isTemplateTail(value) ||
            ts.isTemplateMiddle(value)
          )
            for (const token of value.text.split(/\s+/)) {
              if (/^[\w-]+$/.test(token)) classes.add(token);
              if (
                /(^|:)(?:bg-|rounded|border(?:-|$)|shadow|ring|outline|font-|leading-|p[xytrblse]?-(?:\d|\[)|text-(?:xs|sm|base|lg|xl|\d|\[|primary|secondary|muted|destructive|foreground|white|black)|truncate|whitespace-nowrap)/.test(
                  token,
                )
              )
                utilities.add(token);
            }
          if (ts.isIdentifier(value) && definitions.has(value.text) && !visited.has(value.text)) {
            visited.add(value.text);
            const definition = definitions.get(value.text);
            if (
              ts.isStringLiteral(definition) ||
              ts.isNoSubstitutionTemplateLiteral(definition) ||
              ts.isTemplateExpression(definition) ||
              ts.isConditionalExpression(definition) ||
              ts.isBinaryExpression(definition) ||
              (ts.isCallExpression(definition) &&
                /^(?:cn|clsx|classNames)$/.test(definition.expression.getText(tree)))
            )
              strings(definition);
          }
          ts.forEachChild(value, strings);
        }
        if (attribute?.initializer) strings(attribute.initializer);
        if (utilities.size)
          controlOverrides.push({
            file: path.relative(directory, file).replaceAll('\\', '/'),
            line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1,
            selector: node.tagName.getText(tree) + ' className',
            properties: [...utilities],
          });
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
        const privateOverlay =
          /\.(?:[\w-]*toast[\w-]*|[\w-]*popover[\w-]*)(?=[\s.:#>+~\[]|$)/.test(rule.selector) &&
          rule.nodes.some(
            (node) =>
              node.type === 'decl' && /^(?:background(?:-color)?|border(?:-.+)?|box-shadow)$/.test(node.prop),
          );
        const privateFeedback =
          rule.selectors.some((selector) =>
            [
              ...selector
                .split(/[\s>+~]+/)
                .at(-1)
                .matchAll(/\.([\w-]+)/g),
            ].some((match) => feedbackClasses.get(scope(file))?.has(match[1])),
          ) &&
          rule.nodes.some(
            (node) =>
              node.type === 'decl' && /^(?:background(?:-color)?|border(?:-.+)?|box-shadow)$/.test(node.prop),
          );
        if (
          !privateOverlay &&
          !privateFeedback &&
          !privateControlClass &&
          !/(?:\.desktop-(?:button|input|textarea|select|table|toast|popover|menu-content|dialog)(?=[\s.:#>+~\[]|$)|\b(?:button|input|textarea|select)\b|(?:^|[\s>+~])(?:table|th|td)(?=[\s.:#>+~\[)]|$))/.test(
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
