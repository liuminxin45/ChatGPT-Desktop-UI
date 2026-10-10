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
| onReveal | no | `(() => void) \| undefined` |

## AIResponseProvider (chatgpt-desktop-kit)

[Implementation](../../../src/components/conversation/ai-response.tsx)

Mount above virtualized conversations. Only offsets and timing are retained, never response text.

| Prop | Required | Type |
| --- | --- | --- |
| children | yes | `ReactNode` |

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
| disabled | no | `boolean \| undefined` |
| onStop | no | `(() => void) \| undefined` |
| onVoice | no | `(() => void) \| undefined` |
| sendLabel | no | `string \| undefined` |
| stopLabel | no | `string \| undefined` |
| voiceLabel | no | `string \| undefined` |
| actionId | yes | `string` |

## ConversationMessage (chatgpt-desktop-kit)

[Implementation](../../../src/components/conversation/index.tsx)

Shared message geometry; message content and contextual action definitions stay controlled.

| Prop | Required | Type |
| --- | --- | --- |
| role | yes | `"user" \| "assistant"` |
| children | yes | `ReactNode` |
| actions | no | `ReactNode` |
| label | yes | `string` |
