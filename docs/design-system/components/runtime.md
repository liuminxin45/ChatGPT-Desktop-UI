# runtime

Theme, localization, input confirmation and fixed-size virtualization.

States: light, dark, system, IME, retained state.

Runnable composition: [example](../../../examples/catalog/Examples.tsx).

Generated from TypeScript exports; edit implementation props/JSDoc, then run `npm run docs:generate`. Native React attributes remain available in the online API catalog.

## DesktopRoot (chatgpt-desktop-kit)

[Implementation](../../../src/theme.tsx)

One root per standalone document. Embedded surfaces inherit their host instead.

| Prop | Required | Type |
| --- | --- | --- |
| children | yes | `ReactNode` |
| storageKey | no | `string \| undefined` |
| defaultTheme | no | `Theme \| undefined` |

## DesktopSurface (chatgpt-desktop-kit)

[Implementation](../../../src/theme.tsx)

Backward-compatible name; the root and its context have one implementation.

| Prop | Required | Type |
| --- | --- | --- |
| children | yes | `ReactNode` |
| storageKey | no | `string \| undefined` |
| defaultTheme | no | `Theme \| undefined` |

## DesktopThemeSelect (chatgpt-desktop-kit)

[Implementation](../../../src/theme.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| onAction | no | `((outcome: "exposed" \| "invoked") => void) \| undefined` |
| labels | no | `{ appearance: string; system: string; light: string; dark: string; } \| undefined` |

## FixedVirtualList (chatgpt-desktop-kit)

[Implementation](../../../src/fixed-virtual-list.tsx)

Dependency-free virtual list for isolated Tool UIs with fixed-height rows.

| Prop | Required | Type |
| --- | --- | --- |
| items | yes | `readonly T[]` |
| rowHeight | yes | `number` |
| getItemKey | yes | `(item: T, index: number) => string \| number` |
| renderItem | yes | `(item: T, index: number) => ReactNode` |
| ariaLabel | yes | `string` |
| className | no | `string \| undefined` |
| overscan | no | `number \| undefined` |
| resetKey | no | `unknown` |
| style | no | `CSSProperties \| undefined` |
| apiRef | no | `Ref<FixedVirtualListHandle> \| undefined` |

## InputBehaviorRoot (chatgpt-desktop-kit)

[Implementation](../../../src/input-behavior.tsx)

One event boundary per Host; DOM scopes also work for React portal dialogs.

| Prop | Required | Type |
| --- | --- | --- |
| children | yes | `ReactNode` |

## UIStringsProvider (chatgpt-desktop-kit)

[Implementation](../../../src/strings.tsx)

Override the small set of primitive accessibility/default labels without a global locale service.

| Prop | Required | Type |
| --- | --- | --- |
| labels | no | `Record<string, string> \| undefined` |
| locale | no | `string \| undefined` |
| translate | no | `Translator \| undefined` |
| children | yes | `ReactNode` |
