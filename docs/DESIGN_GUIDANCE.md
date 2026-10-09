# Design guidance for a faithful adaptation

Start with the existing product. Inventory each visible route, toolbar, form, dialog, menu, empty/error/loading state and long list. Mark repeated basic controls and inconsistent container widths before coding. A token change alone cannot remove a duplicate header or repair a fixed-height list.

Read the reference images as relationships: the window is a lighter shell around a darker canvas; contextual lists form a quiet side surface; controls gain edges on hover; floating menus are compact and rounded; the selected rail icon changes shape as well as color. The calm comes from consistent geometry and restrained text, not from deleting everything.

Choose a page pattern by the work. Lists should use the whole workspace. Settings need a readable field column. Messages need a stable reading column and composer. An ordinary utility does not need all of ChatGPT's global navigation. Keep product names, workflows and data meaningful to the target application.

Before adding copy, determine what decision it supports. Delete a subtitle that repeats the page name, a “Current theme” line that repeats the select, an “Automatically saved locally” footnote that offers no choice, or a status badge for the normal idle state. Keep input constraints, useful error recovery and consequences of removal. Do not replace accurate business feedback with generic celebratory toasts.

Apply shared components first; business CSS handles only layout and domain states. Align paddings and toolbar heights across comparable pages. Large white buttons in dark mode, blue-black panels among neutral panels and similar-but-different dropdowns are source-level consistency defects, not reasons for more local overrides.

Inspect actual rendered screens side by side with references at the same viewport. Check rail geometry, header height, content width, baseline alignment, menu padding and font weight before details such as animation. Check hovered, selected, disabled and focused states. Open menus near each edge; check long labels, long lists, loading, real failures and failed avatar loading.

When a fidelity detail conflicts with existing functionality, preserve the functionality and adapt its presentation. Do not add fake native controls, replace history behavior with page guesses, clear drafts on theme change, hide errors or break a host-mounted Tool's lifecycle. Explain measured limitations instead of claiming pixel perfection from only one screenshot.


For light-theme boundaries and conversation geometry, use the canonical [design system](DESIGN_SYSTEM.md).
