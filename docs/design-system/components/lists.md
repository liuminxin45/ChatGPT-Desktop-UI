# lists

Internal scrolling and bounded dynamic-size lists.

States: empty, long, restored anchor.

Runnable composition: [example](../../../examples/gallery/App.tsx).

Generated from TypeScript exports; edit implementation props/JSDoc, then run `npm run docs:generate`. Native React attributes remain available in the online API catalog.

## InternalScrollArea (chatgpt-desktop-kit)

[Implementation](../../../src/components/lists/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## VirtualList (chatgpt-desktop-kit)

[Implementation](../../../src/components/lists/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
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
