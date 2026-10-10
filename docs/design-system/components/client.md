# client

Measured Windows client profile, retained disclosures and menus.

States: selected, collapsed, submenu, grouped settings.

Runnable composition: [example](../../../examples/demo/ClientDemo.tsx).

Generated from TypeScript exports; edit implementation props/JSDoc, then run `npm run docs:generate`. Native React attributes remain available in the online API catalog.

## ClientSidebar (chatgpt-desktop-kit)

[Implementation](../../../src/components/client/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| header | yes | `ReactNode` |
| children | yes | `ReactNode` |

## DesktopClientSurface (chatgpt-desktop-kit)

[Implementation](../../../src/components/client/index.tsx)

Explicitly opt into the measured Windows reference profile without changing embedded Tool typography.

| Prop | Required | Type |
| --- | --- | --- |
| children | yes | `ReactNode` |

## DesktopMenu (chatgpt-desktop-kit)

[Implementation](../../../src/components/client/index.tsx)

A host-owned action tree; no native commands or external transmission are inferred.

| Prop | Required | Type |
| --- | --- | --- |
| trigger | yes | `ReactElement<any, string \| JSXElementConstructor<any>>` |
| items | yes | `DesktopMenuItem[]` |
| heading | no | `ReactNode` |
| side | no | `"top" \| "right" \| "bottom" \| "left" \| undefined` |
| align | no | `"center" \| "end" \| "start" \| undefined` |
| className | no | `string \| undefined` |
| onOpenChange | no | `((open: boolean) => void) \| undefined` |

## SettingsDisclosure (chatgpt-desktop-kit)

[Implementation](../../../src/components/client/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| title | yes | `string` |
| children | yes | `ReactNode` |

## SettingsField (chatgpt-desktop-kit)

[Implementation](../../../src/components/client/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| label | yes | `string` |
| description | no | `ReactNode` |
| children | yes | `ReactNode` |

## SettingsGroup (chatgpt-desktop-kit)

[Implementation](../../../src/components/client/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| title | no | `string \| undefined` |
| children | yes | `ReactNode` |

## SidebarSection (chatgpt-desktop-kit)

[Implementation](../../../src/components/client/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| title | yes | `string` |
| actions | no | `ReactNode` |
| children | yes | `ReactNode` |
| open | no | `boolean \| undefined` |
| onOpenChange | no | `((open: boolean) => void) \| undefined` |
| actionId | no | `string \| undefined` |
