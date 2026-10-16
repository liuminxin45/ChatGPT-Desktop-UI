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

## NavigationRail (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| items | no | `NavigationItem[] \| undefined` |
| selected | no | `string \| undefined` |
| onSelect | no | `((id: string) => void) \| undefined` |
| footer | no | `ReactNode` |
| pinnedIds | no | `readonly string[] \| undefined` |
| onPinnedChange | no | `((ids: string[]) => void) \| undefined` |
| ariaLabel | no | `string \| undefined` |
| unreadLabel | no | `string \| undefined` |
| moreLabel | no | `string \| undefined` |
| pinLabel | no | `string \| undefined` |
| unpinLabel | no | `string \| undefined` |

## NavigationRailItem (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/navigation-rail-item.tsx)

One semantic link or command, with a name-only tooltip and shared navigation feedback.

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |
| label | yes | `string` |
| actionId | no | `string \| undefined` |
| selected | no | `boolean \| undefined` |
| unread | no | `boolean \| undefined` |
| children | yes | `ReactNode` |

## SettingRow (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| label | yes | `ReactNode` |
| description | no | `ReactNode` |
| children | yes | `ReactNode` |

## SettingsLayout (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/index.tsx)

Shared settings shell; the Host owns category state and contextual sidebar visibility.

| Prop | Required | Type |
| --- | --- | --- |
| sidebar | yes | `ReactNode` |
| sidebarVisible | no | `boolean \| undefined` |
| sidebarId | no | `string \| undefined` |
| sidebarLabel | no | `string \| undefined` |
| sidebarResize | no | `SidebarResizeOptions \| undefined` |

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
| actionId | no | `string \| undefined` |

## SettingsPage (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| title | yes | `ReactNode` |
| showTitle | no | `boolean \| undefined` |

## SettingsSection (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| title | no | `ReactNode` |

## SidebarPanel (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/sidebar-panel.tsx)

Shared sidebar geometry and resize target; the Host owns width, folding and persistence.

| Prop | Required | Type |
| --- | --- | --- |
| resize | no | `SidebarResizeOptions \| undefined` |

## TitleBar (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/index.tsx)

The host provides native/history actions. No native window IPC or persistence is owned here.

| Prop | Required | Type |
| --- | --- | --- |
| actions | no | `ReactNode` |
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
| side | no | `"top" \| "right" \| "bottom" \| "left" \| undefined` |
| overflowOnly | no | `boolean \| undefined` |

## WindowControls (chatgpt-desktop-kit)

[Implementation](../../../src/components/shell/window-controls.tsx)

The shared glyphs and targets; native operations and their outcomes stay in the Host.

| Prop | Required | Type |
| --- | --- | --- |
| maximized | no | `boolean \| undefined` |
| onMinimize | no | `(() => void) \| undefined` |
| onMaximize | no | `(() => void) \| undefined` |
| onClose | no | `(() => void) \| undefined` |
| actionIds | no | `{ minimize: string; maximize: string; close: string; } \| undefined` |
| labels | no | `{ minimize: string; maximize: string; restore: string; close: string; } \| undefined` |
