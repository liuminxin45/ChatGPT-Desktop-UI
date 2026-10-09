# Integration

## Dependency ownership

Use `@phd/chatgpt-desktop-kit` as the sole control, icon, token and base-style implementation. Pin an immutable commit or package version in the consumer lockfile. Update consumers together and validate them against that exact revision. Do not copy source into each client or synchronize implementations bidirectionally.

PHD's `@phd/ui`, `@phd/icons` and local control paths are compatibility exports. Only platform adapters, service errors, localization catalogs and business-specific compositions remain in the client. Collector and Processor import this package directly. The library has no application IPC, credential service, business data root or Worker lifecycle.

## Styles and surfaces

Standalone React documents import `styles.css` once and mount `DesktopRoot` (also exported as `DesktopSurface`). An optional application-specific storage key controls theme persistence; native storage stays in the Host's managed profile. The root tracks system preference and restores document state on unmount.

Tailwind hosts import `controls.css`, `host.css` and `host-shell.css` once, then run their normal Tailwind pipeline. Include this package's `src/**/*.{ts,tsx}` in Tailwind's content scan when using `compat/*`. These exports preserve utility-based adapters without maintaining another component implementation.

Embedded Tools inherit Host styles and typography. They must not mount another theme root, title bar or renderer error boundary. `ToolVisibilityContext` closes overlays when a retained surface is hidden; it does not own the surface lease.

## Icon actions

Pass the action glyph as `icon` to either Button entry and keep its translated label in `children`. The control renders a compact square glyph, exposes an accessible name, and shows the label on hover or keyboard focus. Busy and disabled actions retain their names and hints. Existing `title` values become shared tooltips; a surrounding Tooltip suppresses a duplicate nested hint. Do not move record names, people, selectable values or check-state indicators into action tooltips.

The compatibility DropdownMenuItem accepts `icon` and `actionId` with the same label rule and retains keyboard typeahead. Use stable Host-owned action identifiers. These primitives add no analytics events or diagnostic content. Shared portals close when their Tool Surface becomes hidden.

## Host behavior

`TitleBar` presents callbacks and capability flags. The Host owns history boundaries, sidebar availability, native editing, tray behavior, maximize and exit saving. Reuse one action definition for custom and native menus; disable unavailable actions.

`DesktopShell` hides contextual sidebars with CSS and preserves their React subtree. Hosts retain selections, drafts and module-specific sidebar preferences. Avatar images come from validated Host identity; absent or failed images use a neutral fallback. Saving configuration does not establish authentication.

## Localization and drafts

English is the primitive default. Supply display labels through props or `UIStringsProvider` (`labels`, `locale`, `translate`). `configureUIRuntime` provides an optional Host callback for non-React translation and locale reads. It stores no preference and requires no application translation catalog. Translate interface copy only, not user-authored content.

Protect unsaved changes before navigation or Dialog close. Failed saves preserve input. Theme, locale or sidebar changes must not remount business content, refetch business data or advance a Tool lease.

## Usage and diagnostics

Stable `actionId`, `data-phd-feature` and `data-phd-surface` markers support Host-owned usage tracking. Components do not emit telemetry. Hosts correlate invocation and asynchronous outcomes, without counting replies as second user actions.

Log bounded diagnostic metadata, stages and correlation IDs only. Exclude inputs, credentials, prompts, user content and personal identities. The library neither uploads nor writes diagnostic or usage events.

## Verification scope

The gallery checks React interaction and computed geometry. Client probes verify real consumer imports, retained state and Electron adapters with isolated data. Browser `deviceScaleFactor` cases simulate scaling; native Windows controls and production service authentication require separate Host validation.

## Text input confirmation

Mount `InputBehaviorRoot` once in a Tailwind Host. `DesktopRoot` includes it for standalone clients. Enter confirms the scoped action; Shift+Enter inserts a line break in multiline fields. IME composition (including key code 229), held-key repeats and modified Enter never invoke a command.

Mark the existing confirmation button with `confirmOnEnter` and bound its form composition with `data-phd-input-scope`. Composer and dialog scopes are recognized automatically; nested scopes prevent a search or attachment field from submitting an outer editor. The boundary clicks that exact visible button, preserves disabled state, and emits no additional telemetry. Native forms use their submit action; live filters and automatically applied fields confirm on blur. Ambiguous scopes never choose a button by its label or position. Read-only fields remain read-only.
