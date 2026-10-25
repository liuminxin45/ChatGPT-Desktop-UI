# Touch first app profile validation

The 0.8.9 opt-in AppSurface profile is a product UI composition, not a measured
ChatGPT client recreation. Portable controls and existing client profiles retain
their geometry. A fresh worktree based on the consumer's pinned bdc3f85 revision
was used so generated files from another branch were preserved.

The prepared library probe is `npm run test:app-surface`. It builds
`examples/app-surface.tsx` against `dist/index.js` and `dist/desktop.css`, serves
with self-only script/style CSP and uses Edge with synthetic content.

The probe checks 1920x1080, 1280x800 at device scale 1.25, 390x844 and 320x740 in
light and dark themes. It verifies unchanged 36px portable controls, at least
44px app hit targets, 16px input, stable tile hover/press geometry, theme changes
retaining the same input, and app token/theme propagation into sheet/select
portals. On phone viewports, a 150px handle drag dismisses the sheet; nested
Escape leaves the parent open first, and final dismissal restores trigger focus.
Reduced motion keeps transitions effectively static. No page errors occurred.

Eight screenshot files and the machine-readable result are generated in ignored
`evidence/app-surface/`. Screenshots were inspected in light/dark and phone/desktop
layouts. The generic native checkbox keeps a 44px target with a 20px inner visual.
Browser input/device-scale simulation is not evidence of real Android hardware,
OS keyboard behavior, Windows system scaling or haptics.
