# Validation

Use Node 24.19.0 and run:

```sh
npm run typecheck
npm run lint
npm run test:unit
npm run test:sidebar
npm run build
npm test
npm run test:input
npm run test:integration
npm run test:package-contract
npm run test:package
npm run audit:public
npm run skill:package
npm run skill:check
```

The visual suite renders workspace, chat, settings and controls in light/dark themes at 1920×1080, 1280×800 and 1536×864 CSS pixels with device scale 1.25: 24 cases. Nine interaction groups cover list virtualization, keyboard/dialog focus, theme and sidebar draft preservation, theme persistence, category search, portal collisions, failed saves and discard guards.

The input suite covers shared and compatibility controls, native textarea and rich text entry, Enter confirmation, Shift+Enter line breaks, IME/key-code 229, repeats, disabled actions, nested and ambiguous scopes, portal dialogs and neutral focus. It saves eight theme/viewport renders under `tests/output/input` or the explicitly supplied evidence directory.

The shared composer cases also verify empty Send, IME confirmation, repeated Enter while busy, explicit Stop, retained draft and the 200px internal-scroll bound. The integration suite injects local Git sources, inconsistent revisions, duplicate package entries, stale actual installations, unbuilt Git packages, copied controls/tokens, retired vendor directories and old peer versions. These checks use isolated synthetic fixtures only.

`VALIDATION.json` records computed geometry and interaction results. `SKILL_VALIDATION.json` records generated resource-link checks, server import and localized defaults. Screenshots contain synthetic data only. Inspect representative screens after changes; numeric geometry checks cannot establish visual fidelity on their own.

The public audit checks current tracked/unignored files, reachable Git history, package metadata, internal paths/domains and recognizable credential formats. It reports file names and finding categories without exposing matched content. It complements source review and does not establish provenance for arbitrary future contributions.

Consumers run their own typechecks, builds, navigation/theme/usage contracts and isolated Electron probes against the pinned package. Native window actions, tray lifecycle, production authentication and actual display scaling remain Host-specific validation responsibilities.

`test:sidebar` runs `examples/sidebar-panel-contract.tsx` and checks actual sidebar geometry in portable SidebarPanel and client SettingsLayout compositions, both themes and three viewport/scale cases. It verifies keyboard steps (including rapid steps during a transition), scaled dragging, width bounds, cancellation, Host-controlled folding, retained drafts/scroll/child identity, completed and reversed animations, inert collapsed content and reduced motion. Synthetic captures and measured results go to `tests/output/sidebar-panel`; `npm run ci` includes this gate. Component tests check the CSS width token and callback/state contracts; jsdom does not prove rendered CSS widths.

The package contract uses the actual prepared distribution under strict script/style CSP and checks host scroll/cursor/animation ownership, independent themes and origin-token portals, drafts, refs, switches, combobox Tab/IME/commit behavior, nested Dialog Escape/focus return and modal accessibility. Three viewport/scale configurations cover both themes. Component unit tests additionally check native ref targets and controlled/uncontrolled/cancelled/disabled callback semantics.

`test:package` installs the produced tarball normally in fresh independent React 18.3.1/19.0.0/19.3.0 projects, checks declarations without skipLibCheck, builds browser imports and renders on the server. DESKTOP_UI_CONSUMER_NODES may add existing isolated Node runtimes; CI runs Node 22.23.3 and 24.19.0 consumers. No registry consumer compiles this repository.

On Windows/Edge, run `test:visual` after `test:package-contract`. Eight committed synthetic captures are compared with pixelmatch (AA excluded, color threshold 0.1, changed-area ceiling 0.2%). Differences produce images and fail the gate. `test:visual:update` is only for an explicitly reviewed baseline; CI never accepts new captures automatically. Windows deviceScaleFactor is emulation, not native OS scaling.
