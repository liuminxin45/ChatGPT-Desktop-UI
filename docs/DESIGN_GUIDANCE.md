# Design guidance for a faithful adaptation

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

Use one horizontal module navigation layer. Promote independent work destinations into that row instead of stacking Tabs. Ordinary sections use spacing, not nested outlined panels. Table cells use the exported Table family in both standalone and embedded surfaces; multi-action records remain static. Long lists compose VirtualList and RecordRow, with Host-owned column geometry. Select values and menu options remain readable, wrapping within constrained columns rather than silently showing ellipses. Use Select size="sm" for compact rows and InlineNotice for compact conditions with independent recovery actions. Each workspace has one vertical scroll owner; the page bar and list header remain outside the growing list viewport.
