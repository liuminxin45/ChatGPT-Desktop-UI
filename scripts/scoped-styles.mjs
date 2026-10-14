import postcss from 'postcss';

const boundary = ':where(.desktop-ui-root,.desktop-ui-portal)';
/** Generate the scoped distribution from the sole authoritative control stylesheet. */
export function scopeStyles(css) {
  const tree = postcss.parse(css);
  tree.walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
    // The old document cursor policy is available only through legacy/desktop entries.
    if (rule.selector.includes('html:root')) {
      rule.remove();
      return;
    }
    rule.selectors = rule.selectors.flatMap((selector) => {
      if (selector === ':root') return boundary;
      const pointerRoot = /^:root:has\(\[data-desktop-input-modality=["']?pointer["']?\]\)/;
      const keyboardRoot = /^:root:not\(:has\(\[data-desktop-input-modality=["']?pointer["']?\]\)\)/;
      if (keyboardRoot.test(selector))
        return [
          selector.replace(keyboardRoot, `${boundary}:not(:has([data-desktop-input-modality="pointer"])):not([data-desktop-input-modality="pointer"])`),
        ];
      if (pointerRoot.test(selector))
        return [
          selector.replace(':root', boundary),
          selector.replace(pointerRoot, `${boundary}[data-desktop-input-modality="pointer"]`),
        ];
      if (selector.includes(':root'))
        throw new Error('Unsupported document selector in scoped controls: ' + selector);
      if (selector === '.dark') return `${boundary}[data-theme=dark]`;
      if (selector.startsWith('.dark ')) return `${boundary}[data-theme=dark] ${selector.slice(6)}`;
      return selector.startsWith('.desktop-')
        ? [`${boundary} ${selector}`, `${boundary}${selector}`]
        : `${boundary} ${selector}`;
    });
  });
  tree.append(
    `${boundary}{color:var(--desktop-color-text);font:400 var(--desktop-font-size-body)/var(--desktop-line-height-ui) var(--desktop-font-sans);font-synthesis:none} ${boundary},${boundary} *,${boundary} *::before,${boundary} *::after{box-sizing:border-box}.desktop-ui-root{background:var(--desktop-color-background)}.desktop-ui-portal{display:contents}`,
  );
  return tree.toString();
}
