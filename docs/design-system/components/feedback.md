# feedback

Empty, failure, loading and rich content presentation.

States: loading, empty, failure, recovery.

Runnable composition: [example](../../../examples/catalog/Examples.tsx).

Generated from TypeScript exports; edit implementation props/JSDoc, then run `npm run docs:generate`. Native React attributes remain available in the online API catalog.

## EmptyState (chatgpt-desktop-kit)

[Implementation](../../../src/components/feedback/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| title | yes | `ReactNode` |
| description | no | `ReactNode` |
| action | no | `ReactNode` |

## ErrorState (chatgpt-desktop-kit)

[Implementation](../../../src/components/feedback/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| title | no | `ReactNode` |
| description | yes | `ReactNode` |
| action | no | `ReactNode` |

## LoadingSkeleton (chatgpt-desktop-kit)

[Implementation](../../../src/components/feedback/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| className | no | `string \| undefined` |

## Markdown (chatgpt-desktop-kit)

[Implementation](../../../src/components/feedback/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| children | yes | `string` |
| components | no | `Components \| undefined` |
