# actions

Buttons, icon actions and floating launchers.

States: idle, hover, focus, disabled, icon-only.

Runnable composition: [example](../../../examples/catalog/Examples.tsx).

Generated from TypeScript exports; edit implementation props/JSDoc, then run `npm run docs:generate`. Native React attributes remain available in the online API catalog.

## Button (chatgpt-desktop-kit)

[Implementation](../../../src/components/actions/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| variant | no | `ButtonVariant \| undefined` |
| size | no | `"sm" \| "md" \| undefined` |
| actionId | no | `string \| undefined` |
| confirmOnEnter | no | `boolean \| undefined` |
| icon | no | `ReactNode` |
| iconOnly | no | `boolean \| undefined` |
| badge | no | `ReactNode` |

## FloatingLauncher (chatgpt-desktop-kit)

[Implementation](../../../src/components/actions/index.tsx)

Reusable floating surfaces; positioning and application state belong to the Host.

| Prop | Required | Type |
| --- | --- | --- |
| variant | no | `ButtonVariant \| undefined` |
| size | no | `"sm" \| "md" \| undefined` |
| actionId | no | `string \| undefined` |
| confirmOnEnter | no | `boolean \| undefined` |
| icon | no | `ReactNode` |
| iconOnly | no | `boolean \| undefined` |
| badge | no | `ReactNode` |

## IconButton (chatgpt-desktop-kit)

[Implementation](../../../src/components/actions/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| actionId | no | `string \| undefined` |
