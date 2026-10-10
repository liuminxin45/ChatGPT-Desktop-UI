import { Toaster as SonnerToaster, toast } from 'sonner';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { CloseIcon } from '../../icons';
import { useTranslation } from '../../strings';
import { Button } from '../actions';

export { toast };

/** Host-owned transient result; state, dismissal timing and commands stay in the Host. */
export function ToastNotice({
  title,
  description,
  tone = 'info',
  onClose,
  closeLabel,
  actionId,
}: {
  title: ReactNode;
  description?: ReactNode;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  onClose(): void;
  closeLabel: string;
  actionId: string;
}) {
  return (
    <div className="desktop-toast-placement">
      <div
        className="desktop-toast desktop-toast-notice"
        data-tone={tone}
        role={tone === 'danger' ? 'alert' : 'status'}
      >
        <div className="desktop-toast-content">
          <div className="desktop-toast-title">{title}</div>
          {description ? <div className="desktop-toast-description">{description}</div> : null}
        </div>
        <Button actionId={actionId} iconOnly icon={<CloseIcon />} aria-label={closeLabel} onClick={onClose} />
      </div>
    </div>
  );
}

/** Single shared notification appearance; Sonner only owns queueing and dismissal behavior. */
export function Toaster({
  position = 'bottom-left',
  duration = 4000,
  label,
  actionId = 'notification',
  surfaceId = 'notifications',
}: {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  duration?: number;
  label?: string;
  actionId?: string;
  surfaceId?: string;
}) {
  const translate = useTranslation();
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const container = root.current;
    if (!container) return;
    // Explicit queue command roles; never infer an action from message or label text.
    const identify = () => {
      for (const [selector, command] of [
        ['[data-close-button]', 'close'],
        ['[data-action][data-button]', 'action'],
        ['[data-cancel][data-button]', 'cancel'],
      ])
        container.querySelectorAll<HTMLElement>(selector).forEach((element) => {
          element.dataset.desktopAction = `${actionId}.${command}`;
        });
    };
    identify();
    const observer = new MutationObserver(identify);
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [actionId]);
  return (
    <div ref={root} data-desktop-surface={surfaceId}>
      <SonnerToaster
        position={position}
        duration={duration}
        containerAriaLabel={label ?? translate('通知')}
        closeButton
        icons={{ close: <CloseIcon />, success: null, error: null, warning: null, info: null }}
        toastOptions={{
          unstyled: true,
          closeButtonAriaLabel: translate('关闭'),
          classNames: {
            toast: 'desktop-toast',
            title: 'desktop-toast-title',
            description: 'desktop-toast-description',
            actionButton: 'desktop-toast-action',
            cancelButton: 'desktop-toast-cancel',
            closeButton: 'desktop-toast-close',
          },
        }}
      />
    </div>
  );
}
