# Validation

Use Node 24.19.0 and run:

```sh
npm run typecheck
npm run build
npm test
npm run test:input
npm run test:integration
npm run audit:public
npm run skill:package
npm run skill:check
```

The visual suite renders workspace, chat, settings and controls in light/dark themes at 1920×1080, 1280×800 and 1536×864 CSS pixels with device scale 1.25: 24 cases. Nine interaction groups cover list virtualization, keyboard/dialog focus, theme and sidebar draft preservation, theme persistence, category search, portal collisions, failed saves and discard guards.

The input suite covers shared and compatibility controls, native textarea and rich text entry, Enter confirmation, Shift+Enter line breaks, IME/key-code 229, repeats, disabled actions, nested and ambiguous scopes, portal dialogs and neutral focus. It saves six theme/viewport renders under `tests/output/input` or the explicitly supplied evidence directory.

The shared composer cases also verify empty Send, IME confirmation, repeated Enter while busy, explicit Stop, retained draft and the 200px internal-scroll bound. The integration suite injects local Git sources, inconsistent revisions, duplicate package entries, stale actual installations, unbuilt Git packages, copied controls/tokens, retired vendor directories and old peer versions. These checks use isolated synthetic fixtures only.

`VALIDATION.json` records computed geometry and interaction results. `SKILL_VALIDATION.json` records generated resource-link checks, server import and localized defaults. Screenshots contain synthetic data only. Inspect representative screens after changes; numeric geometry checks cannot establish visual fidelity on their own.

The public audit checks current tracked/unignored files, reachable Git history, package metadata, internal paths/domains and recognizable credential formats. It reports file names and finding categories without exposing matched content. It complements source review and does not establish provenance for arbitrary future contributions.

Consumers run their own typechecks, builds, navigation/theme/usage contracts and isolated Electron probes against the pinned package. Native window actions, tray lifecycle, production authentication and actual display scaling remain Host-specific validation responsibilities.
