# Browser demo

Northstar is a fictional product team workspace composed from the library's actual React exports, icons and semantic styles. `examples/demo/` owns sample content and layout; `src/` remains the sole component implementation.

| Screen | Light | Dark |
| --- | --- | --- |
| Projects, 1920 × 1080 | [Light](projects-light-1920.png) | [Dark](projects-dark-1920.png) |
| Projects, 1280 × 800 | [Light](projects-light-1280.png) | [Dark](projects-dark-1280.png) |
| Team inbox, 1280 × 800 | [Light](inbox-light-1280.png) | [Dark](inbox-dark-1280.png) |
| Activity, 1280 × 800 | [Light](activity-light-1280.png) | [Dark](activity-dark-1280.png) |
| Settings, 1280 × 800 | [Light](settings-light-1280.png) | [Dark](settings-dark-1280.png) |

`npm run demo:build && npm run test:demo` captures all four routes in both themes at 1920 × 1080, 1280 × 800 and a 1536 × 864 viewport with `deviceScaleFactor: 1.25` (24 render cases). The last configuration emulates 125% browser rendering; it does not change Windows display scaling. Additional captures are kept in ignored `tests/output/demo/`.

The interaction suite verifies search, empty-state recovery, filtering, sorting, task completion, required and duplicate project names, draft protection on dialog close, project creation/details, per-conversation drafts, sending with Enter, theme/sidebar/route state retention, settings changes and reload behavior. [VALIDATION.json](VALIDATION.json) records the executed results.

It also verifies Back/Forward history, File/Edit/View/Help menus, task Undo/Redo, pin toggles in the [More menu](navigation-menu.png), the [Appearance submenu](appearance-menu.png), chart metric/period selection, keyboard inspection, vertical text alignment, descender clearance, bounded dropdown glyphs, settings emphasis and reduced-motion behavior. The smooth chart uses weekly fictional team totals; it requires no charting framework or network requests.

There are no fake native window controls or backend requests. Messages and project edits remain in memory; reloading restores the fixture. The only browser storage entry is `desktop-kit.demo.theme`. Stable action and surface markers are present for host integration; this demo emits no telemetry and writes no diagnostic files or user content.

The read-only clock and due dates belong to a fixed October 2026 scenario, rather than pretending to track today's date. Initials are local avatars; no portrait service or remote images are needed.
