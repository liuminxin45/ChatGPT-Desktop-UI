# Independent package hardening

Compatibility baseline: `9e565d8b7d04a9e9598fc6428f12c4f00ec68fcf`, the coordinated consumer revision. Preserve its improvements when integrating into main. The measured ChatGPT profile and Host-owned services remain unchanged.

1. Protect changes: PR validation separate from deployment, interaction regressions, package-consumption gates and Hooks lint.
2. Isolate integration: opt-in scoped component CSS, a controlled local theme provider and owned portal containers; explicit document adapter; repair combobox submission/focus and unify Dialog modality on Radix. Existing document CSS/root APIs remain supported during migration.
3. Deliver a consumable package: prebuilt tarball installation, React 18/19 and Node 22/24 consumer fixtures, ref/value contracts, package metadata and release checks. Source development and coordinated desktop builds remain on Node 24.19.0.
4. Migrate and release: coordinate all three Host pins and lockfiles, validate actual installed distribution and renderer/package paths, generate documentation/Skill, publish immutable Git/GitHub artifacts and npm when authenticated.

Acceptance requires host scroll/cursor/theme isolation, independently themed roots and portals, keyboard/IME/blur semantics, topmost modal dismissal and focus return, retained drafts, light/dark and viewport/scale geometry, package consumers and coordinated Host validation. Source checks, browser emulation and isolated package smoke tests are reported separately from formal installation acceptance.

The library emits no usage or diagnostic payloads. Stable action markers remain Host-owned. No services, native persistence, business databases or private content enter the public package.
