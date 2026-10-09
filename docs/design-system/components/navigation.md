# navigation

Keyboard-operable tabs with stable action IDs.

States: selected, disabled, keyboard focus.

Runnable composition: [example](../../../examples/gallery/App.tsx).

Generated from TypeScript exports; edit implementation props/JSDoc, then run `npm run docs:generate`. Native React attributes remain available in the online API catalog.

## Tabs (chatgpt-desktop-kit)

[Implementation](../../../src/components/navigation/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| value | yes | `string` |
| items | yes | `TabsItem[]` |
| onValueChange | yes | `(value: string) => void` |
| ariaLabel | no | `string \| undefined` |
| actionId | no | `string \| undefined` |
