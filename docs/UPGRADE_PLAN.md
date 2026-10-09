# Component library upgrade — 0.4

Reference: [animal-island-ui](https://github.com/guokaigdg/animal-island-ui), inspected at `945cb5bb514b4868247b540fa3aa6915c6dbfc2c`. This comparison uses its actual source, package, development docs and documentation-sync script. Its visual style is not the target. The target remains Windows ChatGPT 26.1002.7124.0 and the existing portable/embedded profiles.

## Gap analysis

| Area | Reference | Existing library | Upgrade / acceptance |
| --- | --- | --- | --- |
| Source ownership | Component directories with implementation, entry and tests | Large controls module plus compound compatibility entries | Organize controls by responsibility; keep old imports as forwarding entries; share native control rendering across APIs |
| API discovery | Component specs and registered interactive demo | Pattern gallery and replica, scattered API descriptions | Generate typed API catalog from actual exports; searchable online reference, runnable examples and source links |
| Design system | Design-system directory; tokens and component specifications | Measured tokens/profile already available; flat documents | Audience entry and canonical design-system directory; preserve measurements and explicit fidelity gaps |
| Contributor workflow | Development guides, contributing guide and ADRs | Commands and constraints spread across README/AGENTS | One development contract, decisions, contribution and release checklist |
| Documentation maintenance | Script checks component docs and Skill coverage | Skill copied from docs; no export/API drift gate | Generated catalog/specs/Skill API references; fail CI on stale generated output or undocumented families |
| Quality | Unit, accessibility, type, format and build CI | Extensive browser contracts but deployment only checks types | Unified gate: source ownership, API sync, input/menu/state, accessibility and visual contracts before deployment |
| Distribution | Module exports, CSS contract, external React | ESM split chunks and explicit CSS; Git prepare, source/compat imports | Preserve public contracts and React externals; expose responsibility-based module entries, test installed distribution |
| Adoption | Primarily library/demo | Three coordinated real Hosts with forwarding adapters | Inspect actual source usage; report imports per component, detect copied adapters; pin all Hosts to one public commit and build all three |

## Execution plan

1. **Inventory and contracts.** Record reference revision, exported APIs, both public API shapes and actual Host imports. Separate platform/business ownership from shared primitives. Do not extract business services, catalogs, logging or Tool lifecycle.
2. **Source structure.** Split controls into actions, forms, navigation, layout, overlays, lists and feedback. Preserve stable facades and compound APIs. Reuse core rendering for native buttons, inputs, textareas and scroll containers; preserve Slot/Radix behavior where the APIs differ. Keep CSS/tokens authoritative in one place.
3. **Documentation.** Add usage/design/development/ADR entry points, a contribution contract and changelog. Generate component signatures/props/source mapping from TypeScript rather than maintaining a second API definition. Document migration and ownership, not only colors.
4. **Interactive reference.** Publish a searchable component catalog alongside the unchanged client replica. Reuse the actual library for its controls, stateful examples, themes and keyboard interactions. API details come from generated metadata. Publish the existing gallery too.
5. **Automation and Skill.** Check generated docs, family registration and source facades. Add accessibility/keyboard contracts and an adoption report over source-only consumer directories. Package the canonical docs and generated API into the Skill. Keep the replica's measured-fidelity caveats.
6. **Coordinated integration.** Publish the verified library commit; install that exact public commit with prepare enabled in an isolated fixture and all three Hosts. Update adapter peers and integration expectations together. Keep compatibility import paths; prohibit local vendor copies.
7. **Build and release.** Run shared-library checks, three typechecks/tests/builds, relevant isolated packaged startup probes. Record results and baseline failures separately. Commit adaptations, publish the Demo/reference, and annotate the release tag with the observed ChatGPT package version.

## Completion criteria

- Public root, compound compatibility and stylesheet imports continue to work; declaration generation and public installation pass.
- Every public component family has generated API docs, an actual usage/example location, ownership guidance and a registered test surface. New public APIs cannot bypass those gates.
- Repeated native control rendering is shared; application-local forwarding files contain no implementation.
- All three Hosts install the same complete public Git revision, pass integration checks and build; startup evidence states which package and isolated profile was exercised.
- Online replica and component reference deploy from a passing quality gate. No private captures, business text, paths or credentials enter the public package.
- Demo remains a measured recreation; unobserved native surfaces are not described as fully accepted 1:1.

## Boundaries and risks

Compatibility exports are retained because real Hosts use them. A root composition API and a compound Radix API are different contracts, not grounds for deleting a working API. Sharing their native rendering must preserve refs, Slot behavior, input confirmation, event markers, disabled states and Host typography. Large lists, retained surfaces and drafts require regression checks. The existing browser suite is valuable and will be extended rather than replaced by arbitrary coverage targets. No copied reference implementation, new desktop runtime, business storage migration or production installation is part of this upgrade.
