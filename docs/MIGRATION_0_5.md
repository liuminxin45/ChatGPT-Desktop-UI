# 0.5: remove migrated visual systems

This revision deletes `src/compat/host.css`, `src/compat/host-shell.css` and `src/compat/glass.tsx`, including the old decorative orbs, Glass controls/toasts, arbitrary palettes, product diff/review selectors and duplicated shell rules. Compatibility modules only export the canonical compound APIs; they contain no renderers or styles. Compound controls now use the same semantic CSS as portable controls, without shadcn appearance utilities.

Import `controls.css` for controls and `shell.css` for the portable shell. The old stylesheet exports and Glass APIs no longer exist. Migrate callers to WorkbenchPage, Surface, shared buttons/inputs/menus/dialogs and the canonical shell. Preserve only documented platform typography/window behavior in the Host; never copy a retired stylesheet into it.

The base sheet no longer styles arbitrary product forms, labels, tables, status classes, source panels or dialogs. Use SettingsForm, FieldRow, MetadataList, PageToolbar, InlineNotice, SettingsSection and Table explicitly. Narrow field rows stack naturally. SettingsSection accepts native section attributes so input scopes and stable surface IDs survive migration.

The obsolete SegmentedControl underline appearance is removed. Segments and Tabs each have one quiet selection treatment. Tabs retain keyboard focus, disabled state and hover/edge gaps. Inputs and compound dialog titles resolve semantic font sizes directly rather than inheriting arbitrary label/Host sizes. Native and Radix checkboxes use the same neutral selection colors.

Tailwind integrations read `--desktop-color-*` directly, including opacity through a color callback. The duplicate `--desktop-hsl-*` palette has been removed. Platform adapters may scan canonical source layout utilities, but control appearance is provided by library CSS.

Validation includes computed typography under small/large labels, scoped Host tokens, Native Tool roots and Radix portals; Tab appearance and keyboard focus; menus, action labels, records, tables, Composer, AI output and virtual scrolling. Consumer installation/build and actual page acceptance must use the same full public revision. This migration does not change persistence, permissions, AI generation strategy or command ownership.
