# Development contract

## Structure

`src/components/{actions,forms,navigation,layout,overlays,lists,feedback,shell,client,conversation}` owns portable/profile implementations. Root source entry files are stable facades. `src/components/radix/` owns compound APIs using the same canonical control styles. `src/compat/` contains only export forwarding. Runtime/theme/input helpers and semantic CSS live in `src/`. `examples/demo/` is the versioned replica, `examples/catalog/` is the interactive typed reference, and `examples/gallery/` covers workspace/settings contracts. `scripts/` contains build, generation and verification; `tests/` contains source/distribution contracts.

## Component change

1. Identify an actual repeated control or requested behavior in a consumer. Prefer composing existing exports; keep business data/services in the Host.
2. Update the canonical implementation, props/JSDoc and semantic CSS. Forward public paths rather than copying renderers. Preserve controlled state, refs, IME, keyboard, portal visibility and action markers.
3. Add/extend a stateful family composition. Register a new family only with a real example and meaningful states. Include loading/error/disabled/long-label cases where applicable.
4. Run `docs:generate`; inspect its props/source map. Do not edit generated catalog/specs. API docs are a code projection, while hand-authored ownership/design guidance records intent.
5. Run `check` and `test:reference`; functional/visual changes also run the gallery, replica, input and icon contracts. Inspect both themes, compact/wide viewports and scaling emulation. Test retention/failure, not just the successful click.
6. Run adoption audit over affected Hosts, their integration check and builds. New exports need actual composition/use evidence; unused API proposals do not satisfy completion.

## Quality and accessibility

`npm run check` checks type declarations/examples, generated API drift, facade/native-renderer ownership, neutral namespace and integration contracts. `npm run test:reference` checks all family compositions, search, theme retention, compound dialog/select/Slot, keyboard and axe WCAG A/AA violations. Existing browser contracts verify geometry, collisions, drafts and reduced motion. Formatting applies to new structured modules/reference/scripts; legacy files are formatted when materially changed, not as an unrelated repository rewrite.

## Build and release

Node is 24.19.0. `build:library` emits split ESM, declarations, CSS and license notices with React external. `prepare` uses that library-only build so consumer installs do not build engineering demos. `site:build` builds replica/reference/gallery into one Pages artifact. Development dependencies and reference pages stay outside the package's `files` contract.

Before publishing: pass library/browser gates, audit public content, commit the candidate, verify a fresh installation of that public commit, install it in all coordinated Hosts, validate each Host and its isolated packaged startup. Do not replace pins with local files after a failed install. Record baseline failures separately. Annotate the release tag `chatgpt-desktop-<observed-package-version>-ui-v<kit-version>` and preserve measured-fidelity limitations. GitHub Pages deploy requires the quality job to pass.
