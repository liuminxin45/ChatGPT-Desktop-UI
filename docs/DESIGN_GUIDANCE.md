# Design guidance for a faithful adaptation

Test nested overlays explicitly. One Escape closes the open Select, menu, Popover or child Dialog while retaining the parent editor and draft; the next Escape may close the editor and return focus. Consumed keys and IME composition belong to the active control. Only the top visible Dialog traps Tab.

Compatibility names such as `SelectControl` use the canonical control and its `size="sm"` density. Audit compatibility aliases and direct browser `confirm/alert/prompt` calls as well as canonical imports. Use the shared `AppConfirmDialog` for discard and destructive decisions; the Host owns draft retention and confirmed actions. A packaged dependency without source is insufficient for a source style audit: inspect a clean source checkout matching the pinned commit.

Review transient notifications, undo actions, popup search, menus and failure conditions explicitly. An import audit that ignores hand-written containers misses incompatible UI. Shared library renderers own popup/notification paint; business layout must not restyle the surrounding Dialog or Popover. Verify close tooltips, Escape, focus return, long descriptions, narrow viewports and successful/failed commands through the actual consumer CSS pipeline.

Audit the work sequence and action meaning before changing glyphs. Inventory every route, dialog, menu and nested detail across coordinated clients. For each, record primary/secondary actions, scrolling, icon semantics, useful text, fixes and observed states. Distinguish source review from rendered acceptance; inaccessible states remain open. A passing source audit cannot establish visual quality.

Prefer a familiar icon for contextual auxiliary actions, a short caption for workflow/confirmation actions, and both only when the glyph adds meaning or status. Remove repeated titles and instructions, not necessary names or consequences. Start with shared components and document the same rules in the maintained Skill before migrating consumers.

Start with the existing product. Inventory each visible route, toolbar, form, dialog, menu, empty/error/loading state and long list. Mark repeated basic controls and inconsistent container widths before coding. A token change alone cannot remove a duplicate header or repair a fixed-height list.

Read the reference images as relationships: the window is a lighter shell around a darker canvas; contextual lists form a quiet side surface; controls gain edges on hover; floating menus are compact and rounded; the selected rail icon changes shape as well as color. The calm comes from consistent geometry and restrained text, not from deleting everything.

Choose a page pattern by the work. Lists should use the whole workspace. Settings need a readable field column. Messages need a stable reading column and composer. An ordinary utility does not need all of ChatGPT's global navigation. Keep product names, workflows and data meaningful to the target application.

Before adding copy, determine what decision it supports. Delete a subtitle that repeats the page name, a “Current theme” line that repeats the select, an “Automatically saved locally” footnote that offers no choice, or a status badge for the normal idle state. Keep input constraints, useful error recovery and consequences of removal. Do not replace accurate business feedback with generic celebratory toasts.

Apply shared components first; business CSS handles only layout and domain states. Align paddings and toolbar heights across comparable pages. Large white buttons in dark mode, blue-black panels among neutral panels and similar-but-different dropdowns are source-level consistency defects, not reasons for more local overrides.

Inspect actual rendered screens side by side with references at the same viewport. Check rail geometry, header height, content width, baseline alignment, menu padding and font weight before details such as animation. Check hovered, selected, disabled and focused states. Open menus near each edge; check long labels, long lists, loading, real failures and failed avatar loading.

When a fidelity detail conflicts with existing functionality, preserve the functionality and adapt its presentation. Do not add fake native controls, replace history behavior with page guesses, clear drafts on theme change, hide errors or break a host-mounted Tool's lifecycle. Explain measured limitations instead of claiming pixel perfection from only one screenshot.


For light-theme boundaries and conversation geometry, use the canonical [design system](DESIGN_SYSTEM.md).


## Record interaction ownership

The supplied ChatGPT Downloads, browser-permissions and Tasks settings captures show static content groups with separate commands, links, selects and switches. Sidebar objects and menu choices may have one primary navigation or selection target with auxiliary controls outside that target. This is an interaction contract, not a rule that only trees may hover. A single-action selection or navigation option may own a whole target; a multi-action business record must remain a static group.

Use `RecordRow` for multi-action records, `RecordLink` for navigation and `RecordAction` or `Button` for commands. Host layout owns column geometry and domain selection state; shared controls own hover and keyboard focus. Never put a row click handler, button role or tab stop around descendant actions. Clicking metadata or space between controls must do nothing. Drag affordance and selected state do not grant click ownership. Keep independent actions discoverable, with visible labels or familiar labelled icons; keyboard focus must not rely on pointer hover. Do not make the entire row brighten when one descendant is hovered or focused.

Use native links for URLs and buttons for commands. Preserve disabled, loading and disclosure states and stable action IDs on the actual target, not its static parent. Validate blank-space clicks, independent outcomes, keyboard focus, long labels and both themes at the supported window sizes.

## Workspace composition and long values

Use one horizontal module navigation layer. Promote independent work destinations into that row instead of stacking Tabs. Ordinary sections use spacing, not nested outlined panels. Table cells use the exported Table family in both standalone and embedded surfaces; multi-action records remain static. Long lists compose VirtualList and RecordRow, with Host-owned column geometry. Select values and menu options remain readable, wrapping within constrained columns rather than silently showing ellipses. Use Select size="sm" for compact rows and InlineNotice for compact conditions with independent recovery actions. Each workspace has one vertical scroll owner; the page bar remains fixed and VirtualList header stays sticky within its single scroll viewport.

## Computed control typography

Input and Textarea own the semantic Body size, regular weight and UI line height; a smaller field label or larger surrounding heading must not resize editable content. Hosts customize semantic tokens, not control classes. Native Tool roots inherit the font family without resetting shared compact button or input typography. Compound Dialog and AlertDialog titles use the dialog-title and heading-line-height tokens; descriptions use Supporting. Visual acceptance must compare computed font sizes and line heights against these tokens through the actual Tailwind and portal pipeline, including nested labels, compact controls and scoped Host token overrides. Imports and source adoption alone do not prove a design-system match.

Module Tabs use one quiet ChatGPT-style selected surface with a fully rounded target, regular text and preserved gaps. Do not combine a filled selected target with a bottom indicator or tab-shaped corners. Hover and keyboard focus remain independently visible. Compatibility APIs reuse the same canonical rendering; the library does not offer a separate legacy or generic visual system. Audit the maintained components against reference relationships rather than accepting them because they are already exported.
## Compatibility is an API boundary

Preserve an old import path only as an export to the canonical renderer. Never retain legacy visual variants, Glass names, ornamental orbs, arbitrary palettes or product CSS in the UI library. ChatGPT controls use semantic tokens, explicit layout primitives and a single visible selection treatment. Review the actual rendered fonts, Tab states, focus and scroll geometry after removing old styles.

RecordRow owns record padding. Use density="compact" and separator rather than local padding, borders, rounded backgrounds or alternating fills. Audit imported aliases, role selectors and returned class properties. Keep business column geometry and domain opacity in the Host. Configure shared control labels once at the client root, including confirmation and accessibility labels; validate provider translations in the actual modal.

## Conversation and settings adoption acceptance

Exports and imports are not rendered adoption. Capture each consumer page in light/dark at desktop and phone widths, then compare the scroll-up, executing-without-output, long-draft, open-calendar and settings states against `examples/composer-integration.tsx`. The prepared-package probe is `npm run test:composer-integration`; it retains strict self-only script/style CSP.

- Compose `ConversationViewport`, a `ScrollEdgeFade`-wrapped shared scroll area, and `ScrollToBottomButton` outside the mask. Show the arrow whenever the reader is above the bottom, even when no new message arrived. Host state owns scrolling, follow-bottom and history anchors. Place `ComposerDock` immediately after the viewport. Do not replace the alpha mask with a Host gradient.
- Use `AIActivity` for an executing task, including an empty assistant response. A plain status tag or an unused AIActivity import does not adopt its sweep. Reduced motion must retain readable static text.
- `ComposerSurface` accepts `input`, `attachments`, `leading`, `controls` and `action` slots for a work composer. Model, effort and permission Select controls belong in its shared toolbar. An unrelated settings Dialog is not the same interaction. The legacy inline `children` form remains supported. Hosts own configuration acknowledgements, permissions, stable retry IDs and send gating; selecting a setting never sends a message. Do not clear drafts or disable Stop while synchronizing unrelated configuration.
- Auto-sized Textarea respects a CSS max-height and switches to internal vertical scrolling after the clamp. Keep a stable scrollbar gutter; long drafts must remain readable, selectable and editable without expanding indefinitely or clipping received text.
- Use the public `DatePicker` for calendar selection. Supply its accessible name, disabled state and `clearable={false}` for required day navigation. Date-only serialization and timezone policy belong to the Host. No business native date input is an equivalent calendar renderer. Retained hidden surfaces close its popup.
- Settings use `SettingsPage`, `SettingsGroup` and `SettingsField`. `SettingsPage` accepts `leading` and `actions` for a back command or page operations, with one real scroll owner. `RecordLink` defaults to a stacked record-content target; do not pass separate icon/label/arrow children and repaint it into a navigation row. A static SettingsField label with an independent named RecordLink/Button keeps proper alignment and action ownership.
