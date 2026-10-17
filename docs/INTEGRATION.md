# Integration

For chat-focused browser/mobile products, compose `ChatAppSurface`, `ChatHeader`
and `ChatWorkspace`. Supply `sidebarOpen`, `onSidebarOpenChange`, localized
`sidebarLabel`/`closeSidebarLabel`, and optional `sidebarId`/`contentId` for existing
Host anchors. Both subtrees remain mounted while visibility changes. A mobile
drawer owns focus containment, Escape, backdrop and edge swipe; the Host owns
route changes, browser back layers and desired initial visibility. Header slots
accept existing shared controls. Never repaint them in consumer CSS.

Use the semantic `ComputerIcon` for a computer/device switch action. An icon-only
header trigger retains its accessible name and tooltip; the Host owns the device
choices, current selection, connectivity and draft restoration.

Use `ChatHeader.hideMobileTitle` for the icon-only phone header when its title is
already present in the document. `ComposerSurface layout="chat"` puts attachment,
editable draft and the canonical Send/Stop action in one compact row. Optional
`controls` remain a visible second row for model, effort and permission selectors;
Hosts must preserve confirmation gates and cannot silently hide required settings.

Text inputs and Textarea use border-box sizing in the canonical control sheet.
Auto-sized drafts therefore respect the declared maximum outer height even in a
Host without a document-wide box-sizing reset; overflow stays internally editable.

Desktop consumers may retain `script-src 'self'; style-src 'self'`. The prepared
package ships notification and Select viewport rules in its external stylesheet.
Sonner keeps queue behavior without injecting CSS. Modal wheel/touch isolation is
retained; the shared canvas owns body overflow, so overlays do not inject a second
global scrollbar sheet or compensate an absent body gutter. Import the shared
stylesheet once. Do not relax CSP or restore Host scrollbar/control paint.

## Dependency ownership

Use `chatgpt-desktop-kit` as the sole control, icon, token and base-style implementation. Pin an immutable commit or package version in the consumer lockfile. Update consumers together and validate them against that exact revision. Do not copy source into each client or synchronize implementations bidirectionally.

Application-local component and icon paths may remain as compatibility exports. Only platform adapters, service errors, localization catalogs and business-specific compositions remain in the client. Standalone clients import this package directly. The library has no application IPC, credential service, business data root or Worker lifecycle.

Release manifests use `git+https://github.com/liuminxin45/ChatGPT-Desktop-UI.git#<full-40-character-commit>`. Install with normal `npm ci` or `npm install`; Git `prepare` builds the JavaScript, CSS and declarations. Do not use `--ignore-scripts` in consumers. A `git+file:` source, local symlink or vendor directory is not a portable release dependency. Each private adapter's peer version must match the installed kit release.

Run `node node_modules/chatgpt-desktop-kit/dist/check-consumer.mjs` after installation. Optionally set `DESKTOP_UI_REVISION` and `DESKTOP_UI_VERSION` to coordinate multiple clients. The exported `checkConsumer(root, options)` from `chatgpt-desktop-kit/integration-check` returns a bounded result instead of exiting. Declare pure `forwarders`, `styleForwarders`, `adapterManifests` and `retiredPaths` in a consumer-owned `ui.integration.json`; paths stay inside that consumer. This checker compares the manifest, both lockfiles, installed version, distribution and declared adapters without scanning business data.

npm may canonicalize a GitHub HTTPS dependency to a `git+ssh://git@github.com/` lockfile URL. The checker accepts that normalization only for this exact public repository and the manifest's complete revision. A different owner, repository, local path or revision still fails. The manifest remains an HTTPS source; consumers need no path to the library checkout.

Before upgrading production consumers, install the public pinned commit in a fresh isolated fixture and build a small React composition. Then run the real consumers' typechecks, builds and relevant interaction probes. Do not silently switch the release pin back to a local checkout after a network failure.

Version 0.3 changes the package identity to `chatgpt-desktop-kit` and uses `--desktop-*` tokens, `desktop-*` classes, `data-desktop-*` markers, `DesktopIconProps` and the `desktop:restore-list-anchor` event. Update imports, Tailwind content scans, CSS references and Host marker readers together. Existing stable feature, surface and action ID values remain unchanged; this migration does not reset usage series or stored preferences. No legacy application namespace aliases are shipped.

## Styles and surfaces

For new embedded React integrations use `components.css` with `DesktopProvider`. Its controlled `theme`/`onThemeChange` and uncontrolled `defaultTheme` support light/dark/system without document mutation or storage ownership. Scoped Radix portal wrappers inherit the actual origin's semantic overrides, native Tool typography and localization. See [0.6 migration](MIGRATION_0_6.md).

Whole desktop documents use `desktop.css` with exactly one `DesktopDocumentAdapter`; document theme/persistence remains Host-owned. The following legacy entries remain compatible during migration and are explicitly document-wide.

Standalone React documents import `styles.css` once and mount `DesktopRoot` (also exported as `DesktopSurface`). An optional application-specific storage key controls theme persistence; native storage stays in the Host's managed profile. The root tracks system preference and restores document state on unmount.

Hosts import `controls.css` and, when using the portable shell, `shell.css` once. The package owns control appearance through semantic CSS. `compat/*` only forwards compound APIs to canonical renderers in `src/components/radix`; it contains no JSX, styles or second visual variants. The removed `host.css`, `host-shell.css` and Glass exports must not be copied into a Host. A Host may keep a thin platform font/window policy and business compositions, without repainting shared controls. Tailwind hosts still scan the package sources for layout utilities.

Embedded Tools inherit Host styles and typography. They must not mount another theme root, title bar or renderer error boundary. `ToolVisibilityContext` closes overlays when a retained surface is hidden; it does not own the surface lease.

## Icon actions

Use shared semantic action exports for attachment/delete/edit/refresh/link/source/save/complete. Auxiliary contextual actions may be icon-only; save, complete, apply, recording and confirmations keep short visible labels. Do not add redundant icons to all text actions. `Textarea.autoSize` is opt-in and shares measurement across portable and compatibility controls; its surrounding body owns scrolling. Existing inputs remain unchanged.

Pass the action glyph as `icon` to either Button entry and keep its translated label in `children`. Labels remain visible by default. Menus, view/filter choices, primary workflow actions, confirmation/destructive actions and business-specific operations need visible names; an icon alone is insufficient.

Sibling navigation actions follow “Icon and label alignment” in the [design system](DESIGN_SYSTEM.md). A smaller visible glyph must not shift the label. Do not place the leading SVG directly in `children` when the action supports `icon`, or add Host-only offsets to repair alignment.

Opt in to `iconOnly` for familiar, compact toolbar/row controls such as close, remove, search, refresh and message hover actions. The compatibility Button's `size="icon"` also opts in. These controls show their names on hover/focus, including busy and disabled states. Existing `title` values become shared tooltips; a surrounding Tooltip suppresses duplicate hints. Preserve counts, state, record names and selected values.

The compatibility DropdownMenuItem accepts `icon` and `actionId`, always displays its label and shortcut, and retains keyboard typeahead. Use stable Host-owned action identifiers. These primitives add no analytics events or diagnostic content. Shared portals close when their Tool Surface becomes hidden.

## Host behavior

`TitleBar` presents callbacks and capability flags. The Host owns history boundaries, sidebar availability, native editing, tray behavior, maximize and exit saving. Reuse one action definition for custom and native menus; disable unavailable actions.

`DesktopShell` hides contextual sidebars with CSS and preserves their React subtree. Hosts retain selections, drafts and module-specific sidebar preferences. Avatar images come from validated Host identity; absent or failed images use a neutral fallback. Saving configuration does not establish authentication.

`DesktopShell.navigationVisible` also retains the global rail when hidden. `NavigationRail` optionally accepts controlled `pinnedIds` and `onPinnedChange`; More remains reachable when every destination is unpinned. Hosts own persistence and pin policy. Defaults preserve existing integrations without a More menu. Supply `moreLabel`, `pinLabel` and `unpinLabel` for localization.

`SettingsCategory.group` is optional and participates in category search. Settings headings and field labels use the semantic emphasis weight; body text and controls remain regular. Portable Native Tool typography stays regular; client-profile Tools and portals inherit the measured client typography.

## Localization and drafts

English is the primitive default. Supply display labels through props or `UIStringsProvider` (`labels`, `locale`, `translate`). `configureUIRuntime` provides an optional Host callback for non-React translation and locale reads. It stores no preference and requires no application translation catalog. Translate interface copy only, not user-authored content.

Protect unsaved changes before navigation or Dialog close. Failed saves preserve input. Theme, locale or sidebar changes must not remount business content, refetch business data or advance a Tool lease.

## Usage and diagnostics

Stable `actionId`, `data-desktop-feature` and `data-desktop-surface` markers support Host-owned usage tracking. Components do not emit telemetry. Hosts correlate invocation and asynchronous outcomes, without counting replies as second user actions.

Log bounded diagnostic metadata, stages and correlation IDs only. Exclude inputs, credentials, prompts, user content and personal identities. The library neither uploads nor writes diagnostic or usage events.

## Verification scope

VirtualList and FixedVirtualList provide a 4px gap and side inset by default. Fixed rowHeight is the content height; the library includes the gap in total height, visible ranges and restored anchors. Do not add business item margins or duplicate wrapper padding. Use ListStack for short flow lists inside InternalScrollArea. Tabs and menu/select options retain visible space between fills and their container edges; do not force tab targets to the full page-bar height.

FixedVirtualList accepts an apiRef with scrollToIndex(index). Keyboard navigation must use that method instead of multiplying an index by rowHeight in the Host; the managed stride also includes spacing. Existing stable item keys and anchor restoration remain authoritative across prepend/reorder operations.

The gallery checks React interaction and computed geometry. Client probes verify real consumer imports, retained state and Electron adapters with isolated data. Browser `deviceScaleFactor` cases simulate scaling; native Windows controls and production service authentication require separate Host validation.

## Text input confirmation

Use `InputGroup` for a single text input with a leading icon or trailing action. The group owns the fill, rounded boundary and neutral inset focus; its input stays transparent and has no separate frame. It preserves input refs, native label click focus and keyboard access to trailing actions. Invalid text focus uses the danger boundary on the group. Do not recreate this state with business `:focus-within` rules or suppress all focus styles on arbitrary input parents. Existing `desktop-toolbar-search` compositions share the same focus ownership.

Mount `InputBehaviorRoot` once in a Tailwind Host. `DesktopRoot` includes it for standalone clients. Enter confirms the scoped action; Shift+Enter inserts a line break in multiline fields. IME composition (including key code 229), held-key repeats and modified Enter never invoke a command.

Mark the existing confirmation button with `confirmOnEnter` and bound its form composition with `data-desktop-input-scope`. Composer and dialog scopes are recognized automatically; nested scopes prevent a search or attachment field from submitting an outer editor. The boundary clicks that exact visible button, preserves disabled state, and emits no additional telemetry. Native forms use their submit action; live filters and automatically applied fields confirm on blur. Ambiguous scopes never choose a button by its label or position. Read-only fields remain read-only.


## Record interaction ownership

The supplied ChatGPT Downloads, browser-permissions and Tasks settings captures show static content groups with separate commands, links, selects and switches. Sidebar objects and menu choices may have one primary navigation or selection target with auxiliary controls outside that target. This is an interaction contract, not a rule that only trees may hover. A single-action selection or navigation option may own a whole target; a multi-action business record must remain a static group.

Use `RecordRow` for multi-action records, `RecordLink` for navigation and `RecordAction` or `Button` for commands. Host layout owns column geometry and domain selection state; shared controls own hover and keyboard focus. Never put a row click handler, button role or tab stop around descendant actions. Clicking metadata or space between controls must do nothing. Drag affordance and selected state do not grant click ownership. Keep independent actions discoverable, with visible labels or familiar labelled icons; keyboard focus must not rely on pointer hover. Do not make the entire row brighten when one descendant is hovered or focused.

Use native links for URLs and buttons for commands. Preserve disabled, loading and disclosure states and stable action IDs on the actual target, not its static parent. Validate blank-space clicks, independent outcomes, keyboard focus, long labels and both themes at the supported window sizes.


## Composer scroll boundaries

Wrap only the message/body viewport in `ScrollEdgeFade`; place a `ComposerDock` immediately after it. The boundary adds no DOM wrapper and the shared `InternalScrollArea`, `VirtualList` and `FixedVirtualList` preserve their scroll element, refs and anchor protocols. Ordinary scroll areas remain unchanged. Nested scroll areas do not inherit the outer mask.

The bottom 24px use an alpha mask: fully opaque at the start and fully transparent at the dock edge in both themes. Native scrollbar gutters stay opaque. The mask remains enabled at the end; shared bottom padding keeps the last content above it. Focused descendant controls are scrolled into the readable region. Floating actions and portal menus belong outside the masked viewport.

`ComposerDock` owns the zero top gap, 12px bottom spacing and compact/responsive horizontal insets. Do not add Host gradient, mask, background overlays or competing top padding. Disabled boundaries (`enabled={false}`) leave the underlying scroll area unchanged. This pattern applies to scrolling conversations adjoining fixed input areas, not ordinary lists, tables, menus or inline forms.

Composer integrations use ComposerActionButton with explicit ready/sending/stoppable/stopping state. Keep stable Host action IDs, localize all four labels and supply cancellation only when supported. Use sendDisabled for draft readiness so an empty next message cannot block Stop. Remove Host send/stop colors, glyphs, fixed sizes and duplicate desktop-send-control implementations. ClientComposer delegates to the same component; its existing busy/onStop props remain compatible, and actionState supports transport/cancellation acknowledgements. Upgrade all coordinated clients to the same complete revision and run the composer contract plus real Host rendering tests.

## AI output integration

Use `AIResponseProvider` at a retained conversation boundary and `AIResponse` with stable response IDs. Loaded history must pass `animate={false}`. For newly received output pass `animate`, plus `state="streaming"` until generation ends; whole-result APIs pass the final content with `state="complete"`. Cancellation/failure flush the received prefix. Retained Tools inherit `ToolVisibilityContext`; presentation does not own requests, persistence or telemetry.

Replace only AI busy spinners with `AIActivity` (including button labels), keeping stop/retry actions and real progress. Use `Markdown variant="ai"` for AI prose; keep domain-specific Remarkup and non-AI documents on their existing rendering path. Custom link adapters remain available through `components`. Do not override shared AI typography with local prose/code CSS. Code copy labels use the Host translation bridge.

Host-owned virtualizers use `ScrollEdgeFade virtualized` and the exported `scrollEdgeFadeSize` for both `paddingEnd` and `scrollPaddingEnd`. Shared VirtualList does this automatically. Virtual padding replaces viewport padding, so total height, end alignment and anchor offsets include exactly one fade allowance.

## Computed control typography

Input and Textarea own the semantic Body size, regular weight and UI line height; a smaller field label or larger surrounding heading must not resize editable content. Hosts customize semantic tokens, not control classes. Native Tool roots inherit the font family without resetting shared compact button or input typography. Compound Dialog and AlertDialog titles use the dialog-title and heading-line-height tokens; descriptions use Supporting. Visual acceptance must compare computed font sizes and line heights against these tokens through the actual Tailwind and portal pipeline, including nested labels, compact controls and scoped Host token overrides. Imports and source adoption alone do not prove a design-system match.

Module Tabs use one quiet ChatGPT-style selected surface with a fully rounded target, regular text and preserved gaps. Do not combine a filled selected target with a bottom indicator or tab-shaped corners. Hover and keyboard focus remain independently visible. Compatibility APIs reuse the same canonical rendering; the library does not offer a separate legacy or generic visual system. Audit the maintained components against reference relationships rather than accepting them because they are already exported.

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


## Host-owned mobile Back and cancellable drawer dragging

Wrap a retained application in `DismissalLayerProvider` and pass a stable
`registerLayer(dismiss)` callback that returns a cleanup function. The Host owns
browser/native history and must consume exactly one registered layer per Back.
The library never calls History APIs or native IPC. Canonical `Dialog`, `Select`,
`EditableCombobox`, `MenuButton`, `Popover` (including `DatePicker`) and a modal
`ChatWorkspace` drawer register their visible open state. Do not add a second
Host registration around these controls. Initial nested Dialogs register their
parent before their child, even though React mounts child effects first.
Dismissing a chooser closes it without applying a selection or submitting data.

Use `ChatWorkspace sidebarPresentation="catalog"` at a mobile module root: the
catalog fills the phone, does not trap focus as a modal and does not register an
extra dismissible layer. The Host still owns route selection and the decision
to show this root. Use the default `"drawer"` for a conversation's overlaid list.

Drawer dragging starts only on the dedicated inner right edge below the header,
never across the entire page or OS back edge. Movement locks horizontally after
intent is clear; vertical movement stays scrolling. The panel and backdrop follow
the pointer. A cancelled/lost pointer restores the open state; dismissal commits
only on a sufficient release distance or velocity. Text controls, selection,
links and horizontal content retain their normal touch behavior. The close
button and backdrop remain alternatives, and reduced motion removes settling
animation rather than changing action semantics. Browser synthetic touch is not
evidence of a physical Android/iOS system gesture or predictive Back.

`Dialog presentation="sheet"` uses the normal desktop dialog and a bottom-docked
phone sheet. It follows `visualViewport`, reserves the safe area and owns its
close target geometry. Only its grip can drag-dismiss; body scrolling cannot.
Cancellation retains the controlled open value, children and Host draft. Keep
the close button as the keyboard/assistive alternative. `presentation="fullscreen"`
fills the visual viewport without changing the shared focus/dismissal contract.

`ImageViewer` composes that fullscreen Dialog. Pass `open`, `onClose`, `src`, `alt`
and optionally `title`; keep URL authorization, file selection, download and
persistence in the Host. It supplies 1–4x pinch/toolbar zoom, bounded panning,
double-click and +/-/0 keyboard controls. Downward dismissal is available only at
original scale, and cancelling a pointer restores the gesture's initial view.
Zoomed panning or lifting one finger after a pinch cannot commit a dismissal.
Only the image canvas uses `touch-action:none`; the rest of the application keeps
browser zoom, scrolling and system gesture ownership. Test failed images too.

Native shells that dispatch a cancelable synthetic Escape on `document` must
observe its final `defaultPrevented` result before traversing history. Do not
dispatch Escape and call history.back unconditionally. Native IME ordering and
predictive progress/cancel transport require host implementation and real-device
evidence; the library does not infer them from a mobile user agent.
