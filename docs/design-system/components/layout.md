# layout

Full-width workspaces and contextual action rows.

States: compact, wide, overflow.

Runnable composition: [example](../../../examples/catalog/Examples.tsx).

Generated from TypeScript exports; edit implementation props/JSDoc, then run `npm run docs:generate`. Native React attributes remain available in the online API catalog.

## FloatingPanel (chatgpt-desktop-kit)

[Implementation](../../../src/components/layout/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## MetadataList (chatgpt-desktop-kit)

[Implementation](../../../src/components/layout/index.tsx)

Bounded metadata pairs, with text wrapping independent of the controls.

| Prop | Required | Type |
| --- | --- | --- |

## PageBar (chatgpt-desktop-kit)

[Implementation](../../../src/components/layout/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| navigation | no | `ReactNode` |
| status | no | `ReactNode` |
| actions | no | `ReactNode` |
| className | no | `string \| undefined` |
| ariaLabel | no | `string \| undefined` |

## PageHeader (chatgpt-desktop-kit)

[Implementation](../../../src/components/layout/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| title | yes | `ReactNode` |
| description | no | `ReactNode` |
| actions | no | `ReactNode` |

## PageToolbar (chatgpt-desktop-kit)

[Implementation](../../../src/components/layout/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| inline | no | `boolean \| undefined` |

## Surface (chatgpt-desktop-kit)

[Implementation](../../../src/components/layout/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## ToolPageBar (chatgpt-desktop-kit)

[Implementation](../../../src/components/layout/index.tsx)

Compact first row for independent Tools: page navigation on the left, contextual actions on the right.

| Prop | Required | Type |
| --- | --- | --- |
| navigation | no | `ReactNode` |
| status | no | `ReactNode` |
| actions | no | `ReactNode` |
| className | no | `string \| undefined` |
| ariaLabel | no | `string \| undefined` |

## WorkbenchPage (chatgpt-desktop-kit)

[Implementation](../../../src/components/layout/index.tsx)

Host and Native Tools share the same full-width workspace and compact toolbar.

| Prop | Required | Type |
| --- | --- | --- |
