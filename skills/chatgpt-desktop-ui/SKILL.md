---
name: chatgpt-desktop-ui
description: Build or refactor a desktop-style app to match the supplied ChatGPT/Codex visual language using reusable controls, neutral themes, compact navigation and measured screenshot validation. Use for explicit ChatGPT-style UI requests; not general landing-page design.
---

# ChatGPT-style desktop UI

Create a faithful adaptation of the supplied client design language while preserving the target product's workflows. This Skill carries a portable React UI package and clean visual examples; it does not require a local PHD repository or a specific absolute directory.

Read [design-system.md](references/design-system.md) and the relevant images in [visual-references.md](references/visual-references.md). For a redesign, also read [design-guidance.md](references/design-guidance.md). Read [integration.md](references/integration.md) before adapting host behavior, persistence or embedded surfaces.

## Implement

Inventory the target routes, dialogs, menus, states and repeated controls. Choose workspace/list, settings, reading/chat or utility layouts based on the user's actual work. Preserve language, data, selections, drafts and existing authorization. Remove redundant module titles and decorative nested frames; do not invent unrelated features or imitate ChatGPT's product identity.

For React, first reuse an existing compatible `@phd/chatgpt-desktop-kit` dependency. Otherwise install a pinned library revision or use the packaged `assets/ui/` as one application-level dependency. Do not create separately maintained copies in every client. Import its `styles.css` once and reuse `Button`, `Input`, `Select`, `Tabs`, `Dialog`, `InternalScrollArea` and the layout exports. The package includes source and declarations; `assets/starter/` shows real composition. Use the target's React/runtime constraints and validate compatibility rather than silently upgrading its stack. PHD-specific Node pinning is not an instruction to change another project's toolchain.

For another framework, use the reference tokens and measurements to adapt the project's shared component layer once. Keep equivalent keyboard, focus, portal and scrolling behavior. Do not sprinkle approximations across individual pages or rewrite a working product into React without authorization.

For a new React example, copy `assets/ui` and `assets/starter` to adjacent directories, run `npm install --install-links --ignore-scripts` inside `starter`, then `npm run typecheck`, `npm run build` and `npm start`. The explicit local-package installation keeps declarations and dependencies inside the consumer. The starter has synthetic content and a deliberate save-failure state; replace those with the target's existing application actions.

The key visual relationships are a neutral window shell, quiet contextual sidebar, darker main canvas in dark mode, borderless idle controls, filled hover states and compact rounded floats. Use the 40px window bar, 48px global rail, 32px selected tile, 20px outline/fill icons and 8px blue unread dots when the target actually has that shell. Keep workspaces full width; settings body maximum 720px. Typography defaults to system fonts and regular weight, with a restrained 11–20px UI scale. Do not force an icon rail or custom title bar into every standalone utility.

Use semantic tokens, not per-page gray literals. Respect explicit user cursor/font preferences; the packaged arrow-cursor policy is an originating desktop preference. Distinguish errors from unread states. Keep visible keyboard focus and labels. Name-only navigation tooltips must have no shortcut line or arrow.

The host owns native window actions, history, credentials, language, application state and analytics. Disable unavailable actions. A theme/language change or sidebar fold cannot remount content, discard drafts, fetch business data again or change a Tool lease. Protect unsaved changes and preserve drafts on failure.

## Verify

Run the target's relevant typecheck/build and meaningful interaction checks. Inspect actual light and dark screens at 1920×1080 and 1280×800; include 125% scaling/emulation if available and say which was used. Compare reference and target at the same viewport. Check container width, toolbar height, rail geometry, text baseline, hover/selected/focus states, menus near edges, long lists, empty/loading/error states, failed avatar images and save failures.

Review all affected routes rather than demonstrating only a new settings page. Repair differences in the shared layer where possible. Do not claim high fidelity based only on a palette or a screenshot that was never viewed.

Deliver the implementation, reference-linked screenshots, verified checks and remaining host-specific limitations. This Skill does not authorize publishing, installing a product, sending messages, migrating production data or pushing commits. Follow the user's actual authorization for those actions.
