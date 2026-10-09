# Synthetic visual examples

All distributed screenshots are rendered from this repository's fictional gallery content. Official application screenshots, account information and conversations are not distributed.

| Pattern | Dark | Light |
| --- | --- | --- |
| Full-width workspace | [dark](gallery/workspace-dark-1280.png) | [light](gallery/workspace-light-1280.png) |
| Contextual chat | [dark](gallery/chat-dark-1280.png) | [light](gallery/chat-light-1280.png) |
| Settings | [dark](gallery/settings-dark-1280.png) | [light](gallery/settings-light-1280.png) |
| Controls and states | [dark](gallery/components-dark-1280.png) | [light](gallery/components-light-1280.png) |

Interaction examples: [avatar menu](gallery/avatar-menu.png), [dropdown](gallery/dropdown.png), [navigation tooltip](gallery/rail-tooltip.png), [failed-save dialog](gallery/dialog-failure.png).

The versioned client recreation uses the same library with `DesktopClientSurface`: [dark project landing](demo/home-dark-1920.png), [light project landing](demo/home-light-1920.png), [General settings](demo/settings-dark-1920.png), [Appearance](demo/appearance-dark-1920.png), [profile and Help](demo/profile-help-menu.png), [project creation](demo/create-project.png) and [search](demo/search.png). These captures contain synthetic English data. [CLIENT_ALIGNMENT.json](CLIENT_ALIGNMENT.json) identifies the inspected Windows client version and separates observed geometry from native-service and glyph limitations.

Inspect compact selected tiles, outline/fill icons, a blue unread dot, label-and-chevron dropdowns and name-only tooltips. Hover, focus and selected states remain distinct in both themes. These are implementation examples, not screenshots of an official client.

[VALIDATION.json](VALIDATION.json) records viewports, theme checks, geometry and interactions. Client business services are outside the synthetic gallery's scope.
