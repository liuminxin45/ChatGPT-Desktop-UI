# lists

Internal scrolling and bounded dynamic-size lists.

States: empty, long, restored anchor.

Runnable composition: [example](../../../examples/gallery/App.tsx).

Generated from TypeScript exports; edit implementation props/JSDoc, then run `npm run docs:generate`. Native React attributes remain available in the online API catalog.

## ComposerDock (chatgpt-desktop-kit)

[Implementation](../../../src/components/lists/scroll-edge-fade.tsx)

Fixed input region adjoining ScrollEdgeFade. Hosts retain state and controls.

| Prop | Required | Type |
| --- | --- | --- |
| inset | no | `"compact" \| "responsive" \| "none" \| undefined` |

## InternalScrollArea (chatgpt-desktop-kit)

[Implementation](../../../src/components/lists/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## ListStack (chatgpt-desktop-kit)

[Implementation](../../../src/components/lists/index.tsx)

Spaced rows for short lists; compose inside InternalScrollArea when scrolling is needed.

| Prop | Required | Type |
| --- | --- | --- |

## RecordRow (chatgpt-desktop-kit)

[Implementation](../../../src/components/lists/index.tsx)

Static record grouping. Put navigation, selection and commands on separate controls.

| Prop | Required | Type |
| --- | --- | --- |
| tabIndex | no | `-1 \| undefined` |
| role | no | `"group" \| "listitem" \| undefined` |

## ScrollEdgeFade (chatgpt-desktop-kit)

[Implementation](../../../src/components/lists/scroll-edge-fade.tsx)

Bottom optical boundary above a fixed composer. Adds no layout wrapper.

| Prop | Required | Type |
| --- | --- | --- |
| children | yes | `ReactNode` |
| enabled | no | `boolean \| undefined` |
| virtualized | no | `boolean \| undefined` |

## VirtualList (chatgpt-desktop-kit)

[Implementation](../../../src/components/lists/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| initialScrollAnchor | no | `VirtualListScrollAnchor \| null \| undefined` |
| onScrollAnchorChange | no | `((anchor: VirtualListScrollAnchor) => void) \| undefined` |
| header | no | `ReactNode` |
| items | yes | `readonly T[]` |
| getItemKey | yes | `(item: T, index: number) => string \| number` |
| renderItem | yes | `(item: T, index: number) => ReactNode` |
| estimateSize | yes | `number \| ((item: T, index: number) => number)` |
| ariaLabel | yes | `string` |
| resetKey | no | `unknown` |
| overscan | no | `number \| undefined` |
| className | no | `string \| undefined` |
| contentClassName | no | `string \| undefined` |
| itemClassName | no | `string \| ((item: T, index: number) => string \| undefined) \| undefined` |
| role | no | `"list" \| "listbox" \| undefined` |
| style | no | `CSSProperties \| undefined` |
