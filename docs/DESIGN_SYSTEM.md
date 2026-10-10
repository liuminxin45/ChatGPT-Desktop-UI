# Desktop design system

## Action meaning and reading order

Organize around the current work: understand the object, perform its actions, record progress, then adjust secondary properties. Use one primary action at a time. Keep the title once, actions beside their objects, and dangerous actions apart from routine completion. A detail editor has one main scroll owner; long summaries and action text wrap instead of disappearing inside short fields. Use `Textarea autoSize` when the surrounding document should scroll.

Use icon-only controls for familiar contextual actions: attachment, edit, delete entry, refresh and source. Keep short visible labels for save, complete, apply, process recording, menu items and destructive confirmations. Add both glyph and caption only when the glyph contributes meaning or live state, such as an assistant handoff or busy indicator. Do not decorate every label.

Use the exported `AttachmentIcon` (paperclip), `DeleteIcon` (trash), `EditIcon` (pencil), `RefreshIcon`, `LinkIcon`, `SourceIcon` (external link), `SaveIcon` (disk) and `CompleteIcon` (circle check). Plus means creation; never use it for attachments. X means close/cancel/remove from an unsaved selection, not permanent deletion. A check means completion, not saving. Navigation has its existing outline/fill vocabulary.

Icon-only actions require a localized accessible name and hover/focus tooltip, including disabled and busy states. Preserve field labels, selected values, user content and useful errors. Common actions stay visible; low-frequency actions may enter a labelled menu. Never infer icon meaning or presentation from label text at runtime.

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

Menu items use the shared hover fill for pointer highlight and keyboard focus, including submenu, checkbox and radio items. They never draw an outer outline or focus ring. Radix may focus an item on pointer movement; that focus must not activate a generic control outline. Compatibility menus must not use Tailwind `outline-none` (a transparent solid outline in Tailwind 3), and global focus rules must defer to the menu's semantic state. Validate these states through the real Tailwind pipeline and Radix interactions with `npm run test:menus`; keep arrow navigation, Enter activation, disabled items and focus return intact.

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

Rail hover uses the navigation tile surface and foreground rather than the generic control hover surface, which is too close to the pale shell in light mode. Idle destinations retain outline icons; the selected destination retains its filled icon. Pointer exit clears only the hover fill.

### Icon and label alignment

Use `Button.icon` for a leading action glyph and keep the label in `children`. Sibling navigation actions must share an icon column, label left edge and vertical baseline. The visible glyph can be smaller than its column; it remains centered and cannot move the label. Trailing status icons and counts remain separate from the leading action slot. Do not fix alignment with per-label margins, transforms or different gaps.

Client sidebar actions compose `Button` with `className="client-sidebar-link"` and the `icon` prop. The shared client profile owns their 32px targets, 16px icon columns, 20px line boxes and 10px label gap. Demo and Host composition must reuse this geometry rather than maintain a second sidebar-action implementation.

Changes to these rows must verify rendered label left edges and vertical baselines, centered glyph columns and hover/focus targets in both themes and at supported scaling. Check a smaller glyph beside a regular glyph, not only a set of identical icons; computed SVG dimensions alone are insufficient.

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
| Inputs | `Input`, `InputGroup`, `Textarea`, `Checkbox`, `Switch`, `EditableCombobox` |
| Selection/menu | `Select`, `MenuButton`, `Tabs` |
| Settings | `SettingsNavigation`, `SettingsPage`, `SettingsSection`, `SettingRow` |
| Dialog/state | `Dialog`, `EmptyState`, `ErrorState`, `LoadingSkeleton` |
| Internal scroll/list | `InternalScrollArea`, `VirtualList`, `FixedVirtualList` |
| Short list flow | `ListStack` |
| Plain workspace | `WorkbenchPage`, `PageBar`, `PageToolbar` |

Select/Menu portals inherit tokens and close predictably. Pointer dismissal or selection returns DOM focus without adding an outer trigger ring. `InputBehaviorRoot` tracks input modality at the document boundary so portal controls follow the same rule; keyboard navigation retains a visible focus indicator, including the first Tab from the document body. Do not blur restored triggers or remove keyboard indicators to imitate pointer behavior. Dialog supports Escape, backdrop close, focus containment and return to trigger; the consumer intercepts `onClose` to protect drafts. Default `Button` is secondary and `type=button`; explicitly opt into primary and form submit.

The controlled `ClientComposer` separates work and chat input layouts. Work input has a contextual toolbar; chat input has a compact 52px pill, a 24px multiline line box and a 36px circular send target. Text grows to 200px before internal scrolling. Empty, submitting, stoppable and unavailable voice states are explicit. These chat measurements supplement the desktop reference with the signed-out web interface inspected on 2026-10-09; authenticated desktop ChatGPT mode remains a separate fidelity acceptance item. `ConversationMessage` defines neutral user bubbles and response actions, without embedding data services. See `COMPONENTS.md` for ownership and `REPLICA_CONTRACT.md` for the acceptance matrix.

Arrow cursors across the standalone desktop document are an explicit originating user preference. Hover/focus/disabled states still signal affordance. Respect a different target user's cursor preference rather than secretly imposing it on unrelated applications.

## Light-theme boundaries and conversation geometry

Light mode uses a cool pale window shell, near-white sidebar and white content. Selected navigation tiles stay pale gray with dark filled icons; dark mode retains white filled icons. Fine neutral outlines separate white overlays, grouped settings and composers. Avatar images have a subtle outline in light mode. Avoid decorative nested frames.

Conversation messages and their composer share one responsive reading column (maximum 1120px). Use compact centered time markers, regular sender labels and a neutral own-message surface. Keep long messages, code and attachments readable without widening the viewport. Shared floating launcher and panel primitives own color, border, radius and shadow; Hosts own placement and state.


## Record interaction ownership

The supplied ChatGPT Downloads, browser-permissions and Tasks settings captures show static content groups with separate commands, links, selects and switches. Sidebar objects and menu choices may have one primary navigation or selection target with auxiliary controls outside that target. This is an interaction contract, not a rule that only trees may hover. A single-action selection or navigation option may own a whole target; a multi-action business record must remain a static group.

Use `RecordRow` for multi-action records, `RecordLink` for navigation and `RecordAction` or `Button` for commands. Host layout owns column geometry and domain selection state; shared controls own hover and keyboard focus. Never put a row click handler, button role or tab stop around descendant actions. Clicking metadata or space between controls must do nothing. Drag affordance and selected state do not grant click ownership. Keep independent actions discoverable, with visible labels or familiar labelled icons; keyboard focus must not rely on pointer hover. Do not make the entire row brighten when one descendant is hovered or focused.

Use native links for URLs and buttons for commands. Preserve disabled, loading and disclosure states and stable action IDs on the actual target, not its static parent. Validate blank-space clicks, independent outcomes, keyboard focus, long labels and both themes at the supported window sizes.

## Workspace composition and long values

Use one horizontal module navigation layer. Promote independent work destinations into that row instead of stacking Tabs. Ordinary sections use spacing, not nested outlined panels. Table cells use the exported Table family in both standalone and embedded surfaces; multi-action records remain static. Long lists compose VirtualList and RecordRow, with Host-owned column geometry. Select values and menu options remain readable, wrapping within constrained columns rather than silently showing ellipses. Use Select size="sm" for compact rows and InlineNotice for compact conditions with independent recovery actions. Each workspace has one vertical scroll owner; the page bar and list header remain outside the growing list viewport.


## Composer scroll boundaries

Wrap only the message/body viewport in `ScrollEdgeFade`; place a `ComposerDock` immediately after it. The boundary adds no DOM wrapper and the shared `InternalScrollArea`, `VirtualList` and `FixedVirtualList` preserve their scroll element, refs and anchor protocols. Ordinary scroll areas remain unchanged. Nested scroll areas do not inherit the outer mask.

The bottom 24px use an alpha mask: fully opaque at the start and fully transparent at the dock edge in both themes. Native scrollbar gutters stay opaque. The mask remains enabled at the end; shared bottom padding keeps the last content above it. Focused descendant controls are scrolled into the readable region. Floating actions and portal menus belong outside the masked viewport.

`ComposerDock` owns the zero top gap, 12px bottom spacing and compact/responsive horizontal insets. Do not add Host gradient, mask, background overlays or competing top padding. Disabled boundaries (`enabled={false}`) leave the underlying scroll area unchanged. This pattern applies to scrolling conversations adjoining fixed input areas, not ordinary lists, tables, menus or inline forms.

Use one horizontal module navigation layer. Promote independent work destinations into that row instead of stacking Tabs. Ordinary sections use spacing, not nested outlined panels. Table cells use the exported Table family in both standalone and embedded surfaces; multi-action records remain static. Long lists compose VirtualList and RecordRow, with Host-owned column geometry. Select values and menu options remain readable, wrapping within constrained columns rather than silently showing ellipses. Use Select size="sm" for compact rows and InlineNotice for compact conditions with independent recovery actions. Each workspace has one vertical scroll owner; the page bar remains fixed and VirtualList header stays sticky within its single scroll viewport.

## Composer send and stop action

Message composers use `ComposerActionButton` in chat, Codex/work, threads, follow-up instructions, agent conversations, mail and comments. The supplied ChatGPT client button captures are the reference for the blue circular up-arrow and filled square. Use one 32px circle in every composer, a 16px up-arrow, a 10px filled square and the shared send foreground/background/hover tokens; the chat client profile must not override size or colors. Preserve keyboard focus and hover/focus tooltips.

| Host state | Glyph | Interaction |
| --- | --- | --- |
| ready | Up arrow | Send, disabled when text/attachments are not ready |
| sending | Progress ring | Disabled while the transport acknowledgement is pending |
| stoppable | Filled square | Stop the active response when the Host supports cancellation |
| stopping | Progress ring | Disabled until cancellation is acknowledged |

State is explicit, never inferred from button text or a CSS class. `sendDisabled` only affects Send; an empty next draft cannot disable Stop. Sending must not claim cancellation is possible unless the Host provides it. Disabled/busy controls retain a localized accessible name and tooltip. Enter submits only a ready Send, Shift+Enter/IME remain text input, and Enter in an active response must not stop it. Stop is a pointer/Space command. Hosts own duplicate suppression, operation acknowledgements, failure recovery, draft preservation and correlated usage outcomes. The component owns presentation and action markers only.

A labelled business operation (create, publish a report, apply, run a batch, stop a service) remains a labelled action; use its semantic icon. It is not a message composer simply because its handler submits data. Do not apply the circle to every form submit or Worker lifecycle command. The composer state gallery is `examples/composer-actions.tsx`; `npm run test:composer` covers all states, work/chat profile parity, keyboard behavior, draft preservation, reduced motion, both themes and 125% emulation.

## AI activity and response presentation

Use `AIActivity` for AI thinking, tool execution and generation: a quiet text-only neutral sweep, never a rotating glyph. Ordinary loading controls are independent. Reduced motion and forced colors use static readable text.

AI prose uses `Markdown variant="ai"` or `AIResponse`: neutral code surfaces, baseline-aligned inline code, language/copy headers, wrapped prose and horizontally scrollable code/tables. Only AI code uses `--desktop-font-ai-code`; other Host typography retains its existing contract. No decorative backticks are rendered.

Mount `AIResponseProvider` above virtualized conversation rows. Supply a stable `responseId` and set `animate` only for a newly received response. The provider retains session offsets/timing without response text; history is static. Streaming and complete responses share grapheme-safe batched presentation. Complete output catches up within approximately two seconds; cancellation, failure, hidden surfaces and reduced motion show all received content immediately. Host storage, copy/export/apply and diagnostics continue using canonical content, never the visible prefix.

The Host remeasures dynamic rows and follows output only while the reader is at the bottom. Preserve history scroll position, drafts, selections and message state across theme/language changes. Animation timing is an adaptation requested on 2026-10-10, not a measured native-client fidelity claim. See the synthetic `/?ai-demo=1` scenario page for repeatable states.
`TableCell` 的 `pinned` 为固定列提供不透明共享背景，`tone="warning"` 表达单元格业务警告。列的定位与宽度仍由业务布局决定。采用审计解析基础控件的静态、条件、模板与常量 className；字体、填色、描边、圆角和 padding 必须由共享 props/state 表达，工具类也不是例外。

Host-owned virtualizers use `ScrollEdgeFade virtualized` and the exported `scrollEdgeFadeSize` for both `paddingEnd` and `scrollPaddingEnd`. Shared VirtualList does this automatically. Virtual padding replaces viewport padding, so total height, end alignment and anchor offsets include exactly one fade allowance.

## Computed control typography

Input and Textarea own the semantic Body size, regular weight and UI line height; a smaller field label or larger surrounding heading must not resize editable content. Hosts customize semantic tokens, not control classes. Native Tool roots inherit the font family without resetting shared compact button or input typography. Compound Dialog and AlertDialog titles use the dialog-title and heading-line-height tokens; descriptions use Supporting. Visual acceptance must compare computed font sizes and line heights against these tokens through the actual Tailwind and portal pipeline, including nested labels, compact controls and scoped Host token overrides. Imports and source adoption alone do not prove a design-system match.

Module Tabs use one quiet ChatGPT-style selected surface with a fully rounded target, regular text and preserved gaps. Do not combine a filled selected target with a bottom indicator or tab-shaped corners. Hover and keyboard focus remain independently visible. Compatibility APIs reuse the same canonical rendering; the library does not offer a separate legacy or generic visual system. Audit the maintained components against reference relationships rather than accepting them because they are already exported.
## One visual system; no migrated compatibility styles

`src/compat` contains export forwarding only. Compound Radix controls live in `src/components/radix` and use the canonical semantic control CSS. Glass, orbs, separate underline Tab variants, copied shadcn appearance utilities, Host business selectors and the retired `host.css` / `host-shell.css` are removed. Do not copy them into a consuming app or hide them behind overrides. Host-specific platform fonts/window behavior remain a thin Host policy. Settings forms, field rows and metadata lists opt into explicit shared components; the library never styles arbitrary product `form`, `label`, `table` or business class names.
