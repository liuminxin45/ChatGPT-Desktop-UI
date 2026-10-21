import { Waveform } from '@phosphor-icons/react';
import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Button, Textarea, type ButtonProps } from '../../controls';
import { ArrowUp, LoaderCircle } from 'lucide-react';
import { classes } from '../classes';
import { ScrollToBottomIcon } from '../../icons';
import { useTranslation } from '../../strings';
import { DismissalBoundary, useDismissalLayer } from '../../dismissal';
import { useDismissDrag } from '../../runtime/dismiss-drag';
export * from './composer-tools';
export * from './composer-agent-controls';

/** Responsive chat profile. Hosts retain routing, persistence, services and all business state. */
export function ChatAppSurface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classes('desktop-chat-app', className)} />;
}

export interface ChatHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  /** Floating mobile targets supplement a normal desktop object header. */
  mobileTitle?: ReactNode;
  /** Icon-only mobile header; the object title remains available on desktop. */
  hideMobileTitle?: boolean;
  /** A single compact application bar instead of separate floating targets. */
  presentation?: 'floating' | 'bar';
}

/** One quiet object header; mobile controls use the reference's separate floating surfaces. */
export function ChatHeader({
  title,
  subtitle,
  leading,
  actions,
  mobileTitle,
  hideMobileTitle = false,
  presentation = 'floating',
  className,
  ...props
}: ChatHeaderProps) {
  return (
    <header
      {...props}
      className={classes(
        'desktop-chat-header',
        presentation === 'bar' && 'desktop-chat-header--bar',
        hideMobileTitle && 'desktop-chat-header--compact',
        className,
      )}
    >
      {leading ? <div className="desktop-chat-header__leading">{leading}</div> : null}
      <div className="desktop-chat-header__copy">
        <div className="desktop-chat-header__title">{title}</div>
        {subtitle ? <div className="desktop-chat-header__subtitle">{subtitle}</div> : null}
      </div>
      {mobileTitle ? <div className="desktop-chat-header__mobile-title">{mobileTitle}</div> : null}
      {actions ? <div className="desktop-chat-header__actions">{actions}</div> : null}
    </header>
  );
}

export interface ChatWorkspaceProps extends HTMLAttributes<HTMLDivElement> {
  sidebar: ReactNode;
  sidebarOpen: boolean;
  onSidebarOpenChange(open: boolean): void;
  sidebarLabel: string;
  closeSidebarLabel: string;
  sidebarId?: string;
  contentId?: string;
  header?: ReactNode;
  /** A module-root catalog is primary content, not a dismissible history layer. */
  sidebarPresentation?: 'drawer' | 'catalog';
}

/** Retained desktop sidebar/mobile drawer. Opening, folding and resizing never remount either subtree. */
export function ChatWorkspace({
  sidebar,
  sidebarOpen,
  onSidebarOpenChange,
  sidebarLabel,
  closeSidebarLabel,
  sidebarId,
  contentId,
  header,
  sidebarPresentation = 'drawer',
  children,
  className,
  onKeyDown,
  ...props
}: ChatWorkspaceProps) {
  const id = useId(),
    panel = useRef<HTMLElement>(null),
    backdrop = useRef<HTMLButtonElement>(null),
    backdropPressed = useRef(false),
    content = useRef<HTMLDivElement>(null),
    root = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const close = useRef(onSidebarOpenChange);
  close.current = onSidebarOpenChange;
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  );
  const modal = mobile && sidebarOpen && sidebarPresentation === 'drawer';
  useDismissalLayer(modal, () => close.current(false));
  const drag = useDismissDrag({
    enabled: modal,
    axis: 'x',
    direction: -1,
    surface: root,
    extent: panel,
    attribute: 'data-drawer-drag',
    onDismiss: () => close.current(false),
    offsetProperty: '--desktop-chat-drag-offset',
    progressProperty: '--desktop-chat-drag-progress',
  });
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)'),
      update = () => setMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useLayoutEffect(() => {
    const panelElement = panel.current,
      contentElement = content.current;
    if (panelElement) panelElement.inert = !sidebarOpen;
    if (contentElement) contentElement.inert = mobile && sidebarOpen;
    if (!modal) return;
    restoreFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelElement?.focus({ preventScroll: true });
    return () => {
      if (contentElement) contentElement.inert = false;
      const target = restoreFocus.current;
      // Cleanup precedes React removing aria-hidden from retained content.
      // Restore only after that commit; never focus a hidden/new modal surface.
      queueMicrotask(() => {
        if (target?.isConnected && !target.closest('[inert],[aria-hidden="true"]'))
          target.focus({ preventScroll: true });
      });
    };
  }, [mobile, sidebarOpen, modal]);
  return (
    <DismissalBoundary>
      <div
        {...props}
        ref={root}
        className={classes('desktop-chat-workspace', className)}
        data-sidebar-open={sidebarOpen}
        data-sidebar-presentation={sidebarPresentation}
        onPointerDownCapture={(event) => {
          // A touch can open a portalled menu on pointerdown. Its synthesized
          // click may hit the backdrop after the menu changes hit testing.
          // Dismiss only a gesture that actually began on this backdrop.
          backdropPressed.current = event.target === backdrop.current;
          props.onPointerDownCapture?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            !modal ||
            event.defaultPrevented ||
            event.nativeEvent.isComposing ||
            event.nativeEvent.keyCode === 229 ||
            !panel.current?.contains(event.target as Node)
          )
            return;
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            close.current(false);
          }
          if (event.key !== 'Tab') return;
          const targets = [
            ...panel.current.querySelectorAll<HTMLElement>(
              'button:not(:disabled),input:not(:disabled),a[href],[tabindex="0"]',
            ),
          ].filter((element) => element.getClientRects().length && !element.closest('[inert],[hidden]'));
          const first = targets[0],
            last = targets.at(-1);
          if (!first) {
            event.preventDefault();
            panel.current.focus();
          } else if (
            event.shiftKey &&
            (document.activeElement === first || document.activeElement === panel.current)
          ) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
      >
        <button
          ref={backdrop}
          type="button"
          className="desktop-chat-workspace__backdrop"
          tabIndex={-1}
          aria-label={closeSidebarLabel}
          aria-hidden={!modal}
          onPointerCancel={() => {
            backdropPressed.current = false;
          }}
          onClick={(event) => {
            const pressed = backdropPressed.current;
            backdropPressed.current = false;
            if (pressed || event.detail === 0) onSidebarOpenChange(false);
          }}
        />
        <aside
          ref={panel}
          id={sidebarId ?? id}
          className="desktop-chat-workspace__sidebar"
          tabIndex={-1}
          role={modal ? 'dialog' : undefined}
          aria-modal={modal || undefined}
          aria-label={sidebarLabel}
          aria-hidden={!sidebarOpen}
          {...drag}
        >
          {sidebar}
          {modal ? (
            <div className="desktop-chat-workspace__drag-edge" data-drawer-drag aria-hidden="true" />
          ) : null}
        </aside>
        <div
          ref={content}
          id={contentId}
          className="desktop-chat-workspace__content"
          aria-hidden={(mobile && sidebarOpen) || undefined}
        >
          {header}
          {children}
        </div>
      </div>
    </DismissalBoundary>
  );
}

export interface NavigationDrawerProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onOpenChange(open: boolean): void;
  label: string;
  closeLabel: string;
  navigation: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
}

/** Phone navigation sharing ChatWorkspace's retained DOM, focus, drag and history contract.
 * Desktop hosts provide their own persistent navigation beside this container. */
export function NavigationDrawer({
  open,
  onOpenChange,
  label,
  closeLabel,
  navigation,
  footer,
  children,
  className,
  ...props
}: NavigationDrawerProps) {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return (
    <ChatWorkspace
      {...props}
      className={classes('desktop-navigation-drawer', className)}
      sidebarOpen={mobile && open}
      onSidebarOpenChange={onOpenChange}
      sidebarLabel={label}
      closeSidebarLabel={closeLabel}
      sidebar={
        <>
          <div className="desktop-navigation-drawer__body">{navigation}</div>
          {footer ? <div className="desktop-navigation-drawer__footer">{footer}</div> : null}
        </>
      }
    >
      {children}
    </ChatWorkspace>
  );
}

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
export { AIResponse, AIResponseProvider, type AIResponseProps } from './ai-response';

/** Shared input boundary for Hosts with their own attachment, draft and keyboard lifecycle. */
export interface ComposerSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  /** Chat places attachment, draft and action in one row, with optional settings below. */
  layout?: 'work' | 'chat';
  /** Structured work input. Omit to retain the inline children composition. */
  input?: ReactNode;
  attachments?: ReactNode;
  leading?: ReactNode;
  controls?: ReactNode;
  action?: ReactNode;
}
export const ComposerSurface = forwardRef<HTMLDivElement, ComposerSurfaceProps>(function ComposerSurface(
  { className, layout = 'work', input, attachments, leading, controls, action, children, ...props },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={classes(
        'desktop-composer desktop-composer-surface',
        !!input && `desktop-composer-surface--${layout}`,
        className,
      )}
    >
      {input ? (
        <>
          {attachments ? <div className="desktop-composer-surface-attachments">{attachments}</div> : null}
          {layout === 'chat' ? (
            <>
              <div className="desktop-composer-surface-chat-row">
                {leading}
                <div className="desktop-composer-surface-editor">{input}</div>
                {action}
              </div>
              {controls ? <div className="desktop-composer-surface-controls">{controls}</div> : null}
            </>
          ) : (
            <>
              <div className="desktop-composer-surface-editor">{input}</div>
              <div className="desktop-composer-surface-toolbar">
                {leading}
                <div className="desktop-composer-surface-controls">{controls}</div>
                {action}
              </div>
            </>
          )}
          {children}
        </>
      ) : (
        children
      )}
    </div>
  );
});

/** Relative scroll viewport; floating commands stay outside ScrollEdgeFade. */
export const ConversationViewport = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ConversationViewport({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={classes('desktop-conversation-viewport', className)} />;
  },
);

/** Hosts own follow-bottom state and scrolling; the kit owns the floating action. */
export function ScrollToBottomButton({
  visible = true,
  label,
  actionId = 'conversation.bottom',
  ...props
}: Omit<ButtonProps, 'children' | 'icon' | 'iconOnly'> & { visible?: boolean; label?: string }) {
  const translate = useTranslation();
  if (!visible) return null;
  return (
    <Button
      {...props}
      actionId={actionId}
      className={classes('desktop-scroll-to-bottom', props.className)}
      aria-label={label ?? translate('Scroll to bottom')}
      iconOnly
      icon={<ScrollToBottomIcon size={18} />}
    />
  );
}

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
