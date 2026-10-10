import { ArrowUp, Stop, Waveform } from '@phosphor-icons/react';
import { forwardRef, useLayoutEffect, useRef, type ReactNode } from 'react';
import { Button, Textarea } from '../../controls';
export { AIResponse, AIResponseProvider, type AIResponseProps } from './ai-response';

export interface ClientComposerProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  label: string;
  placeholder?: string;
  variant?: 'work' | 'chat';
  context?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  attachments?: ReactNode;
  status?: ReactNode;
  busy?: boolean;
  disabled?: boolean;
  onStop?: () => void;
  onVoice?: () => void;
  sendLabel?: string;
  stopLabel?: string;
  voiceLabel?: string;
  actionId: string;
}

/** Controlled composition; drafts, attachments and command outcomes belong to the Host. */
export const ClientComposer = forwardRef<HTMLTextAreaElement, ClientComposerProps>(function ClientComposer(
  {
    value,
    onValueChange,
    onSubmit,
    label,
    placeholder,
    variant = 'work',
    context,
    leading,
    trailing,
    attachments,
    status,
    busy = false,
    disabled = false,
    onStop,
    onVoice,
    sendLabel = 'Send message',
    stopLabel = 'Stop generating',
    voiceLabel = 'Start voice mode',
    actionId,
  },
  forwardedRef,
) {
  const input = useRef<HTMLTextAreaElement | null>(null);
  useLayoutEffect(() => {
    const element = input.current;
    if (!element || !element.getClientRects().length) return;
    element.style.height = '0px';
    const minimum = variant === 'chat' ? 24 : 46;
    element.style.height = `${Math.min(200, Math.max(minimum, element.scrollHeight))}px`;
    element.style.overflowY = element.scrollHeight > 200 ? 'auto' : 'hidden';
  }, [value, variant]);
  const hasText = Boolean(value.trim());
  const voice = !hasText && !busy && Boolean(onVoice);
  return (
    <div className={`client-composer-wrap client-composer-wrap--${variant}`}>
      {context ? <div className="client-composer-context">{context}</div> : null}
      <form
        className={`desktop-composer client-composer client-composer--${variant}`}
        aria-label={label}
        aria-busy={busy}
        data-desktop-surface={`${actionId}.composer`}
        onSubmit={(event) => {
          event.preventDefault();
          if (hasText && !busy && !disabled) onSubmit();
        }}
      >
        {attachments ? <div className="client-composer-attachments">{attachments}</div> : null}
        <Textarea
          ref={(element) => {
            input.current = element;
            if (typeof forwardedRef === 'function') forwardedRef(element);
            else if (forwardedRef) forwardedRef.current = element;
          }}
          aria-label={label}
          placeholder={placeholder}
          value={value}
          rows={1}
          disabled={disabled}
          data-desktop-action={`${actionId}.edit`}
          onChange={(event) => onValueChange(event.target.value)}
        />
        <div className="client-composer-actions">
          {leading}
          <div className="client-spacer" />
          {trailing}
          <Button
            type={!busy && !voice ? 'submit' : 'button'}
            className="desktop-send-control"
            aria-label={busy ? stopLabel : voice ? voiceLabel : sendLabel}
            actionId={`${actionId}.${busy ? 'stop' : voice ? 'voice' : 'send'}`}
            disabled={disabled || (busy ? !onStop : !hasText && !voice)}
            onClick={busy ? onStop : voice ? onVoice : undefined}
          >
            {busy ? <Stop size={16} weight="fill" /> : voice ? <Waveform size={18} /> : <ArrowUp size={18} />}
          </Button>
        </div>
      </form>
      {status ? (
        <div className="client-composer-status" role="status">
          {status}
        </div>
      ) : null}
    </div>
  );
});

/** Shared message geometry; message content and contextual action definitions stay controlled. */
export function ConversationMessage({
  role,
  children,
  actions,
  label,
}: {
  role: 'user' | 'assistant';
  children: ReactNode;
  actions?: ReactNode;
  label: string;
}) {
  return (
    <article
      className={`desktop-conversation-message desktop-conversation-message--${role}`}
      aria-label={label}
    >
      <div>{children}</div>
      {actions ? <div className="desktop-conversation-message-actions">{actions}</div> : null}
    </article>
  );
}
