# client

Measured Windows client profile, retained disclosures and menus.

States: selected, collapsed, submenu, grouped settings.

Runnable composition: [example](../../../examples/demo/ClientDemo.tsx).

Generated from TypeScript exports; edit implementation props/JSDoc, then run `npm run docs:generate`. Native React attributes remain available in the online API catalog.

## ClientModeSwitcher (chatgpt-desktop-kit)

[Implementation](../../../src/components/client/index.tsx)

Prominent client destination selector; menu commands remain Host-owned.

| Prop | Required | Type |
| --- | --- | --- |
| label | yes | `string` |
| actionId | yes | `string` |
| ariaLabel | yes | `string` |
| items | yes | `DesktopMenuItem[]` |

## ClientSidebar (chatgpt-desktop-kit)

[Implementation](../../../src/components/client/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| header | no | `ReactNode` |

## ClientSidebarHeading (chatgpt-desktop-kit)

[Implementation](../../../src/components/client/sidebar-heading.tsx)

Shared contextual-sidebar title, including titles inside navigation controls.

| Prop | Required | Type |
| --- | --- | --- |
| as | no | `"h2" \| "span" \| undefined` |

## ClientSidebarItem (chatgpt-desktop-kit)

[Implementation](../../../src/components/client/index.tsx)

A retained navigation target with a readable label and an independent trailing count.

| Prop | Required | Type |
| --- | --- | --- |
| size | no | `"sm" \| "md" \| undefined` |
| layout | no | `"row" \| "command" \| "tile" \| "surface" \| undefined` |
| actionId | no | `string \| undefined` |
| confirmOnEnter | no | `boolean \| undefined` |
| icon | no | `ReactNode` |
| badge | no | `ReactNode` |
| label | yes | `ReactNode` |
| count | no | `number \| undefined` |
| selected | no | `boolean \| undefined` |
| actions | no | `ReactNode` |

## ClientSidebarToolbar (chatgpt-desktop-kit)

[Implementation](../../../src/components/client/index.tsx)

Title/actions stay in place while optional search content expands below them.

| Prop | Required | Type |
| --- | --- | --- |
| title | yes | `ReactNode` |
| actions | no | `ReactNode` |

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
| defaultOpen | no | `boolean \| undefined` |
| open | no | `boolean \| undefined` |
| onOpenChange | no | `((open: boolean) => void) \| undefined` |
| actionId | no | `string \| undefined` |

## SettingsField (chatgpt-desktop-kit)

[Implementation](../../../src/components/client/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| label | yes | `ReactNode` |
| description | no | `ReactNode` |
| children | yes | `ReactNode` |

## SettingsGroup (chatgpt-desktop-kit)

[Implementation](../../../src/components/client/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| title | no | `ReactNode` |

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
