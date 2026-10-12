# Usage

Install the prebuilt npm package, or a released immutable Git revision using the [integration contract](../INTEGRATION.md). Use React 18.3.1/19 and import CSS once:

```tsx
import { DesktopProvider, Button, Input } from 'chatgpt-desktop-kit';
import 'chatgpt-desktop-kit/components.css';

<DesktopProvider defaultTheme="system">
  <Input aria-label="Project name" />
  <Button actionId="project.create" onClick={createProject}>Create project</Button>
</DesktopProvider>
```

For a narrower JavaScript entry, import `chatgpt-desktop-kit/components/actions` or `/components/forms`. CSS remains explicit and authoritative; React stays external. Root imports remain supported.

Tailwind Hosts keep `compat/*` imports and scan `node_modules/chatgpt-desktop-kit/src/**/*.{ts,tsx}`. Whole desktop documents import `desktop.css` and mount one `DesktopDocumentAdapter`; existing controls/token/shell forwarding paths remain compatible. Compatibility entry points are shared implementations, not a license to copy controls into a Host. Embedded Tools inherit the Host root/styles and typography. Removed host.css/host-shell.css entries must not be restored. See [0.6 migration](../MIGRATION_0_6.md).

## 0.3 → 0.4 migration

Existing root/compat/source/style imports remain valid. Internal source was reorganized behind stable facades. Native Button/Input/Textarea/scroll rendering is now shared across APIs. Keep existing controlled state and stable action IDs. Upgrade every coordinated Host to the same complete public commit; set private adapter peers to `^0.4.1`. Install with Git prepare enabled; run `ui:check` and the Host's typecheck/build.

Run `npm run audit:adoption -- <consumer-source-root> ...` from the library checkout to inspect actual source imports and forwarding declarations. It reads source/dependency metadata only, never runtime profiles or business data. Its detailed report stays in ignored `artifacts/` because Host source names may be private. The integration checker rejects copied forwarders, vendor implementations, local links and mismatched pins.

The report lists direct import evidence per export and shares evidence between aliases. Unreferenced compound slots are reported explicitly; they are preserved as composition/migration contracts rather than forced into business screens. The public component gate rejects a new standalone component with no real example/use, and coordinated audit rejects empty adoption, mismatched versions or divergent Host revisions.
