---
name: chatgpt-desktop-ui
description: Build or refactor a desktop-style app to match the supplied ChatGPT/Codex visual language using reusable controls, neutral themes, compact navigation and measured screenshot validation. Use for explicit ChatGPT-style UI requests; not general landing-page design.
---

# ChatGPT-style desktop UI

For the supplied 2026-10-17 agent composer captures, use `ComposerModelPicker`:
one combined trigger opens effort, a stepped slider commits once per gesture,
the centered model caption opens model choices, and Reset uses that model's
actual default. Do not recreate two separate model/effort dropdowns or hide
reasoning in a settings dialog. `ComposerModelControl` forwards old props to the
same implementation. Keep Host acknowledgement, retry IDs and send gating.
Use `ComposerAddMenu` for files, Plan, Goal and skills the Host can actually run;
`ComposerGoal` for objective, authoritative elapsed/state and independent
edit/pause/remove/expand commands; `PlanReview` for the full proposed Markdown
and explicit execute/continue actions. The Host owns native skills, clarification
questions, goal lifecycle and persistence. No fake plugins or prompt-only mode
emulation. Read the source repository's `docs/INTEGRATION.md` and run
`test:composer-model-modes` through the prepared package in both themes and at
desktop/phone/320px widths. Browser emulation is not a physical device check.

For browser/mobile chat products, use `ChatAppSurface`, `ChatHeader` and controlled
`ChatWorkspace`. The mobile header has independent floating targets; the retained
sidebar becomes a modal drawer without remounting its content or draft. Keep
browser back layers in the Host, respect nested Escape and IME, and test both themes
and real composer bounds. This supplements the native Windows profile rather than
claiming its title bar, geometry or unobserved mobile timing. Read
`docs/CHAT_APP_ALIGNMENT.json` in the source repository for provenance and limits.

For mobile return handling, wrap the application once in `DismissalLayerProvider`
with a stable Host-owned `registerLayer` callback. Canonical Dialog, Select,
EditableCombobox, MenuButton, Popover/DatePicker and the modal ChatWorkspace drawer
register their own dismissal; remove duplicate Host registrations. The Host owns
history entries and native event consumption. Test a cancelable Escape dispatched
on `document` as well as keyboard Escape; opening several nested layers in one
commit must still dismiss the deepest first. Predictive Android gesture progress
requires an actual native bridge and physical-device evidence.

Use `ChatWorkspace sidebarPresentation="catalog"` for a full-width mobile root
catalog and `"drawer"` for contextual conversation navigation. Only the drawer
owns modal focus and a dismissal layer. Its dedicated drag edge follows the finger;
vertical intent and cancellation retain the drawer, content and draft. Do not add
a full-page JavaScript edge-back recognizer that competes with the operating system.

Use `Dialog presentation="sheet"` for contextual phone operations. Desktop retains
the standard dialog; the mobile sheet docks to the visual viewport, owns safe-area
spacing, and permits drag dismissal only from its grip. Body scrolling never
dismisses it. Keep a visible close button and preserve the Host draft on cancellation.
Use `ImageViewer` for image inspection with a Host-provided URL and accessible alt:
it supplies fullscreen presentation, pinch/toolbar zoom, bounded panning and downward
dismissal only at original scale. It does not fetch credentials or download files.
Validate cancellation, multiple fingers, failed images, keyboard alternatives and
retained underlying state in both themes. Browser touch emulation is not a device test.

Tooltips must preserve layout ownership: row, tile and surface actions use the real button as their trigger, including explicit grid placement. Test with accessible labels and disabled states; an unlabeled fixture cannot detect wrapper-induced sizing defects.

Choose shared Button geometry explicitly: command for compact centered actions, row for left-aligned single-target records with shared insets, tile for square contained image previews. Group stacked title and metadata as one content block. Do not apply ordinary command geometry to lists or media. Surface layout is reserved for documented domain graphics such as schedule cells, with native action/accessibility behavior but domain-owned geometry. Multi-action records remain static RecordRow groups.

Verify nested overlay keyboard ownership: Escape closes only the active Select, menu, Popover or child Dialog, preserving its parent editor and draft. Respect consumed keys and IME composition. Only the top visible Dialog contains Tab, and dismissal restores focus to its trigger; test this in the actual consumer portal/CSS pipeline.

Audit compatibility aliases such as `SelectControl`, not only canonical names. Use the shared `size="sm"` API rather than Host height, padding, font or color overrides. Use `AppConfirmDialog` or `Dialog` for draft-discard and destructive confirmation, preserving drafts on cancellation. Verify the actual clean shared source at the pinned revision; an installed package without source cannot establish a clean source audit.

The versioned reference is Windows ChatGPT **26.1002.7124.0**, observed on 2026-10-09. For an explicit client replica, reuse `DesktopClientSurface`, `ClientSidebar`, `SidebarSection`, `DesktopMenu` and grouped `SettingsGroup`/`SettingsField`; match the observed layouts instead of designing a new dashboard. This profile uses 44px title bar, 52px rail, 36px selected tile, 372px contextual sidebar, 728px settings body, 28px bold settings heading and 14px body. Portable defaults below apply to adaptations that do not opt into the profile. Embedded Tool typography and Host ownership remain authoritative.

Inspect missing reference surfaces only within the user's authorization. Confirm the installed package version and retain measurements without publishing private captures or chat titles. Record alignment in `CLIENT_ALIGNMENT.json` and tag a published replica with the observed client version. Do not claim exact fidelity for unobserved screens, proprietary glyphs or disconnected native services.

For explicit 1:1 requests, read [the recreation contract](references/REPLICA_CONTRACT.md) and [the component map](references/COMPONENTS.md). Use the desktop package as the primary reference and ChatGPT web only as a dated supplement for shared UI. Inventory every destination and state; a navigation placeholder remains an open fidelity item. Reuse `ClientComposer` for separate chat/work input layouts and `ConversationMessage` for message geometry. Record unobserved screens explicitly, and never describe the complete client as 1:1 accepted while that inventory has gaps.

Create a faithful adaptation of the supplied client design language while preserving the target product's workflows. This Skill carries a portable React UI package and clean visual examples; it does not require an originating application repository or a specific absolute directory.

Read [design-system.md](references/design-system.md) and the relevant images in [visual-references.md](references/visual-references.md). For a redesign, also read [design-guidance.md](references/design-guidance.md). Read [integration.md](references/integration.md) before adapting host behavior, persistence or embedded surfaces.

## Implement

Include transient and failure surfaces in the audit. Use shared `Toaster`/`toast`, Host-controlled `ToastNotice`, anchored `Popover` and persistent `InlineNotice`. Do not import a third-party toast renderer or hand-paint notifications/popovers. Remove Host overrides of shared overlay backgrounds, corners, shadows and insets; place domain layout inside the overlay. Check notification success/error/undo/dismissal, localized close tooltips, Escape and focus return through the real consumer pipeline. Scan CSS and raw containers as well as shared imports.

For workflow cleanups, audit action meaning and reading order across all requested clients, dialogs, menus and nested states. Prefer shared semantic icons for familiar auxiliary actions; retain short text for save, complete, apply, record, menus and confirmations. Combine glyph and caption only for added meaning or live state. Attachments use a paperclip, deletion a trash can, saving a disk and completion a check; never reuse Plus for attachment or Check for save. Keep one title, one primary action and one main scroll owner. Long editable content uses shared `Textarea autoSize`. Record source review and rendered evidence separately; never declare a whole-product cleanup complete with unobserved surfaces.

Choose a component from the generated API references: [actions](references/api/actions.md), [forms](references/api/forms.md), [navigation](references/api/navigation.md), [layout](references/api/layout.md), [overlays](references/api/overlays.md), [lists](references/api/lists.md), [feedback](references/api/feedback.md), [shell](references/api/shell.md), [client profile](references/api/client.md), [conversation](references/api/conversation.md), [runtime](references/api/runtime.md) or [compound adapters](references/api/compat.md). Read only the families needed for the task. These files and [the API catalog](references/catalog.json) are generated from TypeScript; change implementation props/JSDoc and regenerate, rather than maintaining parallel tables.

Portable/profile implementations belong in `src/components/`; old root entry files are forwarding facades. Compound APIs live in `src/compat/` and share canonical native action/input/scroll rendering. Preserve existing API contracts and Host typography. Before proposing a new control, verify actual reuse or a requested stateful composition; do not build speculative unused components. Use the source adoption audit and integration checks to identify copied Host renderers and mismatched public pins.

Inventory the target routes, dialogs, menus, states and repeated controls. Choose workspace/list, settings, reading/chat or utility layouts based on the user's actual work. Preserve language, data, selections, drafts and existing authorization. Remove redundant module titles and decorative nested frames. An explicitly requested client Demo follows the observed client structure; other products retain their own identity and workflows.

For React, first reuse an existing compatible `chatgpt-desktop-kit` dependency. Otherwise install a pinned library revision or use the packaged `assets/ui/` as one application-level dependency. Do not create separately maintained copies in every client. For embedded React applications, import `components.css` once and mount `DesktopProvider`; it owns only the local theme and its scoped portals. Whole desktop documents import `desktop.css` and mount one `DesktopDocumentAdapter`, while the Host retains document theme/persistence. Legacy `styles.css`/`DesktopRoot` remain document-wide compatibility APIs. Reuse `Button`, `Input`, `Select`, `Tabs`, `Dialog`, `InternalScrollArea` and the layout exports. The package includes source and declarations; `assets/starter/` shows real composition. Use the target's React/runtime constraints and validate compatibility rather than silently upgrading its stack. This repository's Node pinning is not an instruction to change another project's toolchain.

Release clients pin `git+https://github.com/liuminxin45/ChatGPT-Desktop-UI.git#<full-40-character-commit>` and install with lifecycle scripts enabled. Run the packaged integration checker after install; validate the manifest, lockfile, actual installed revision, prepared distribution and pure forwarding adapters. All coordinated clients use the same revision. A local Git/file dependency, copied vendor source, old adapter peer version or skipped prepare step fails release acceptance. Packaged `assets/ui/` remains an isolated starter path, not a substitute for a coordinated public release dependency.

For another framework, use the reference tokens and measurements to adapt the project's shared component layer once. Keep equivalent keyboard, focus, portal and scrolling behavior. Do not sprinkle approximations across individual pages or rewrite a working product into React without authorization.

For a new React example, copy `assets/ui` and `assets/starter` to adjacent directories, run `npm install --install-links --ignore-scripts` inside `starter`, then `npm run typecheck`, `npm run build` and `npm start`. The explicit local-package installation keeps declarations and dependencies inside the consumer. The starter has synthetic content and a deliberate save-failure state; replace those with the target's existing application actions.

The key visual relationships are a neutral window shell, quiet contextual sidebar, darker main canvas in dark mode, borderless idle controls, filled hover states and compact rounded floats. Use the 40px window bar, 48px global rail, 32px selected tile, 20px outline/fill icons and 8px blue unread dots when the target actually has that shell. Keep workspaces full width; settings body maximum 720px. Typography defaults to system fonts and regular weight, with a restrained 11–20px UI scale. Do not force an icon rail or custom title bar into every standalone utility.

Use semantic tokens, not per-page gray literals. Respect explicit user cursor/font preferences; the packaged arrow-cursor policy is an originating desktop preference. Distinguish errors from unread states. Keep visible keyboard focus and labels. Name-only navigation tooltips must have no shortcut line or arrow.

Menu pointer highlight and keyboard focus use the shared surface fill without an outer outline or ring. Radix also focuses items during pointer movement. Reuse the menu's semantic focus rules instead of adding Tailwind outline utilities or allowing generic control focus rules to recolor them. Verify submenu, checkbox/radio, disabled, arrow navigation, Enter activation and focus return through the actual consumer CSS pipeline.


For labelled actions, pass the leading glyph through `Button.icon` instead of placing an SVG directly beside the text. Sibling navigation actions share an icon column, label start and baseline even when visible glyph sizes differ. Use the canonical sidebar action profile described in [design-system.md](references/design-system.md); fix shared geometry rather than adding page-local margins or offsets.

The host owns native window actions, history, credentials, language, application state and analytics. Disable unavailable actions. A theme/language change or sidebar fold cannot remount content, discard drafts, fetch business data again or change a Tool lease. Protect unsaved changes and preserve drafts on failure.

## Verify

Run the target's relevant typecheck/build and meaningful interaction checks. Inspect actual light and dark screens at 1920×1080 and 1280×800; include 125% scaling/emulation if available and say which was used. Compare reference and target at the same viewport. Check container width, toolbar height, rail geometry, text baseline, hover/selected/focus states, menus near edges, long lists, empty/loading/error states, failed avatar images and save failures.

When changing icon-labelled rows, measure sibling label left edges and vertical baselines, and verify that glyph slots stay centered at every supported scale. Inspect the actual renders; a palette check or matching declared SVG sizes does not establish alignment.

Review all affected routes rather than demonstrating only a new settings page. Repair differences in the shared layer where possible. Do not claim high fidelity based only on a palette or a screenshot that was never viewed.

Deliver the implementation, reference-linked screenshots, verified checks and remaining host-specific limitations. This Skill does not authorize publishing, installing a product, sending messages, migrating production data or pushing commits. Follow the user's actual authorization for those actions.

## Workspace composition and long values

Use one horizontal module navigation layer. Promote independent work destinations into that row instead of stacking Tabs. Ordinary sections use spacing, not nested outlined panels. Table cells use the exported Table family in both standalone and embedded surfaces; multi-action records remain static. Long lists compose VirtualList and RecordRow, with Host-owned column geometry. Select values and menu options remain readable, wrapping within constrained columns rather than silently showing ellipses. Use Select size="sm" for compact rows and InlineNotice for compact conditions with independent recovery actions. Each workspace has one vertical scroll owner; the page bar remains fixed and VirtualList header stays sticky within its single scroll viewport.

Use ComposerActionButton for message composer send/progress/stop states. Pass explicit state and localized labels; no Host-specific button paint or icons. Preserve Send/Stop meaning, stable action IDs, cancellation acknowledgement and drafts. Enter never triggers Stop. Verify the shared composer state gallery in both themes and work/chat profiles.

## AI activity and output

AI thinking, tool execution and replying use `AIActivity` text sweep instead of rotating indicators. Use `AIResponse` for newly received streamed or whole-result prose, inside a retained `AIResponseProvider`; loaded history is static. Use `Markdown variant="ai"` for other AI prose. Reuse the shared inline-code, code-block, list, quote and table styling, including the scoped monospace AI code token. Keep canonical content for storage, copy, export and apply. Verify reduced motion, grapheme safety, cancellation, hidden surfaces, virtual-row remounts and bottom-follow without displacing readers. Ordinary loading and domain-specific Remarkup are separate.
Audit app components, pages, Tool renderers and business CSS, including className utility styles and referenced class constants. Keep hidden file choosers and specialized controls as explicit, verifiable exceptions. TableCell pinned/tone carries opaque fixed-column surfaces; the Host only positions columns.

## Computed control typography

Input and Textarea own the semantic Body size, regular weight and UI line height; a smaller field label or larger surrounding heading must not resize editable content. Hosts customize semantic tokens, not control classes. Native Tool roots inherit the font family without resetting shared compact button or input typography. Compound Dialog and AlertDialog titles use the dialog-title and heading-line-height tokens; descriptions use Supporting. Visual acceptance must compare computed font sizes and line heights against these tokens through the actual Tailwind and portal pipeline, including nested labels, compact controls and scoped Host token overrides. Imports and source adoption alone do not prove a design-system match.

Module Tabs use one quiet ChatGPT-style selected surface with a fully rounded target, regular text and preserved gaps. Do not combine a filled selected target with a bottom indicator or tab-shaped corners. Hover and keyboard focus remain independently visible. Compatibility APIs reuse the same canonical rendering; the library does not offer a separate legacy or generic visual system. Audit the maintained components against reference relationships rather than accepting them because they are already exported.
## Legacy visual cleanup

Keep the Host's CSP intact. The prepared library supplies notification and Select
CSS as external assets; desktop modal locks preserve wheel/touch isolation without
injecting global scrollbar styles. Validate the installed distribution under
`script-src 'self'; style-src 'self'`, including menus, dialogs, notification
actions, modal scrolling, blocked background scrolling and Escape/focus return.

Compatibility paths only forward APIs to canonical components. Do not retain or restore Glass styles, migrated Host global sheets, product selectors, shadcn appearance utilities or a second underline Tab mode. `controls.css` owns shared appearance; `shell.css` owns portable shell geometry. A Host may retain its documented platform font/window policy. Use explicit SettingsForm, FieldRow and MetadataList rather than CSS that implicitly restyles arbitrary forms, labels or tables. Validate actual computed typography and selected/hover/focus states, not only the package import.

Semantic confirmations and menu commands use `AlertDialogAction variant="destructive"` and `DropdownMenuItem variant="destructive"`. Do not paint danger actions in Hosts. Audit navigation, metadata, avatars, menu items, floating actions and raw positioned overlays alongside form controls. Radio groups retain the same shared option insets as direct menu children.

RecordRow owns record padding. Use density="compact" and separator rather than local padding, borders, rounded backgrounds or alternating fills. Audit imported aliases, role selectors and returned class properties. Keep business column geometry and domain opacity in the Host. Configure shared control labels once at the client root, including confirmation and accessibility labels; validate provider translations in the actual modal.

## Host adapters without local control CSS

Buttons keep their text/icon geometry stable on hover and press; feedback changes color and keyboard focus. Hosts must not restore pressed scaling or counteract it with local overrides.

Use `ComposerSurface` when Host attachment, keyboard or native draft contracts require a custom composition. It supplies the shared input boundary, insets and textarea sizing; Host children retain all state and event ownership. `ClientComposer` remains the ready-made composition. `Tabs stretch` supports equal-width mobile navigation without Host rules targeting shared tab buttons.

`Dialog` follows the visual viewport, including keyboard resize and viewport offset, and owns its responsive margins. Do not reposition the shared dialog with Host CSS. `ToastNotice` and `Toaster` accept `mobileBottomInset` (pixels, default 12) to reserve Host navigation space without repainting notifications.

`Markdown variant="ai"` accepts `onCopyCode(text)` for a native clipboard bridge. The shared renderer retains code surfaces, language headers, failure feedback and keyboard access; the callback receives exact canonical source. Hosts can normalize transport trailing newlines deliberately in that callback. Use the semantic `CopyIcon` export for copy commands.

## Conversation and settings adoption acceptance

Exports and imports are not rendered adoption. Capture each consumer page in light/dark at desktop and phone widths, then compare the scroll-up, executing-without-output, long-draft, open-calendar and settings states against `examples/composer-integration.tsx`. The prepared-package probe is `npm run test:composer-integration`; it retains strict self-only script/style CSP.

- Compose `ConversationViewport`, a `ScrollEdgeFade`-wrapped shared scroll area, and `ScrollToBottomButton` outside the mask. Show the arrow whenever the reader is above the bottom, even when no new message arrived. Host state owns scrolling, follow-bottom and history anchors. Place `ComposerDock` immediately after the viewport. Do not replace the alpha mask with a Host gradient.
- Use `AIActivity` for an executing task, including an empty assistant response. A plain status tag or an unused AIActivity import does not adopt its sweep. Reduced motion must retain readable static text.
- `ComposerSurface` accepts `input`, `attachments`, `leading`, `controls` and `action` slots for a work composer. Model, effort and permission Select controls belong in its shared toolbar. An unrelated settings Dialog is not the same interaction. The legacy inline `children` form remains supported. Hosts own configuration acknowledgements, permissions, stable retry IDs and send gating; selecting a setting never sends a message. Do not clear drafts or disable Stop while synchronizing unrelated configuration.
- Auto-sized Textarea respects a CSS max-height and switches to internal vertical scrolling after the clamp. Keep a stable scrollbar gutter; long drafts must remain readable, selectable and editable without expanding indefinitely or clipping received text.
- Use the public `DatePicker` for calendar selection. Supply its accessible name, disabled state and `clearable={false}` for required day navigation. Date-only serialization and timezone policy belong to the Host. No business native date input is an equivalent calendar renderer. Retained hidden surfaces close its popup.
- Settings use `SettingsPage`, `SettingsGroup` and `SettingsField`. `SettingsPage` accepts `leading` and `actions` for a back command or page operations, with one real scroll owner. `RecordLink` defaults to a stacked record-content target; do not pass separate icon/label/arrow children and repaint it into a navigation row. A static SettingsField label with an independent named RecordLink/Button keeps proper alignment and action ownership.


## Reference work composer and inline queue (2026-10-17)

The user-supplied 499x173 dark capture shows an upper draft editor and a lower
command row: Plus for attachment acquisition and a permissions shield on the
left, model plus muted reasoning value on the right, followed by the blue
Send/Stop circle. Use `ComposerSurface layout="work"` for this two-level
composition; `layout="chat"` remains the intentionally compact inline layout.
The screenshot does not establish a ChatGPT package version, device scale,
light theme or phone geometry. The kit's phone/light adaptations are verified
browser layouts, not claims about an unobserved native client.

Compose `ComposerStack`, `ComposerQueue` and `ComposerSurface`. The queue uses
static one-line message previews, independent Steer/Delete targets, a per-item
More menu, and optional live activity. A bounded preview can expose a Host-owned
complete queue view. Blank row space is inert. Do not replace it with a single
queue-count button and require a dialog to see the next message.

`ComposerAttachmentButton` is the explicit composer exception to the ordinary
paperclip action: its Plus opens attachment acquisition. Elsewhere keep
`AttachmentIcon`. `ComposerPermissionSelect` renders a shield and exposes the
selected permission as accessible text and tooltip; `risk="elevated"` only
changes presentation, never permissions. Host data decides risk and capability.
`ComposerModelControl` groups two real Select controls on one baseline. Model
and reasoning remain independently selectable and preserve their full popup
labels. Closed model values may ellipsize in the bounded toolbar.

Hosts own drafts, files, model lists, configuration acknowledgements, queue
mutation IDs and stop/pause semantics. Opening a menu or selecting settings
never sends a message. Supply accurate localized commands; do not offer side
chat, voice or queue modes without actual Host capabilities. Do not infer
"disable queueing" semantics from a Host operation which pauses active output.
Unavailable edit/steer actions remain disabled. Unknown original attachments
must never be silently discarded when editing a queued message.

`MenuButton` supports a named icon-only trigger, item icons and collision-aware
side placement. Keep shared focus, Escape and dismissal-layer behavior. Run
`test:composer-reference`, `test:composer`, `test:composer-integration` and the
consumer's settings, attachments and queue edit regressions; capture running,
open menus, long drafts, failures and both themes at desktop/phone widths.


### Compact popup and navigation ownership

Use SettingsPage for settings and computer/device administration, entered from
AvatarMenu at the rail footer. Dialog is for a short edit, picker or decision.
SearchDialog is the public query-led search palette used by the client demo;
provide controlled query, sections and localized loading/empty/error state.
Never copy the retired demo search CSS into a Host. Title uses Dialog Title,
section labels use Section, secondary content Supporting. Do not style all h2
inside Dialog as titles. Keep one visible New conversation command, one module
navigation and current-header notifications. SidebarIcon folds navigation;
CloseIcon closes an overlay. Phone navigation must remain reachable.
