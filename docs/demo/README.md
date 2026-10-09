# Windows client demo

The browser demo follows the observed **ChatGPT 26.1002.7124.0** Windows client. Installed package metadata and read-only native inspection establish the reference version. [CLIENT_ALIGNMENT.json](../CLIENT_ALIGNMENT.json) records the measurements and release tag.

The actual React exports provide the titlebar, retained sidebar, nested menus, grouped settings, controls, icons and themes. English projects, chats, accounts and usage records are synthetic. Nothing from the reference account is distributed.

| Surface | Light | Dark |
| --- | --- | --- |
| Project landing, 1920 × 1080 | [Light](home-light-1920.png) | [Dark](home-dark-1920.png) |
| Chat, 1280 × 800 | [Light](chat-light-1280.png) | [Dark](chat-dark-1280.png) |
| General settings, 1920 × 1080 | [Light](settings-light-1920.png) | [Dark](settings-dark-1920.png) |
| Appearance, 1280 × 800 | [Light](appearance-light-1280.png) | [Dark](appearance-dark-1280.png) |
| Notifications, 1280 × 800 | [Light](notifications-light-1280.png) | [Dark](notifications-dark-1280.png) |
| Usage analytics, 1280 × 800 | [Light](analytics-light-1280.png) | [Dark](analytics-dark-1280.png) |

`npm run demo:build && npm run test:demo` checks nine primary states in both themes at 1920 × 1080, 1280 × 800 and 1536 × 864 with `deviceScaleFactor: 1.25` (54 render cases). The scaling case emulates browser rendering; it does not change Windows display scaling. [VALIDATION.json](VALIDATION.json) records the executed checks.

ChatGPT and Codex are separate input layouts, composed from the exported `ClientComposer` and `ConversationMessage`. [Chat landing](chatgpt-home-light-1280.png) and [chat thread](chatgpt-thread-dark-1280.png) supplement the desktop reference with the signed-out [web interface](https://chatgpt.com/) inspected on 2026-10-09. The authenticated desktop chat layout still needs a direct comparison; see [the surface acceptance matrix](../REPLICA_CONTRACT.md).

Interaction coverage includes history, retained drafts, sidebar folding, File/Edit/View/Help menus, Explore pins, chat pin/rename, project create/edit and discard validation, search, activity view, new tabs, theme switching, all settings destinations, usage grouping and periods, daily inspection, profile activity and reduced motion. Separate captures include [profile Help](profile-help-menu.png), [project actions](project-menu.png), [chat actions](chat-actions.png), [search](search.png) and [the new tab](new-tab.png).

Native files, account services, terminals, microphone, AI generation and scheduled execution are unavailable. Preview edits live in memory and reset on reload; only the theme preference is stored. No telemetry or user-content diagnostic files are written. Unsupported native commands are disabled or explicitly describe their preview limit when opened.

The shared client profile measures 44px titlebar, 52px rail, 372px contextual sidebar and 728px settings content at desktop widths. Smaller viewports adapt while retaining state. Proprietary pet sprites, promotional video, profile illustrations and exact native icon paths are not copied; local vector/emoji placeholders identify those assets. Space, Images, Sites, Maps, GPTs and service-backed deep flows are navigation previews, not complete product replicas. The tag identifies the inspected version and does not claim pixel identity for every screen or track future releases automatically.
