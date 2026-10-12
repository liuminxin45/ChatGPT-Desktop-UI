# 0.6 integration and migration

Use `npm install chatgpt-desktop-kit` for a prebuilt registry package. React 18.3.1 and React 19 are supported. Consumer runtimes start at Node 22.23.3 or 24.19.0; source builds remain pinned to Node 24.19.0. The verified matrix includes React 18.3.1, 19.0.0 and 19.3.0 with both Node baselines.

## Embedded React applications

```tsx
import { DesktopProvider, Button } from 'chatgpt-desktop-kit';
import 'chatgpt-desktop-kit/components.css';

<DesktopProvider theme="dark" onThemeChange={setTheme}>
  <Button actionId="project.create">Create project</Button>
</DesktopProvider>
```

`DesktopProvider` owns only its subtree. `theme` is controlled; `defaultTheme` is uncontrolled. `system` follows the operating system. Persistence stays in the application. Multiple roots and nested roots may use different themes. Root props include ordinary HTML attributes and styles; semantic overrides use `DesktopTokenStyle`.

Scoped CSS is generated from canonical control CSS, including token declarations. It does not reset the document, override host cursors or disable host animation. Portal wrappers inherit the originating subtree's semantic tokens, typography and React localization context. They mount with Radix presence, preserve state on theme changes and are removed on unmount. Use the shared portal-backed controls rather than a consumer-owned copy.

## Whole desktop documents

Import `desktop.css` and mount one `DesktopDocumentAdapter`. The adapter explicitly opts the document into viewport/reset/arrow-cursor policy; the Host continues to own its theme and native preferences. A standalone application may retain `DesktopRoot` inside that adapter for its existing theme preference API.

`styles.css`, `DesktopRoot`, `DesktopSurface`, `controls.css`, `tokens.css`, `shell.css`, all compiled module entries and compatibility exports remain available. The first two are legacy document integrations and are unsuitable for independently themed embedded roots. Existing token-only startup/recovery pages continue to work.

Do not remove global rules from a Host without migrating its document entry. Coordinated desktop consumers retain the same immutable public Git commit and enabled Git prepare. External registry consumers do not build source during installation. The consumer checker applies to coordinated Git integrations; a registry consumer uses the package-consumption suite instead.

## Control changes

- Checkbox and IconButton refs point to their native input/button. Switch also forwards a button ref.
- Switch supports `checked`, `defaultChecked` and `onCheckedChange`; controlled values stay with the caller. Legacy `onClick` remains, runs once, and may cancel the transition with `preventDefault`. Disabled switches invoke neither callback.
- EditableCombobox options are excluded from Tab order. Arrow keys keep DOM focus in the input; Enter selects, blur closes/commits, Escape dismisses without replacing input, and IME confirmation is preserved. A selection followed by blur commits once. Host `onKeyDown` may cancel the default behavior.
- Dialog retains its props and visual profile while using Radix modality, topmost dismissal and focus management. Initial focus goes to the body; hidden Tool surfaces do not restore focus into hidden content.
- Calendar uses DayPicker 9 to permit React 19 installation. Existing `initialFocus`, single/range selection, legacy icon slots and class-name aliases are retained by the wrapper. New custom slots use `Chevron`; prefer current DayPicker keys for new compositions. No upstream private/deprecated event API is added to the supported kit contract.

`source/*` remains a deprecated development/debugging entry. Use root, components or compat compiled exports for application code; source layouts are not a stable application API.

## Release gates

PRs run Hooks lint, component tests, browser keyboard/IME/modal/isolation checks, generated docs, package installation/types/SSR and existing visual/interaction suites. Windows/Edge compares eight reviewed synthetic captures against committed baselines; updating baselines is an explicit local review action. Other platforms retain browser geometry/accessibility gates. CI evidence and native display scaling are distinct.
