# Example site review — 2026-10-10

Scope: client replica, component reference and portable gallery. The supplied desktop captures remain the visual authority; redundant example-site scaffolding is not part of the native UI.

| Surface | Converged | Retained |
| --- | --- | --- |
| Components | One GitHub action in the title bar; remove the component-heading source icon, duplicate docs entry and repeated breadcrumb | Component name, API description, family composition preview, import copy feedback, property tables, design-system and contributor links |
| Gallery | Remove the persistent demonstration badge, placeholder account/person labels and duplicate Appearance notification control | Dedicated Notifications page, visible save failure and draft protection, distinct workspace/chat/settings examples |
| Client copy | Shorten repeated disconnected-service messages; remove browser-preview commentary from sample replies and duplicate destination heading | Permission descriptions, destructive-action confirmations, settings guidance, About/privacy disclosure and unavailable-action feedback |
| Chat toolbar | Compact 28px targets, four distinct actions, end-aligned chat menu, grouped menu separators and matching action glyphs | Existing rename/pin/archive behavior and stable action markers |
| Chat context | Anchored Sources popover built from the shared popover, buttons and short-list stack | Synthetic reference names, keyboard dismissal and trigger focus return |
| Browser pane | Match tab strip, history/address bar, four tool tiles with shortcuts and Suggested section; remove fabricated Recents row | Split/full pane controls, chat expansion, hidden-but-mounted drafts and address input |

The Sources button uses a ref-forwarding shared Button as the portal anchor. A non-ref-forwarding trigger leaves Radix without a measurable anchor. Opening context does not focus a nested action and accidentally open its tooltip before Escape dismissal.

The old summary-information action `client.summary.toggle` is replaced by the context-panel action `client.context.open`; any Host aggregating these example markers must treat that as a new series. Existing tool action markers, including `client.tab.tool.new-page` and `client.tab.tool.side-chat`, are retained.

The reference preview remains named for its component family because it composes multiple APIs; selecting an API does not pretend to replace the whole example. Settings descriptions observed in the native reference remain part of the recreation rather than being treated as unnecessary copy.

Verification uses light/dark browser renders at 1920×1080, 1280×800 and 125% emulation, portal geometry, keyboard dismissal, draft retention, pane expansion/restoration and the existing site accessibility/interaction gates. Emulation does not change Windows scale. Native services remain disconnected; no private screenshots or content are published.

These changes concern example-site composition and metadata. Public control APIs and client dependency revisions are unchanged by this site cleanup.
