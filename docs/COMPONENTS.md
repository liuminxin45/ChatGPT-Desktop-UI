# Component implementation map

This is the public reuse contract. Components own visual geometry, accessible interaction and semantic styles. Hosts own data, native capabilities, state persistence, diagnostic/usage events and business outcomes.

| Pattern | Public exports | Controlled state / Host responsibility |
| --- | --- | --- |
| Document and theme | `DesktopRoot`, `DesktopSurface`, `useDesktopTheme` | Theme storage key; native theme preferences |
| Portable shell | `DesktopShell`, `TitleBar`, `NavigationRail`, `AvatarMenu` | History, capabilities, pinned destinations, identity |
| Versioned client shell | `DesktopClientSurface`, `ClientSidebar`, `SidebarSection` | Route, retained mounted content, contextual taxonomy |
| Nested menus | `DesktopMenu`, `DesktopMenuItem`, `MenuButton` | Stable action IDs, enabled state, callbacks and translated labels |
| Chat and work input | `ClientComposer` | Value, submit/cancel/voice callbacks, capability state, attachment slots |
| Conversation messages | `ConversationMessage` | Content, role, accessible label and action slots |
| Text input boundary | `InputBehaviorRoot`, `Input`, `Textarea`, `EditableCombobox` | Scoped confirmation button, IME-safe commands, retained draft |
| Selection | `Select`, `Tabs`, `Checkbox`, `Switch` | Selected value, disabled/error state and save outcome |
| Settings | `SettingsNavigation`, `SettingsPage`, `SettingsSection`, `SettingRow` | Category/search, preference values and save errors |
| Versioned settings groups | `SettingsGroup`, `SettingsField`, `SettingsDisclosure` | Labels, descriptions, preference controls; Host typography policy |
| Dialog and feedback | `Dialog`, `EmptyState`, `ErrorState`, `LoadingSkeleton` | Open/close, destructive intent, unsaved guard, retry |
| Scrolling and lists | `InternalScrollArea`, `VirtualList`, `FixedVirtualList` | Item identity, sizing, anchor and reset key |
| Workspace | `WorkbenchPage`, `PageBar`, `PageToolbar` | Business tabs, filters and current actions |
| Compound React adapters | `compat/*` | Existing Radix-style API composition; no copied implementation |
| Release integration | `integration-check` (`checkConsumer`) | Consumer root, coordinated revision/version and declared forwarding paths |

`ClientComposer` is controlled and forwards its textarea ref. `variant="work"` uses the desktop work toolbar; `variant="chat"` uses a compact chat input. The textarea grows up to 200px, then scrolls internally. `leading`, `trailing`, `context` and `attachments` compose existing shared controls. Empty text cannot submit; busy state exposes the supplied stop action; unavailable voice stays unavailable. Enter confirms through the shared input boundary, Shift+Enter inserts a line break and IME confirmation does not send. Hosts supply accessible and localized labels and stable `actionId` values.

`ConversationMessage` owns the user bubble and response action spacing. Its content and action slots accept existing shared buttons/menus. It does not generate responses, vote on behalf of users or write clipboard data; those callbacks belong to the consumer.

When adding a reusable control, export it from `src/index.ts`, document its ownership here and in the design system, and verify its interaction states in the gallery or Demo. Repeated source in consumer repositories is a defect even if screenshots happen to match.
