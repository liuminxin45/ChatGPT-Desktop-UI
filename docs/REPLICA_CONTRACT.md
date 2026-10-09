# Client recreation contract

The target is the Windows ChatGPT client identified by installed package metadata in `CLIENT_ALIGNMENT.json`. The Demo, reusable components, design system and agent Skill belong to this repository. A consumer imports one pinned public Git revision and owns only its product-specific composition and Host services.

## Reference priority

1. The inspected Windows package is authoritative for window chrome, navigation, menus, settings and native work surfaces.
2. User-supplied captures establish the visible layout and states they contain.
3. [ChatGPT web](https://chatgpt.com/) can supplement shared chat controls. Web observations have their own date, authentication state and geometry; they do not establish the layout of an unobserved desktop screen.

Inspect through read-only UI navigation. Never publish account captures, private conversations or credentials. Recreate the content with credible English fixtures. Do not change real permissions, settings, pins, accounts or files to obtain a reference state. No backend implementation is required to reproduce visible UI, but unavailable native actions must not appear to perform a real operation.

## Surface inventory

| Surface | Reference | Current coverage | Remaining fidelity work |
| --- | --- | --- | --- |
| Window bar, icon rail, context sidebar | Windows client and supplied captures | Measured geometry, folding, history, selection, hover, tooltips | Native Windows glyph rasterization |
| File / Edit / View / Help | Windows read-only inspection | Nested action trees and keyboard focus | Native-only actions remain unavailable |
| Codex project landing, chat, composer | Windows client and supplied captures | Shared composer, project context, drafts, local messages | Full tool output vocabulary and native panes |
| ChatGPT chat landing and input | Signed-out web, 2026-10-09 | Separate chat layout and shared composer; disabled empty Send | Authenticated desktop chat mode still needs direct inspection |
| Message actions | Shared chat composition | Copy, controlled ratings, retry menu, disabled service actions | Desktop action ordering still needs direct inspection |
| Explore and Pin | Windows client and supplied captures | Destination pin/unpin, project and chat pin menus | Cross-session Host persistence |
| Search, activity, project creation | Windows client and supplied captures | Filter, selection, retained drafts, validation, focus | Native folder chooser |
| Settings | Windows read-only inspection | 26 categories; grouped fields, emphasis, selection and toggles | Service-backed detail dialogs and account states |
| Usage, Profile, Projects, Scheduled | Windows read-only inspection | Synthetic records, period controls, daily inspection, directory filter | Exact proprietary illustrations, promotional video and pet sprites |
| Space, Images, Sites, Maps, GPTs | Navigation observed | Navigation preview | Inspect and recreate each destination before declaring completion |

Opening every destination is a coverage check, not proof of visual equivalence. A preview placeholder is an open fidelity item. Keep this table honest when shipping: the complete client is not yet accepted as a 1:1 recreation.

## Acceptance for each surface

Compare reference and Demo at the same viewport and scaling. Measure bounds, spacing, baseline, line-height, descender clearance, radius, color and weight. Inspect idle, hovered, focused, selected, checked, disabled, busy, empty and error states. Validate menus at edges, long labels, nested keyboard navigation, dialog focus and draft retention. Match animations and honor reduced motion. Include both themes at 1920 × 1080, 1280 × 800 and 125% browser emulation; distinguish emulation from Windows scaling.

Move repeated controls and patterns into `src/`. Demo files contain fixtures and composition; they must not become a second independently maintained component library. Keep the portable Host profile separate from the measured client profile. An embedded tool inherits its Host instead of mounting a second window or typography root.

Record measured evidence, implemented states, missing states and the reference version before tagging an alignment release. Tags are immutable and include both the observed Windows version and kit version. Never move an earlier tag to a new commit. A successful build, page count or screenshot capture alone cannot close an unobserved fidelity item.

## Consumer acceptance

Install a full commit from the public GitHub repository with lifecycle scripts enabled. Validate the manifest, lockfile, actual installed revision, built JavaScript/declarations/CSS and forwarding adapters. Build consumers against the same revision. Local Git/file sources, checked-in vendor copies, separately implemented controls, stale adapter peer versions and skipped Git prepare steps fail release acceptance.

The integration checker reads only package metadata and explicitly declared source adapters; it reads no production data and emits no user-content telemetry. Keep build evidence in each private consumer, without publishing its paths or business context in this public repository.
