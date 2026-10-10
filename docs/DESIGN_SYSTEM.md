# Desktop design system

This specification combines measured screenshot patterns with an existing desktop implementation. Values below are implementation targets, not a claim that every ChatGPT version has the same pixels. Use the synthetic gallery examples and inspect the target viewport before tuning.

## Color is the boundary

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| Window shell | #f0f3f9 | #202123 | `--desktop-color-shell` |
| Contextual sidebar | #fafbfd | #1c1d1e | `--desktop-color-sidebar` |
| Main canvas | #ffffff | #181818 | `--desktop-color-background` |
| Grouped settings | #fafbfd | #232323 | `--desktop-color-surface` |
| Input | #ededed | #2a2a2a | `--desktop-color-surface-muted` |
| Composer | #ffffff | #2a2a2a | `--desktop-color-composer` |
| Floating menu | #ffffff | #2b2b2b | `--desktop-color-surface-overlay` |
| Hover | #f0f1f3 | #333333 | `--desktop-color-surface-hover` |
| Selected rail | #e4e7ec | #303134 | `--desktop-color-navigation-selected` |

Use tokens in application CSS, not the literals from this table. Main canvas, sidebar, groups and floats have distinct surfaces. Neutral grays carry hierarchy; blue carries unread/send and non-text control focus states; danger remains available for business errors. Do not recolor errors blue merely to match unread dots.

Idle buttons and dropdown triggers have no decorative border or fill. The dropdown is text with a small down chevron. Hover introduces a compact filled target; the opened menu has a rounded surface and subtle shadow. Inputs have a light surface rather than a surrounding box. Text entry uses neutral inset focus or a subtly filled composer, without a blue outer ring. Preserve visible keyboard focus, table boundaries, actual drag targets and error state boundaries. “Boundary-free” does not mean invisible states.

## Geometry

### Versioned client profile

The Demo recreates Windows ChatGPT **26.1002.7124.0**, inspected on 2026-10-09. `DesktopClientSurface` opts into the measured 44px title bar, 52px rail, 36px tile, 372px sidebar, 728px Settings column and 28/36px bold Settings heading. Its body is 14/20px; compact setting labels are 13/20px bold and descriptions 12/16px regular. Sidebar chat rows are 31px. Settings groups use a 16px rounded surface, internal dividers and 52px between groups. Menus use a 16px radius, 29px rows and 16px submenu arrows; the native application menu uses a smaller corner radius.

These values belong to the versioned client profile, not embedded Tools. Portable defaults below remain available for existing products. A browser recreation must follow the observed client structure; do not invent dashboard cards, explanatory badges or alternate workflows. Keep private content synthetic. Record an observed package version and an annotated tag for every alignment release; never infer it from a publication date. See [CLIENT_ALIGNMENT.json](CLIENT_ALIGNMENT.json).

| Element | Target |
| --- | --- |
| Window bar | 40px, full width; Back / Forward / Sidebar, then File / Edit / View / Help |
| Global rail | 48px, fixed; bottom avatar remains reachable |
| Selected rail tile | 32×32px, 10px radius |
| Rail icon | 20px; outline idle, dark fill selected in light mode / white fill in dark mode |
| Unread | 8px blue circle at upper right |
| Contextual sidebar | 248px desktop; content independently scrolls |
| Page/action row | 48px, module tabs left, current actions right |
| Workspace padding | 24px horizontal, 20px vertical; 16px at compact widths |
| Settings body | maximum 720px, centered in remaining main area |
| Reading/chat column | maximum 1120px; lists/workspaces have no arbitrary page max-width |
| Controls | 8px radius; 36px default, 30px compact button |
| Menus/dialogs | 12px radius; collision-aware, bounded to viewport |

Remove the selected rail's left stripe. Tooltips sit immediately beside the rail, have a short rounded text surface and no arrow/shortcut line. Preserve keyboard focus independently of hover. The selected tile remains dark enough for white icons in light mode.

## Typography

Use `system-ui, sans-serif`, normal weight 400 for body copy and controls. Settings titles, category group headings, section headings and field labels use `--desktop-font-weight-emphasis` (600), following the supplied 2026-10-09 references. Keep emphasis selective. `font-synthesis:none` prevents accidental synthetic bold. Native Tool Hosts continue to enforce their own regular-weight contract.

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

Host-specific wordmark and chat-sender weights are local exceptions, not generalized ChatGPT measurements. Preserve explicit typography requested by the target product. Do not enlarge every heading, uppercase field captions, add a display font or make all selected labels bold.

Text controls use a 20px line box with descender clearance; never clip a selected value to `line-height:1`. Center toolbar navigation, values and glyphs vertically, including at fractional scaling. Hover fills and dropdown chevrons transition with the shared motion tokens. Reduced-motion preferences disable decorative transitions.

`NavigationRail` can receive controlled `pinnedIds` and `onPinnedChange` props. Its More menu lists every available destination and exposes a separate pin toggle. The Host owns the pinned set; opening and closing this menu cannot remount page content. `DesktopShell.navigationVisible` retains the navigation subtree when collapsed.

`SettingsCategory.group` provides optional named category sections. Settings sections use a distinct semantic surface and neutral internal row dividers in both themes. Menus use real 16px chevrons rather than a tiny text arrow.

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
| Versioned client layouts | `DesktopClientSurface`, `ClientSidebar`, `SidebarSection` |
| Chat/work input and messages | `ClientComposer`, `ConversationMessage` |
| Nested action menus | `DesktopMenu`, `DesktopMenuItem` |
| Grouped client settings | `SettingsGroup`, `SettingsField`, `SettingsDisclosure` |
| Name-only tooltip | `Tooltip` |
| Button/icon action | `Button`, `IconButton` |
| Inputs | `Input`, `Textarea`, `Checkbox`, `Switch`, `EditableCombobox` |
| Selection/menu | `Select`, `MenuButton`, `Tabs` |
| Settings | `SettingsNavigation`, `SettingsPage`, `SettingsSection`, `SettingRow` |
| Dialog/state | `Dialog`, `EmptyState`, `ErrorState`, `LoadingSkeleton` |
| Internal scroll/list | `InternalScrollArea`, `VirtualList`, `FixedVirtualList` |
| Plain workspace | `WorkbenchPage`, `PageBar`, `PageToolbar` |

Select/Menu portals inherit tokens and close predictably. Pointer dismissal or selection returns DOM focus without adding an outer trigger ring. `InputBehaviorRoot` tracks input modality at the document boundary so portal controls follow the same rule; keyboard navigation retains a visible focus indicator, including the first Tab from the document body. Do not blur restored triggers or remove keyboard indicators to imitate pointer behavior. Dialog supports Escape, backdrop close, focus containment and return to trigger; the consumer intercepts `onClose` to protect drafts. Default `Button` is secondary and `type=button`; explicitly opt into primary and form submit.

The controlled `ClientComposer` separates work and chat input layouts. Work input has a contextual toolbar; chat input has a compact 52px pill, a 24px multiline line box and a 36px circular send target. Text grows to 200px before internal scrolling. Empty, submitting, stoppable and unavailable voice states are explicit. These chat measurements supplement the desktop reference with the signed-out web interface inspected on 2026-10-09; authenticated desktop ChatGPT mode remains a separate fidelity acceptance item. `ConversationMessage` defines neutral user bubbles and response actions, without embedding data services. See `COMPONENTS.md` for ownership and `REPLICA_CONTRACT.md` for the acceptance matrix.

Arrow cursors across the standalone desktop document are an explicit originating user preference. Hover/focus/disabled states still signal affordance. Respect a different target user's cursor preference rather than secretly imposing it on unrelated applications.

## Light-theme boundaries and conversation geometry

Light mode uses a cool pale window shell, near-white sidebar and white content. Selected navigation tiles stay pale gray with dark filled icons; dark mode retains white filled icons. Fine neutral outlines separate white overlays, grouped settings and composers. Avatar images have a subtle outline in light mode. Avoid decorative nested frames.

Conversation messages and their composer share one responsive reading column (maximum 1120px). Use compact centered time markers, regular sender labels and a neutral own-message surface. Keep long messages, code and attachments readable without widening the viewport. Shared floating launcher and panel primitives own color, border, radius and shadow; Hosts own placement and state.
