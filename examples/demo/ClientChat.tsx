import { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, SpeakerHigh, ArrowsClockwise, DotsThree } from '@phosphor-icons/react';
import { AIResponse, ConversationMessage, IconButton, DesktopMenu } from '../../src';

export function ClientChat({ messages }: { messages: { own: boolean; text: string }[] }) {
  const [copied, setCopied] = useState<number | null>(null);
  const [votes, setVotes] = useState<Record<number, 'up' | 'down' | undefined>>({});
  const [notice, setNotice] = useState('');
  const initial = [
    { own: true, text: 'Help me turn these research notes into a short project update.' },
    { own: false, text: 'The usability study is complete. Six participants tested navigation, search, and project switching. Everyone found the project switcher; two needed a clearer cue for recent conversations.\n\nNext, we’ll refine that cue and repeat the task with a new group. The updated prototype is ready for review on Thursday.' },
  ];
  return <div className="client-thread client-thread--chat">
    {[...initial, ...messages].map((message, index) => <ConversationMessage key={index}
      role={message.own ? 'user' : 'assistant'} label={message.own ? 'Your message' : 'ChatGPT response'}
      actions={<>
        <IconButton aria-label={copied === index ? 'Copied' : 'Copy message'} actionId="client.response.copy" onClick={async () => {
          try { await navigator.clipboard.writeText(message.text); setCopied(index); setNotice(''); }
          catch { setNotice('Clipboard access is unavailable. Select the text to copy it.'); }
        }}>{copied === index ? <Check size={16} /> : <Copy size={16} />}</IconButton>
        {!message.own ? <>
          <IconButton aria-label="Good response" aria-pressed={votes[index] === 'up'} actionId="client.response.up"
            onClick={() => setVotes(old => ({ ...old, [index]: old[index] === 'up' ? undefined : 'up' }))}><ThumbsUp size={16} weight={votes[index] === 'up' ? 'fill' : 'regular'} /></IconButton>
          <IconButton aria-label="Bad response" aria-pressed={votes[index] === 'down'} actionId="client.response.down"
            onClick={() => setVotes(old => ({ ...old, [index]: old[index] === 'down' ? undefined : 'down' }))}><ThumbsDown size={16} weight={votes[index] === 'down' ? 'fill' : 'regular'} /></IconButton>
          <IconButton aria-label="Read aloud" disabled><SpeakerHigh size={16} /></IconButton>
          <DesktopMenu trigger={<button className="desktop-icon-control" aria-label="Response options"><ArrowsClockwise size={16} /></button>}
            items={[{ id: 'client.response.retry', label: 'Try again', onSelect: () => setNotice('The same sample response is shown. Generation is not connected.') }]} />
          <DesktopMenu trigger={<button className="desktop-icon-control" aria-label="More response actions"><DotsThree size={16} /></button>}
            items={[{ id: 'client.response.report', label: 'Report', disabled: true }, { id: 'client.response.share', label: 'Share', disabled: true }]} />
        </> : null}
      </>}>{message.own ? <div className="client-message-text">{message.text}</div> : <AIResponse responseId={`chat-demo-${index}-${message.text.length}`} content={message.text} animate={index >= initial.length} />}</ConversationMessage>)}
    {notice ? <p role="status">{notice}</p> : null}
  </div>;
}
