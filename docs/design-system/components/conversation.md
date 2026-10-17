# conversation

Controlled work/chat composer and message geometry.

States: empty, draft, multiline, sending, stopped.

Runnable composition: [example](../../../examples/demo/ClientChat.tsx).

Generated from TypeScript exports; edit implementation props/JSDoc, then run `npm run docs:generate`. Native React attributes remain available in the online API catalog.

## AIResponse (chatgpt-desktop-kit)

[Implementation](../../../src/components/conversation/ai-response.tsx)

One presenter for streamed increments and complete responses. Canonical content stays Host-owned.

| Prop | Required | Type |
| --- | --- | --- |
| content | yes | `string` |
| responseId | yes | `string` |
| animate | no | `boolean \| undefined` |
| state | no | `"streaming" \| "complete" \| "cancelled" \| "failed" \| undefined` |
| className | no | `string \| undefined` |
| components | no | `Components \| undefined` |
| onCopyCode | no | `((text: string) => void \| Promise<void>) \| undefined` |
| onReveal | no | `(() => void) \| undefined` |

## AIResponseProvider (chatgpt-desktop-kit)

[Implementation](../../../src/components/conversation/ai-response.tsx)

Mount above virtualized conversations. Only offsets and timing are retained, never response text.

| Prop | Required | Type |
| --- | --- | --- |
| children | yes | `ReactNode` |

## ChatAppSurface (chatgpt-desktop-kit)

[Implementation](../../../src/components/conversation/index.tsx)

Responsive chat profile. Hosts retain routing, persistence, services and all business state.

| Prop | Required | Type |
| --- | --- | --- |

## ChatHeader (chatgpt-desktop-kit)

[Implementation](../../../src/components/conversation/index.tsx)

One quiet object header; mobile controls use the reference's separate floating surfaces.

| Prop | Required | Type |
| --- | --- | --- |
| title | yes | `ReactNode` |
| subtitle | no | `ReactNode` |
| leading | no | `ReactNode` |
| actions | no | `ReactNode` |
| mobileTitle | no | `ReactNode` |
| hideMobileTitle | no | `boolean \| undefined` |

## ChatWorkspace (chatgpt-desktop-kit)

[Implementation](../../../src/components/conversation/index.tsx)

Retained desktop sidebar/mobile drawer. Opening, folding and resizing never remount either subtree.

| Prop | Required | Type |
| --- | --- | --- |
| sidebar | yes | `ReactNode` |
| sidebarOpen | yes | `boolean` |
| onSidebarOpenChange | yes | `(open: boolean) => void` |
| sidebarLabel | yes | `string` |
| closeSidebarLabel | yes | `string` |
| sidebarId | no | `string \| undefined` |
| contentId | no | `string \| undefined` |
| header | no | `ReactNode` |
| sidebarPresentation | no | `"drawer" \| "catalog" \| undefined` |

## ClientComposer (chatgpt-desktop-kit)

[Implementation](../../../src/components/conversation/index.tsx)

Controlled composition; drafts, attachments and command outcomes belong to the Host.

| Prop | Required | Type |
| --- | --- | --- |
| value | yes | `string` |
| onValueChange | yes | `(value: string) => void` |
| onSubmit | yes | `() => void` |
| label | yes | `string` |
| placeholder | no | `string \| undefined` |
| variant | no | `"work" \| "chat" \| undefined` |
| context | no | `ReactNode` |
| leading | no | `ReactNode` |
| trailing | no | `ReactNode` |
| attachments | no | `ReactNode` |
| status | no | `ReactNode` |
| busy | no | `boolean \| undefined` |
| actionState | no | `ComposerActionState \| undefined` |
| sendingLabel | no | `string \| undefined` |
| stoppingLabel | no | `string \| undefined` |
| disabled | no | `boolean \| undefined` |
| onStop | no | `(() => void) \| undefined` |
| onVoice | no | `(() => void) \| undefined` |
| sendLabel | no | `string \| undefined` |
| stopLabel | no | `string \| undefined` |
| voiceLabel | no | `string \| undefined` |
| actionId | yes | `string` |

## ComposerActionButton (chatgpt-desktop-kit)

[Implementation](../../../src/components/conversation/index.tsx)

One ChatGPT-style circular action for message composers; Hosts own operation state and cancellation.

| Prop | Required | Type |
| --- | --- | --- |
| state | yes | `ComposerActionState` |
| actionId | yes | `string` |
| onSend | yes | `() => void \| Promise<void>` |
| onStop | no | `(() => void \| Promise<void>) \| undefined` |
| sendDisabled | no | `boolean \| undefined` |
| sendLabel | no | `string \| undefined` |
| sendingLabel | no | `string \| undefined` |
| stopLabel | no | `string \| undefined` |
| stoppingLabel | no | `string \| undefined` |
| layout | no | `"row" \| "command" \| "tile" \| "surface" \| undefined` |
| badge | no | `ReactNode` |

## ComposerSurface (chatgpt-desktop-kit)

[Implementation](../../../src/components/conversation/index.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| layout | no | `"work" \| "chat" \| undefined` |
| input | no | `ReactNode` |
| attachments | no | `ReactNode` |
| leading | no | `ReactNode` |
| controls | no | `ReactNode` |
| action | no | `ReactNode` |

## ConversationMessage (chatgpt-desktop-kit)

[Implementation](../../../src/components/conversation/index.tsx)

Shared message geometry; message content and contextual action definitions stay controlled.

| Prop | Required | Type |
| --- | --- | --- |
| role | yes | `"user" \| "assistant"` |
| children | yes | `ReactNode` |
| actions | no | `ReactNode` |
| label | yes | `string` |

## ConversationViewport (chatgpt-desktop-kit)

[Implementation](../../../src/components/conversation/index.tsx)

Relative scroll viewport; floating commands stay outside ScrollEdgeFade.

| Prop | Required | Type |
| --- | --- | --- |

## ScrollToBottomButton (chatgpt-desktop-kit)

[Implementation](../../../src/components/conversation/index.tsx)

Hosts own follow-bottom state and scrolling; the kit owns the floating action.

| Prop | Required | Type |
| --- | --- | --- |
| size | no | `"sm" \| "md" \| undefined` |
| layout | no | `"row" \| "command" \| "tile" \| "surface" \| undefined` |
| variant | no | `ButtonVariant \| undefined` |
| actionId | no | `string \| undefined` |
| confirmOnEnter | no | `boolean \| undefined` |
| badge | no | `ReactNode` |
| visible | no | `boolean \| undefined` |
| label | no | `string \| undefined` |
