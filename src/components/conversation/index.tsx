import { Waveform } from '@phosphor-icons/react';
import { forwardRef, useLayoutEffect, useRef, type ReactNode } from 'react';
import { Button, Textarea, type ButtonProps } from '../../controls';
import { ArrowUp, LoaderCircle } from 'lucide-react';
import { classes } from '../classes';

export type ComposerActionState = 'ready' | 'sending' | 'stoppable' | 'stopping';

export interface ComposerActionButtonProps
  extends Omit<
    ButtonProps,
    'children' | 'icon' | 'iconOnly' | 'variant' | 'size' | 'onClick' | 'confirmOnEnter' | 'aria-label'
  > {
  state: ComposerActionState;
  actionId: string;
  onSend: () => void | Promise<void>;
  onStop?: () => void | Promise<void>;
  /** Draft/attachment readiness affects Send only; it must never disable Stop. */
  sendDisabled?: boolean;
  sendLabel?: string;
  sendingLabel?: string;
  stopLabel?: string;
  stoppingLabel?: string;
}

/** One ChatGPT-style circular action for message composers; Hosts own operation state and cancellation. */
export const ComposerActionButton = forwardRef<HTMLButtonElement, ComposerActionButtonProps>(
  function ComposerActionButton(
    {
      state,
      actionId,
      onSend,
      onStop,
      sendDisabled = false,
      disabled = false,
      sendLabel = 'Send message',
      sendingLabel = 'Sending',
      stopLabel = 'Stop generating',
      stoppingLabel = 'Stopping',
      className,
      type = 'button',
      ...props
    },
    ref,
  ) {
    const busy = state === 'sending' || state === 'stopping';
    const stop = state === 'stoppable';
    const label =
      state === 'sending'
        ? sendingLabel
        : state === 'stopping'
          ? stoppingLabel
          : stop
            ? stopLabel
            : sendLabel;
    return (
      <Button
        {...props}
        ref={ref}
        type={stop || busy ? 'button' : type}
        actionId={actionId}
        className={classes('desktop-send-control', className)}
        data-composer-state={state}
        aria-label={label}
        aria-busy={busy || undefined}
        iconOnly
        disabled={disabled || busy || (stop ? !onStop : sendDisabled)}
        confirmOnEnter={state === 'ready'}
        onClick={stop ? onStop : busy ? undefined : onSend}
        icon={
          busy ? (
            <LoaderCircle size={16} className="desktop-composer-progress" />
          ) : stop ? (
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <rect width="10" height="10" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <ArrowUp size={16} strokeWidth={2} />
          )
        }
      />
    );
  },
);

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
  actionState?: ComposerActionState;
  sendingLabel?: string;
  stoppingLabel?: string;
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
    actionState,
    sendingLabel,
    stoppingLabel,
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
  const state = actionState ?? (busy ? (onStop ? 'stoppable' : 'sending') : 'ready');
  const active = state !== 'ready';
  const voice = !hasText && !active && Boolean(onVoice);
  return (
    <div className={`client-composer-wrap client-composer-wrap--${variant}`}>
      {context ? <div className="client-composer-context">{context}</div> : null}
      <form
        className={`desktop-composer client-composer client-composer--${variant}`}
        aria-label={label}
        aria-busy={active}
        data-desktop-surface={`${actionId}.composer`}
        onSubmit={(event) => {
          event.preventDefault();
          if (hasText && !active && !disabled) onSubmit();
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
          {voice ? (
            <Button
              type="button"
              className="desktop-send-control"
              aria-label={voiceLabel}
              actionId={`${actionId}.voice`}
              disabled={disabled}
              onClick={onVoice}
              iconOnly
              icon={<Waveform size={18} />}
            />
          ) : (
            <ComposerActionButton
              state={state}
              type="submit"
              actionId={`${actionId}.${state === 'stoppable' || state === 'stopping' ? 'stop' : 'send'}`}
              onSend={() => undefined}
              onStop={onStop}
              disabled={disabled}
              sendDisabled={!hasText}
              sendLabel={sendLabel}
              sendingLabel={sendingLabel}
              stopLabel={stopLabel}
              stoppingLabel={stoppingLabel}
            />
          )}
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
