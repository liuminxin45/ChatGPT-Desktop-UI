# overlays

Menus and guarded dialogs; Host owns intent and draft.

States: open, closed, collision, Escape, focus return.

Runnable composition: [example](../../../examples/catalog/Examples.tsx).

Generated from TypeScript exports; edit implementation props/JSDoc, then run `npm run docs:generate`. Native React attributes remain available in the online API catalog.

## Dialog (chatgpt-desktop-kit)

[Implementation](../../../src/components/overlays/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| actionId | no | `string \| undefined` |
| className | no | `string \| undefined` |
| open | yes | `boolean` |
| title | yes | `ReactNode` |
| description | no | `ReactNode` |
| children | no | `ReactNode` |
| footer | no | `ReactNode` |
| onClose | yes | `() => void` |

## DropOverlay (chatgpt-desktop-kit)

[Implementation](../../../src/components/overlays/index.tsx)

Non-interactive file drop feedback; the Host owns drag events and attachment scope.

| Prop | Required | Type |
| --- | --- | --- |
| label | yes | `string` |
| surfaceId | no | `string \| undefined` |

## MenuButton (chatgpt-desktop-kit)

[Implementation](../../../src/components/overlays/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| label | no | `string \| undefined` |
| actionId | yes | `string` |
| featureId | no | `string \| undefined` |
| surfaceId | no | `string \| undefined` |
| toolId | no | `string \| undefined` |
| onOpenChange | no | `((open: boolean) => void) \| undefined` |
| items | yes | `{ label: ReactNode; actionId: string; disabled?: boolean; onSelect(): void; }[]` |
