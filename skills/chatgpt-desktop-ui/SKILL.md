---
name: chatgpt-desktop-ui
description: Build or refactor a desktop-style app to match the supplied ChatGPT/Codex visual language using reusable controls, neutral themes, compact navigation and measured screenshot validation. Use for explicit ChatGPT-style UI requests; not general landing-page design.
---

# ChatGPT-style desktop UI

The versioned reference is Windows ChatGPT **26.1002.7124.0**, observed on 2026-10-09. For an explicit client replica, reuse `DesktopClientSurface`, `ClientSidebar`, `SidebarSection`, `DesktopMenu` and grouped `SettingsGroup`/`SettingsField`; match the observed layouts instead of designing a new dashboard. This profile uses 44px title bar, 52px rail, 36px selected tile, 372px contextual sidebar, 728px settings body, 28px bold settings heading and 14px body. Portable defaults below apply to adaptations that do not opt into the profile. Embedded Tool typography and Host ownership remain authoritative.

Inspect missing reference surfaces only within the user's authorization. Confirm the installed package version and retain measurements without publishing private captures or chat titles. Record alignment in `CLIENT_ALIGNMENT.json` and tag a published replica with the observed client version. Do not claim exact fidelity for unobserved screens, proprietary glyphs or disconnected native services.

For explicit 1:1 requests, read [the recreation contract](references/REPLICA_CONTRACT.md) and [the component map](references/COMPONENTS.md). Use the desktop package as the primary reference and ChatGPT web only as a dated supplement for shared UI. Inventory every destination and state; a navigation placeholder remains an open fidelity item. Reuse `ClientComposer` for separate chat/work input layouts and `ConversationMessage` for message geometry. Record unobserved screens explicitly, and never describe the complete client as 1:1 accepted while that inventory has gaps.

Create a faithful adaptation of the supplied client design language while preserving the target product's workflows. This Skill carries a portable React UI package and clean visual examples; it does not require an originating application repository or a specific absolute directory.

Read [design-system.md](references/design-system.md) and the relevant images in [visual-references.md](references/visual-references.md). For a redesign, also read [design-guidance.md](references/design-guidance.md). Read [integration.md](references/integration.md) before adapting host behavior, persistence or embedded surfaces.

## Implement

For workflow cleanups, audit action meaning and reading order across all requested clients, dialogs, menus and nested states. Prefer shared semantic icons for familiar auxiliary actions; retain short text for save, complete, apply, record, menus and confirmations. Combine glyph and caption only for added meaning or live state. Attachments use a paperclip, deletion a trash can, saving a disk and completion a check; never reuse Plus for attachment or Check for save. Keep one title, one primary action and one main scroll owner. Long editable content uses shared `Textarea autoSize`. Record source review and rendered evidence separately; never declare a whole-product cleanup complete with unobserved surfaces.

Choose a component from the generated API references: [actions](references/api/actions.md), [forms](references/api/forms.md), [navigation](references/api/navigation.md), [layout](references/api/layout.md), [overlays](references/api/overlays.md), [lists](references/api/lists.md), [feedback](references/api/feedback.md), [shell](references/api/shell.md), [client profile](references/api/client.md), [conversation](references/api/conversation.md), [runtime](references/api/runtime.md) or [compound adapters](references/api/compat.md). Read only the families needed for the task. These files and [the API catalog](references/catalog.json) are generated from TypeScript; change implementation props/JSDoc and regenerate, rather than maintaining parallel tables.

Portable/profile implementations belong in `src/components/`; old root entry files are forwarding facades. Compound APIs live in `src/compat/` and share canonical native action/input/scroll rendering. Preserve existing API contracts and Host typography. Before proposing a new control, verify actual reuse or a requested stateful composition; do not build speculative unused components. Use the source adoption audit and integration checks to identify copied Host renderers and mismatched public pins.

Inventory the target routes, dialogs, menus, states and repeated controls. Choose workspace/list, settings, reading/chat or utility layouts based on the user's actual work. Preserve language, data, selections, drafts and existing authorization. Remove redundant module titles and decorative nested frames. An explicitly requested client Demo follows the observed client structure; other products retain their own identity and workflows.

For React, first reuse an existing compatible `chatgpt-desktop-kit` dependency. Otherwise install a pinned library revision or use the packaged `assets/ui/` as one application-level dependency. Do not create separately maintained copies in every client. Import its `styles.css` once and reuse `Button`, `Input`, `Select`, `Tabs`, `Dialog`, `InternalScrollArea` and the layout exports. The package includes source and declarations; `assets/starter/` shows real composition. Use the target's React/runtime constraints and validate compatibility rather than silently upgrading its stack. This repository's Node pinning is not an instruction to change another project's toolchain.

Release clients pin `git+https://github.com/liuminxin45/ChatGPT-Desktop-UI.git#<full-40-character-commit>` and install with lifecycle scripts enabled. Run the packaged integration checker after install; validate the manifest, lockfile, actual installed revision, prepared distribution and pure forwarding adapters. All coordinated clients use the same revision. A local Git/file dependency, copied vendor source, old adapter peer version or skipped prepare step fails release acceptance. Packaged `assets/ui/` remains an isolated starter path, not a substitute for a coordinated public release dependency.

For another framework, use the reference tokens and measurements to adapt the project's shared component layer once. Keep equivalent keyboard, focus, portal and scrolling behavior. Do not sprinkle approximations across individual pages or rewrite a working product into React without authorization.

For a new React example, copy `assets/ui` and `assets/starter` to adjacent directories, run `npm install --install-links --ignore-scripts` inside `starter`, then `npm run typecheck`, `npm run build` and `npm start`. The explicit local-package installation keeps declarations and dependencies inside the consumer. The starter has synthetic content and a deliberate save-failure state; replace those with the target's existing application actions.

The key visual relationships are a neutral window shell, quiet contextual sidebar, darker main canvas in dark mode, borderless idle controls, filled hover states and compact rounded floats. Use the 40px window bar, 48px global rail, 32px selected tile, 20px outline/fill icons and 8px blue unread dots when the target actually has that shell. Keep workspaces full width; settings body maximum 720px. Typography defaults to system fonts and regular weight, with a restrained 11–20px UI scale. Do not force an icon rail or custom title bar into every standalone utility.

Use semantic tokens, not per-page gray literals. Respect explicit user cursor/font preferences; the packaged arrow-cursor policy is an originating desktop preference. Distinguish errors from unread states. Keep visible keyboard focus and labels. Name-only navigation tooltips must have no shortcut line or arrow.

For labelled actions, pass the leading glyph through `Button.icon` instead of placing an SVG directly beside the text. Sibling navigation actions share an icon column, label start and baseline even when visible glyph sizes differ. Use the canonical sidebar action profile described in [design-system.md](references/design-system.md); fix shared geometry rather than adding page-local margins or offsets.

The host owns native window actions, history, credentials, language, application state and analytics. Disable unavailable actions. A theme/language change or sidebar fold cannot remount content, discard drafts, fetch business data again or change a Tool lease. Protect unsaved changes and preserve drafts on failure.

## Verify

Run the target's relevant typecheck/build and meaningful interaction checks. Inspect actual light and dark screens at 1920×1080 and 1280×800; include 125% scaling/emulation if available and say which was used. Compare reference and target at the same viewport. Check container width, toolbar height, rail geometry, text baseline, hover/selected/focus states, menus near edges, long lists, empty/loading/error states, failed avatar images and save failures.

When changing icon-labelled rows, measure sibling label left edges and vertical baselines, and verify that glyph slots stay centered at every supported scale. Inspect the actual renders; a palette check or matching declared SVG sizes does not establish alignment.

Review all affected routes rather than demonstrating only a new settings page. Repair differences in the shared layer where possible. Do not claim high fidelity based only on a palette or a screenshot that was never viewed.

Deliver the implementation, reference-linked screenshots, verified checks and remaining host-specific limitations. This Skill does not authorize publishing, installing a product, sending messages, migrating production data or pushing commits. Follow the user's actual authorization for those actions.

## Workspace composition and long values

Use one horizontal module navigation layer. Promote independent work destinations into that row instead of stacking Tabs. Ordinary sections use spacing, not nested outlined panels. Table cells use the exported Table family in both standalone and embedded surfaces; multi-action records remain static. Long lists compose VirtualList and RecordRow, with Host-owned column geometry. Select values and menu options remain readable, wrapping within constrained columns rather than silently showing ellipses. Use Select size="sm" for compact rows and InlineNotice for compact conditions with independent recovery actions. Each workspace has one vertical scroll owner; the page bar and list header remain outside the growing list viewport.
