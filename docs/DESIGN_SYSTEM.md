# Desktop design system

This specification combines measured screenshot patterns with the originating PHD implementation. Values below are implementation targets, not a claim that every ChatGPT version has the same pixels. Use the synthetic gallery examples and inspect the target viewport before tuning.

## Color is the boundary

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| Window shell | #f3f3f3 | #202123 | `--phd-color-shell` |
| Contextual sidebar | #f7f7f7 | #1c1d1e | `--phd-color-sidebar` |
| Main canvas | #ffffff | #181818 | `--phd-color-background` |
| Grouped settings | #f7f7f7 | #232323 | `--phd-color-surface` |
| Input/composer | #ededed | #2a2a2a | `--phd-color-surface-muted` |
| Floating menu | #ffffff | #2b2b2b | `--phd-color-surface-overlay` |
| Hover | #e6e6e6 | #333333 | `--phd-color-surface-hover` |
| Selected rail | #3b3b3b | #303134 | `--phd-color-navigation-selected` |

Use tokens in application CSS, not the literals from this table. Main canvas, sidebar, groups and floats have distinct surfaces. Neutral grays carry hierarchy; blue carries focus/unread/send states; danger remains available for business errors. Do not recolor errors blue merely to match unread dots.

Idle buttons and dropdown triggers have no decorative border or fill. The dropdown is text with a small down chevron. Hover introduces a compact filled target; the opened menu has a rounded surface and subtle shadow. Inputs have a light surface rather than a surrounding box. Preserve necessary input focus, table boundaries, actual drag targets and error state boundaries. “Boundary-free” does not mean invisible states.

## Geometry

| Element | Target |
| --- | --- |
| Window bar | 40px, full width; Back / Forward / Sidebar, then File / Edit / View / Help |
| Global rail | 48px, fixed; bottom avatar remains reachable |
| Selected rail tile | 32×32px, 10px radius |
| Rail icon | 20px; outline idle, white fill selected |
| Unread | 8px blue circle at upper right |
| Contextual sidebar | 248px desktop; content independently scrolls |
| Page/action row | 48px, module tabs left, current actions right |
| Workspace padding | 24px horizontal, 20px vertical; 16px at compact widths |
| Settings body | maximum 720px, centered in remaining main area |
| Reading/chat column | maximum 760px; lists/workspaces have no arbitrary page max-width |
| Controls | 8px radius; 36px default, 30px compact button |
| Menus/dialogs | 12px radius; collision-aware, bounded to viewport |

Remove the selected rail's left stripe. Tooltips sit immediately beside the rail, have a short rounded text surface and no arrow/shortcut line. Preserve keyboard focus independently of hover. The selected tile remains dark enough for white icons in light mode.

## Typography

Use `system-ui, sans-serif`, normal weight 400. Hierarchy comes from size, color, space and position. `font-synthesis:none` prevents accidental synthetic bold. The kit retains originating token names.

| Role | Size / line height |
| --- | --- |
| Caption | 11 / 16px |
| Supporting | 12 / 18px |
| Body/control | 13 / 20px |
| Section | 14 / 20px |
| Contextual toolbar | 15 / 24px |
| Dialog title | 17 / 24px |
| Page title | 18 / 24px |
| Settings heading/emphasis | 20 / 28px |

PHD's special wordmark and chat-sender weights are local exceptions, not generalized ChatGPT measurements. Preserve explicit typography requested by the target product. Do not enlarge every heading, uppercase field captions, add a display font or make all selected labels bold.

## Layout choice

**Workspace/list:** `WorkbenchPage` → one `PageBar` → optional `PageToolbar` → growing `InternalScrollArea` or `VirtualList`. No repeated module h1 when the navigation already identifies it. No 1440/1600px max-width, fixed 620px content height or nested title cards.

**Settings:** host rail → contextual `SettingsNavigation` → `SettingsPage` → `SettingsSection` / `SettingRow`. Search filters category names/keywords only. This is a specific settings/contextual-list pattern; do not add a second vertical taxonomy for every module.

**Chat/read:** retain the contextual conversation list, a compact object title, bounded reading column and bottom composer. No second fake application title bar inside embedded content.

**Standalone utility:** native Windows frame may remain; begin content with a compact tab/action row. Do not add a rail or custom window controls merely because another screenshot contains them.

## Component map

| Need | Export |
| --- | --- |
| Theme/document root | `DesktopRoot`, `useDesktopTheme` |
| Desktop shell | `DesktopShell`, `TitleBar`, `NavigationRail`, `AvatarMenu` |
| Name-only tooltip | `Tooltip` |
| Button/icon action | `Button`, `IconButton` |
| Inputs | `Input`, `Textarea`, `Checkbox`, `Switch`, `EditableCombobox` |
| Selection/menu | `Select`, `MenuButton`, `Tabs` |
| Settings | `SettingsNavigation`, `SettingsPage`, `SettingsSection`, `SettingRow` |
| Dialog/state | `Dialog`, `EmptyState`, `ErrorState`, `LoadingSkeleton` |
| Internal scroll/list | `InternalScrollArea`, `VirtualList`, `FixedVirtualList` |
| Plain workspace | `WorkbenchPage`, `PageBar`, `PageToolbar` |

Select/Menu portals inherit tokens and close predictably. Dialog supports Escape, backdrop close, focus containment and return to trigger; the consumer intercepts `onClose` to protect drafts. Default `Button` is secondary and `type=button`; explicitly opt into primary and form submit.

Arrow cursors across the standalone desktop document are an explicit originating user preference. Hover/focus/disabled states still signal affordance. Respect a different target user's cursor preference rather than secretly imposing it on unrelated applications.
