# layout

Full-width workspaces and contextual action rows.

States: compact, wide, overflow.

Runnable composition: [example](../../../examples/catalog/Examples.tsx).

Generated from TypeScript exports; edit implementation props/JSDoc, then run `npm run docs:generate`. Native React attributes remain available in the online API catalog.

## AppActionBar (chatgpt-desktop-kit)

[Implementation](../../../src/components/layout/app.tsx)

Shared readable boundary for task actions; the host owns sticky/fixed placement.

| Prop | Required | Type |
| --- | --- | --- |

## AppHeading (chatgpt-desktop-kit)

[Implementation](../../../src/components/layout/app.tsx)

App editorial hierarchy without product-specific words or layout ownership.

| Prop | Required | Type |
| --- | --- | --- |
| eyebrow | no | `ReactNode` |
| title | yes | `ReactNode` |
| description | no | `ReactNode` |
| size | no | `"section" \| "hero" \| undefined` |
| as | no | `"h2" \| "h3" \| "h1" \| undefined` |

## AppIcon (chatgpt-desktop-kit)

[Implementation](../../../src/components/layout/app.tsx)

Semantic app glyphs. Decorative by default; label an independent icon action.

| Prop | Required | Type |
| --- | --- | --- |
| name | yes | `"send" \| "article" \| "style" \| "capture" \| "poster" \| "home" \| "discover" \| "create" \| "library" \| "tune" \| "reader" \| "review" \| "history" \| "arrow" \| "back" \| "lock" \| "annotation" \| "layers" \| "check" \| "close" \| "more" \| "bookmark"` |
| selected | no | `boolean \| undefined` |
| size | no | `string \| number \| undefined` |
| className | no | `string \| undefined` |
| aria-label | no | `string \| undefined` |

## AppSurface (chatgpt-desktop-kit)

[Implementation](../../../src/components/layout/app.tsx)

Opt-in touch-first profile. Host retains navigation, content and persistence.

| Prop | Required | Type |
| --- | --- | --- |
| profile | no | `"editorial" \| "workspace" \| undefined` |

## AppTile (chatgpt-desktop-kit)

[Implementation](../../../src/components/layout/app.tsx)

One named navigation/selection target; never place independent controls inside.

| Prop | Required | Type |
| --- | --- | --- |
| icon | no | `ReactNode` |
| title | yes | `ReactNode` |
| description | no | `ReactNode` |
| trailing | no | `ReactNode` |
| selected | no | `boolean \| undefined` |
| tone | no | `"neutral" \| "accent" \| undefined` |
| layout | no | `"row" \| "tile" \| undefined` |
| actionId | no | `string \| undefined` |

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
| variant | no | `"default" \| "outlined" \| undefined` |

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
