# shell

Portable shell and grouped settings navigation.

States: selected, pinned, collapsed, filtered.

Runnable composition: [example](../../../examples/gallery/App.tsx).

Generated from TypeScript exports; edit implementation props/JSDoc, then run `npm run docs:generate`. Native React attributes remain available in the online API catalog.

## AvatarMenu (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| name | no | `string \| undefined` |
| status | no | `string \| undefined` |
| image | no | `string \| undefined` |
| onAccount | no | `(() => void) \| undefined` |
| onSettings | no | `(() => void) \| undefined` |
| onExit | no | `(() => void) \| undefined` |
| labels | no | `{ appearance: string; account: string; settings: string; exit: string; system: string; light: string; dark: string; } \| undefined` |

## DesktopShell (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| titlebar | no | `ReactNode` |
| navigation | yes | `ReactNode` |
| navigationVisible | no | `boolean \| undefined` |
| sidebar | no | `ReactNode` |
| sidebarVisible | no | `boolean \| undefined` |
| children | yes | `ReactNode` |

## NavigationRail (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| items | yes | `NavigationItem[]` |
| selected | yes | `string` |
| onSelect | yes | `(id: string) => void` |
| footer | no | `ReactNode` |
| pinnedIds | no | `readonly string[] \| undefined` |
| onPinnedChange | no | `((ids: string[]) => void) \| undefined` |
| ariaLabel | no | `string \| undefined` |
| unreadLabel | no | `string \| undefined` |
| moreLabel | no | `string \| undefined` |
| pinLabel | no | `string \| undefined` |
| unpinLabel | no | `string \| undefined` |

## SettingRow (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| label | yes | `ReactNode` |
| description | no | `ReactNode` |
| children | yes | `ReactNode` |

## SettingsNavigation (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| categories | yes | `SettingsCategory[]` |
| selected | yes | `string` |
| onSelect | yes | `(id: string) => void` |
| title | no | `string \| undefined` |
| searchLabel | no | `string \| undefined` |
| noMatchesLabel | no | `string \| undefined` |

## SettingsPage (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| title | yes | `ReactNode` |
| children | yes | `ReactNode` |

## SettingsSection (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| title | yes | `ReactNode` |
| children | yes | `ReactNode` |

## TitleBar (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/index.tsx)

The host provides native/history actions. No native window IPC or persistence is owned here.

| Prop | Required | Type |
| --- | --- | --- |
| onBack | no | `(() => void) \| undefined` |
| onForward | no | `(() => void) \| undefined` |
| onToggleSidebar | no | `(() => void) \| undefined` |
| canBack | no | `boolean \| undefined` |
| canForward | no | `boolean \| undefined` |
| canToggleSidebar | no | `boolean \| undefined` |
| menus | no | `ShellMenu[] \| undefined` |
| trailing | no | `ReactNode` |
| windowControls | no | `ReactNode` |
| labels | no | `{ back: string; forward: string; sidebar: string; } \| undefined` |

## Tooltip (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| label | yes | `string` |
| children | yes | `ReactNode` |
| side | no | `"right" \| "bottom" \| "top" \| "left" \| undefined` |
