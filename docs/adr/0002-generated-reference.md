# 0002 — generated API and separate reference

Status: accepted for 0.4.

Hand-maintained Props tables and repeated Skill API text drift from source. The TypeScript checker discovers callable component exports, follows aliases and emits exact Props, implementation paths and family membership. Generated Markdown/JSON feed the online reference and packaged Skill. CI rejects stale output and missing family examples; source remains authoritative.

Design intent and measured alignment stay hand-authored because code cannot establish visual provenance or Host ownership. The engineering reference is published at `/components/` and the behavioral gallery at `/gallery/`. The root remains the client replica. This avoids adding documentation labels or reference navigation to the recreated product UI. Build dependencies stay development-only, and package consumers receive prepared library output rather than the reference application.
