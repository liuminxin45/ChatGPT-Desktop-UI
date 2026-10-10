# Integration

## Dependency ownership

Use `chatgpt-desktop-kit` as the sole control, icon, token and base-style implementation. Pin an immutable commit or package version in the consumer lockfile. Update consumers together and validate them against that exact revision. Do not copy source into each client or synchronize implementations bidirectionally.

Application-local component and icon paths may remain as compatibility exports. Only platform adapters, service errors, localization catalogs and business-specific compositions remain in the client. Standalone clients import this package directly. The library has no application IPC, credential service, business data root or Worker lifecycle.

Release manifests use `git+https://github.com/liuminxin45/ChatGPT-Desktop-UI.git#<full-40-character-commit>`. Install with normal `npm ci` or `npm install`; Git `prepare` builds the JavaScript, CSS and declarations. Do not use `--ignore-scripts` in consumers. A `git+file:` source, local symlink or vendor directory is not a portable release dependency. Each private adapter's peer version must match the installed kit release.

Run `node node_modules/chatgpt-desktop-kit/dist/check-consumer.mjs` after installation. Optionally set `DESKTOP_UI_REVISION` and `DESKTOP_UI_VERSION` to coordinate multiple clients. The exported `checkConsumer(root, options)` from `chatgpt-desktop-kit/integration-check` returns a bounded result instead of exiting. Declare pure `forwarders`, `styleForwarders`, `adapterManifests` and `retiredPaths` in a consumer-owned `ui.integration.json`; paths stay inside that consumer. This checker compares the manifest, both lockfiles, installed version, distribution and declared adapters without scanning business data.

npm may canonicalize a GitHub HTTPS dependency to a `git+ssh://git@github.com/` lockfile URL. The checker accepts that normalization only for this exact public repository and the manifest's complete revision. A different owner, repository, local path or revision still fails. The manifest remains an HTTPS source; consumers need no path to the library checkout.

Before upgrading production consumers, install the public pinned commit in a fresh isolated fixture and build a small React composition. Then run the real consumers' typechecks, builds and relevant interaction probes. Do not silently switch the release pin back to a local checkout after a network failure.

Version 0.3 changes the package identity to `chatgpt-desktop-kit` and uses `--desktop-*` tokens, `desktop-*` classes, `data-desktop-*` markers, `DesktopIconProps` and the `desktop:restore-list-anchor` event. Update imports, Tailwind content scans, CSS references and Host marker readers together. Existing stable feature, surface and action ID values remain unchanged; this migration does not reset usage series or stored preferences. No legacy application namespace aliases are shipped.

## Styles and surfaces

Standalone React documents import `styles.css` once and mount `DesktopRoot` (also exported as `DesktopSurface`). An optional application-specific storage key controls theme persistence; native storage stays in the Host's managed profile. The root tracks system preference and restores document state on unmount.

Tailwind hosts import `controls.css`, `host.css` and `host-shell.css` once, then run their normal Tailwind pipeline. Include this package's `src/**/*.{ts,tsx}` in Tailwind's content scan when using `compat/*`. These exports preserve utility-based adapters without maintaining another component implementation.

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

`SettingsCategory.group` is optional and participates in category search. Settings headings and field labels use the semantic emphasis weight; body text and controls remain regular. Native Tool Host typography overrides remain authoritative.

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

Composer integrations use ComposerActionButton with explicit ready/sending/stoppable/stopping state. Keep stable Host action IDs, localize all four labels and supply cancellation only when supported. Use sendDisabled for draft readiness so an empty next message cannot block Stop. Remove Host send/stop colors, glyphs, fixed sizes and duplicate desktop-send-control implementations. ClientComposer delegates to the same component; its existing busy/onStop props remain compatible, and actionState supports transport/cancellation acknowledgements. Upgrade all coordinated clients to the same complete revision and run the composer contract plus real Host rendering tests.
