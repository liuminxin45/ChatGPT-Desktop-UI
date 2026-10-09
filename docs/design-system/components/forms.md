# forms

Text entry and selection with Host-controlled values.

States: empty, populated, disabled, invalid, IME.

Runnable composition: [example](../../../examples/catalog/Examples.tsx).

Generated from TypeScript exports; edit implementation props/JSDoc, then run `npm run docs:generate`. Native React attributes remain available in the online API catalog.

## Checkbox (chatgpt-desktop-kit)

[Implementation](../../../src/components/forms/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## EditableCombobox (chatgpt-desktop-kit)

[Implementation](../../../src/components/forms/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| actionId | no | `string \| undefined` |
| value | yes | `string` |
| options | yes | `readonly EditableComboboxOption[]` |
| onValueChange | yes | `(value: string) => void` |
| onCommit | no | `((value: string, option?: EditableComboboxOption) => void) \| undefined` |
| emptyMessage | no | `ReactNode` |

## Input (chatgpt-desktop-kit)

[Implementation](../../../src/components/forms/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## Select (chatgpt-desktop-kit)

[Implementation](../../../src/components/forms/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| actionId | no | `string \| undefined` |
| featureId | no | `string \| undefined` |
| surfaceId | no | `string \| undefined` |
| toolId | no | `string \| undefined` |
| options | yes | `readonly SelectOption[]` |
| value | no | `string \| undefined` |
| defaultValue | no | `string \| undefined` |
| onValueChange | no | `((value: string) => void) \| undefined` |
| placeholder | no | `ReactNode` |
| className | no | `string \| undefined` |
| contentClassName | no | `string \| undefined` |
| disabled | no | `boolean \| undefined` |
| name | no | `string \| undefined` |
| required | no | `boolean \| undefined` |
| id | no | `string \| undefined` |
| title | no | `string \| undefined` |
| aria-label | no | `string \| undefined` |
| aria-labelledby | no | `string \| undefined` |

## Switch (chatgpt-desktop-kit)

[Implementation](../../../src/components/forms/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| checked | no | `boolean \| undefined` |
| actionId | no | `string \| undefined` |

## Textarea (chatgpt-desktop-kit)

[Implementation](../../../src/components/forms/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
