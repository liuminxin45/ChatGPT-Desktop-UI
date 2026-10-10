# Desktop UI Kit implementation contract

Read `docs/DESIGN_SYSTEM.md` and `docs/DESIGN_GUIDANCE.md` before changing UI. Read `docs/INTEGRATION.md` when changing public interfaces or consumer behavior.

- Visual quality includes geometry and interaction states, not merely a gray palette. Use the synthetic gallery examples to compare actual pixels.
- Preserve one source for controls and semantic tokens. Business layouts compose exported components; they do not restyle buttons, inputs, selects, menus or typography.
- Workspaces fill available width/height. Settings use a 248px contextual sidebar and a maximum 720px reading/form column. Retain a 48px global rail only when the product needs global navigation.
- An explicit client recreation uses the versioned `DesktopClientSurface` profile in `docs/CLIENT_ALIGNMENT.json` (44px title bar, 52px rail, 372px sidebar and 728px Settings column). Match inspected client structures rather than inventing product screens; portable defaults and embedded Tool contracts stay independent.
- Avoid duplicate module titles, redundant subtitles, nested card outlines and competing primary actions. Ordinary sections use color and spacing.
- Idle buttons/selects are transparent; inputs use subtle filled surfaces. Hover, focus, checked, selected, disabled and error states must remain distinguishable in both themes.
- UI uses system fonts and 400 weight by default. Settings titles, category group headings, section titles and field labels use the semantic 600 emphasis weight, as requested on 2026-10-09. Body copy and controls stay regular; native Tool Hosts retain their enforced 400 policy.
- Use outline/fill icon pairs, a 32px selected tile, 20px icon and 8px blue unread dot. Rail tooltips contain only a name; no shortcut text or arrow.
- Preserve visible keyboard focus, labels, menu navigation, dialog focus containment and reduced-motion behavior. Arrow cursors do not replace these signals.
- The host owns native window commands, history, credentials, persistence, language, data and analytics. No Electron IPC, storage service or production data root belongs in this library. Unsupported native actions are disabled.
- UI changes must preserve drafts, selected records, scroll position and mounted business state. A visual theme change cannot trigger business reads or reset the application.
- Pass stable business `actionId` values. The library only provides markers; consumers own exposure, invocation and asynchronous outcome correlation. No inputs or user content go into usage or diagnostics.
- Use Node 24.19.0. Run typecheck, build and visual/interaction tests after functional UI changes. Inspect light/dark screenshots at 1920×1080, 1280×800 and 125% emulation. Emulation is not evidence of changing Windows scaling.
- `dist/`, Skill assets and copied Skill references are generated. Do not hand-edit them. Update source, build and package the Skill. Keep screenshot provenance and validation limitations explicit.
- Do not publish packages, push remotes, replace installed applications or change consumer dependencies without an integration request.

- Multi-action records use static `RecordRow` groups with independent `RecordLink`/`RecordAction`/`Button` targets. Never wrap controls in a clickable row or add whole-row hover/focus fills. Full-target feedback is reserved for an actual single navigation/selection target; tree membership alone does not authorize it. Validate blank-space clicks and keyboard access.
