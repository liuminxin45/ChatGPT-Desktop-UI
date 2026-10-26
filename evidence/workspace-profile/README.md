# Workspace profile 0.8.11

Run `npm run build:library` and `npm run test:workspace-profile` with Node 24.19.0.
The fixture imports the prepared distribution under a self-only script/style CSP.
All content and commands are synthetic. It submits no production request.

`result.json` records twelve passing light/dark views: desktop 1440×1000,
1280×800 at 1.25 device scale, and 390/360/320/430px phone viewports. Checks cover
the workspace palette, CJK font stack, body/control sizes, 56px header, action
surface, retained draft node, profile inheritance into drawer and nested portals,
selection cancellation with Escape/outside/host Back/window blur, focus and
scroll return, selected-value persistence and release of isolation on disable.

Committed examples include the 390px and 1440px light/dark overview and short
settings sheet. The verifier generates 24 full screenshots locally. Independent
legacy `test:app-surface` still passes its eight light/dark portable/editorial
views and reduced-motion check. Targeted unit tests pass 12 assertions across
layout, forms and dismissal; typecheck and source lint also pass.

These are browser layout/interaction checks. They do not certify a physical
Android keyboard, native predictive Back or the consuming workbench's business
flows. Hosts must verify real integration separately.
