# Composer actions, 2026-10-10

The reference is the two supplied ChatGPT client button captures (up-arrow Send and filled square Stop). The shared implementation uses a 32px circle, a 16px arrow and a 10px filled square; it also defines transport-pending and cancellation-pending progress rings.

`test:composer` passed six light/dark cases at 1920x1080, 1280x800 and 1536x864 with 125% device-scale emulation. Measured dimensions, colors and disabled state are saved in result.json. Screenshots were inspected; this is browser emulation, not Windows scaling changes or native ChatGPT execution. Pointer/Space Stop, Enter Send, Shift+Enter, busy/unsupported disabled controls, draft preservation and reduced motion were checked.

Library and gallery typechecks, prepared distribution, generated API docs, and shared input behavior checks passed. Host cancellation and transport acknowledgements remain consumer-owned.
