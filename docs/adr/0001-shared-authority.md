# 0001 — one implementation, stable API facades

Status: accepted for 0.4.

Portable components and Tailwind/Radix compound adapters serve different existing composition contracts. Removing either contract would force unnecessary business changes. Shared controls are grouped by responsibility; root paths remain forwarding facades. Native buttons, inputs, textareas and scroll containers reuse canonical rendering. Slot/Radix-specific composition remains in the compound adapter. Styling uses one semantic token/control source, with explicit Host/profile typography boundaries.

All coordinated consumers pin one immutable public Git commit. Application-local forwarding modules contain no renderer or token implementation. Integration checks enforce this boundary, and the adoption audit records source imports. Business services, platform commands, catalogs and telemetry remain in Hosts. Keeping a facade does not establish a second implementation owner.
