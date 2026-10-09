# Design system

- [Foundations and measured geometry](../DESIGN_SYSTEM.md): canonical tokens, type scale, surfaces, motion, portable defaults and versioned client profile.
- [Composition and adaptation](../DESIGN_GUIDANCE.md): workflow, layout and reference comparison.
- [Component ownership](../COMPONENTS.md): controlled state, Host capabilities and composition boundaries.
- [Generated API catalog](catalog.json): exact exported signatures/props, including compound APIs and native React attributes.
- [Actions](components/actions.md), [forms](components/forms.md), [navigation](components/navigation.md), [layout](components/layout.md), [overlays](components/overlays.md), [lists](components/lists.md), [feedback](components/feedback.md).
- [Shell](components/shell.md), [client profile](components/client.md), [conversation](components/conversation.md), [runtime](components/runtime.md), [compound adapters](components/compat.md).

Implementation authority is `src/components/` for portable/client components and `src/compat/` for compound adapters. Tokens and CSS remain in `src/`; public entry files only forward exports. Compound inputs/actions reuse canonical native rendering. Compound menu/dialog APIs retain Radix semantics and Host Tailwind styling.

Component documents and Skill API references are generated, not independently authored copies. Edit props/JSDoc in the implementation and run `npm run docs:generate`. Add a component to an existing responsibility family or register a new family with its actual composition and states in `scripts/component-catalog.mjs`. Never add unused speculative controls.
