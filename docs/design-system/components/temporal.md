# temporal

Local date, month and date-time selection with shared popup geometry.

States: empty, selected, bounded, disabled, read-only, draft, confirmed, cancelled.

Runnable composition: [example](../../../examples/temporal-contract.tsx).

Generated from TypeScript exports; edit implementation props/JSDoc, then run `npm run docs:generate`. Native React attributes remain available in the online API catalog.

## TemporalPicker (chatgpt-desktop-kit)

[Implementation](../../../src/components/temporal/index.tsx)

Shared popup-only selection. Datetime edits commit only on explicit confirmation.

| Prop | Required | Type |
| --- | --- | --- |
| value | yes | `string` |
| onValueChange | yes | `(value: string) => void` |
| mode | no | `TemporalMode \| undefined` |
| min | no | `string \| undefined` |
| max | no | `string \| undefined` |
| readOnly | no | `boolean \| undefined` |
| clearable | no | `boolean \| undefined` |
| required | no | `boolean \| undefined` |
| name | no | `string \| undefined` |
| placeholder | no | `string \| undefined` |
| size | no | `"sm" \| "md" \| undefined` |
| actionId | yes | `string` |
| triggerActionId | no | `string \| undefined` |
