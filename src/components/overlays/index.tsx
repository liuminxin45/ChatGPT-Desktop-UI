import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { protectModalEscape } from '../../runtime/modal-keyboard';
import { AttachmentIcon, ChevronDownIcon, CloseIcon } from '../../icons';
import { useTranslation } from '../../strings';
import { ToolVisibilityContext } from '../../surface-visibility';
import { DismissalBoundary, useDismissalLayer } from '../../dismissal';
import { useDismissDrag } from '../../runtime/dismiss-drag';
import { Button, IconButton } from '../actions';
import { classes } from '../classes';
import { InternalScrollArea } from '../lists';
import { createDesktopPortal } from '../../scoped-surface';
const MenuPortal = createDesktopPortal(DropdownMenuPrimitive.Portal);
const DialogPortal = createDesktopPortal(DialogPrimitive.Portal);
export { ImageViewer } from './image-viewer';

/** Non-interactive file drop feedback; the Host owns drag events and attachment scope. */
export function DropOverlay({ label, surfaceId }: { label: string; surfaceId?: string }) {
  return (
    <div className="desktop-drop-overlay" role="status" data-desktop-surface={surfaceId}>
      <AttachmentIcon size={20} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
export function MenuButton({
  label,
  actionId,
  featureId,
  surfaceId,
  toolId,
  items,
  onOpenChange,
  icon,
  iconOnly = false,
  className,
  disabled,
  side = 'bottom',
}: {
  label?: string;
  actionId: string;
  featureId?: string;
  surfaceId?: string;
  toolId?: string;
  icon?: ReactNode;
  iconOnly?: boolean;
  className?: string;
  disabled?: boolean;
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Host observes user opening/dismissal without moving action ownership. */
  onOpenChange?(open: boolean): void;
  items: Array<{
    label: ReactNode;
    icon?: ReactNode;
    actionId: string;
    disabled?: boolean;
    onSelect(): void;
  }>;
}) {
  const translate = useTranslation();
  const visible = useContext(ToolVisibilityContext);
  const [open, setOpen] = useState(false);
  useDismissalLayer(open && visible, () => {
    setOpen(false);
    onOpenChange?.(false);
  });
  useEffect(() => {
    if (!visible) setOpen(false);
  }, [visible]);
  return (
    <DropdownMenuPrimitive.Root
      open={open && visible}
      onOpenChange={(next) => {
        setOpen(next);
        onOpenChange?.(next);
      }}
    >
      <DropdownMenuPrimitive.Trigger
        asChild
        onPointerDown={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
            event.currentTarget.click();
          }
        }}
        onClick={() => {
          setOpen(!open);
          onOpenChange?.(!open);
        }}
      >
        <Button
          size="sm"
          variant="ghost"
          actionId={actionId}
          icon={icon}
          iconOnly={iconOnly}
          aria-label={iconOnly ? label : undefined}
          className={className}
          disabled={disabled}
        >
          {!iconOnly && (label ?? translate('更多'))}
          {!iconOnly && <ChevronDownIcon size={14} aria-hidden="true" />}
        </Button>
      </DropdownMenuPrimitive.Trigger>
      <MenuPortal>
        <DropdownMenuPrimitive.Content
          className="desktop-menu"
          align="end"
          side={side}
          sideOffset={5}
          data-desktop-feature={featureId}
          data-desktop-surface={surfaceId}
          data-desktop-tool-surface={toolId}
          onCloseAutoFocus={(event) => {
            if (!visible) event.preventDefault();
          }}
        >
          {items.map((item) => (
            <DropdownMenuPrimitive.Item
              key={item.actionId}
              className="desktop-menu-item"
              data-desktop-action={item.actionId}
              disabled={item.disabled}
              onSelect={item.onSelect}
            >
              {item.icon && (
                <span className="desktop-menu-item-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              {item.label}
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </MenuPortal>
    </DropdownMenuPrimitive.Root>
  );
}

export function Dialog({
  actionId,
  className,
  open,
  title,
  description,
  children,
  footer,
  presentation = 'dialog',
  onClose,
}: {
  actionId?: string;
  className?: string;
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Sheets dock to the visual viewport on phones; desktop keeps the normal dialog. */
  presentation?: 'dialog' | 'sheet' | 'fullscreen';
  onClose(): void;
}) {
  const translate = useTranslation();
  const visible = useContext(ToolVisibilityContext);
  const previousFocus = useRef<HTMLElement | null>(null);
  const dialogContent = useRef<HTMLDivElement>(null);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const drag = useDismissDrag({
    enabled: open && visible && mobile && presentation === 'sheet',
    axis: 'y',
    direction: 1,
    surface: dialogContent,
    extent: dialogContent,
    attribute: 'data-desktop-sheet-handle',
    onDismiss: onClose,
    offsetProperty: '--desktop-sheet-drag-offset',
    progressProperty: '--desktop-sheet-drag-progress',
  });
  useDismissalLayer(open && visible, onClose);
  useLayoutEffect(() => {
    if (!open || !visible) return;
    const viewport = window.visualViewport;
    const update = () => {
      const element = dialogContent.current;
      if (!element) return;
      element.style.setProperty(
        '--desktop-dialog-viewport-height',
        `${viewport?.height ?? window.innerHeight}px`,
      );
      element.style.setProperty('--desktop-dialog-viewport-top', `${viewport?.offsetTop ?? 0}px`);
    };
    update();
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [open, visible]);
  return (
    <DismissalBoundary>
      <DialogPrimitive.Root
        open={open && visible}
        onOpenChange={(next) => {
          if (!next && visible) onClose();
        }}
      >
        <DialogPortal>
          <DialogPrimitive.Overlay className="desktop-dialog-backdrop" />
          <DialogPrimitive.Content
            onEscapeKeyDown={protectModalEscape}
            ref={dialogContent}
            className={classes('desktop-dialog', className)}
            data-presentation={presentation}
            {...drag}
            {...(!description ? { 'aria-describedby': undefined } : {})}
            onOpenAutoFocus={(event) => {
              previousFocus.current =
                document.activeElement instanceof HTMLElement ? document.activeElement : null;
              event.preventDefault();
              // Initial focus belongs to the editable body, not the close button's tooltip.
              const first = dialogContent.current?.querySelector<HTMLElement>(
                '.desktop-dialog__body :is(input,textarea,select,button,a[href],[tabindex]):not(:disabled):not([tabindex="-1"])',
              );
              (first ?? dialogContent.current)?.focus();
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (
                visible &&
                previousFocus.current?.isConnected &&
                !previousFocus.current.closest('[aria-hidden="true"],[inert]')
              )
                previousFocus.current.focus();
            }}
          >
            {presentation === 'sheet' ? (
              <div className="desktop-dialog__handle" data-desktop-sheet-handle="" aria-hidden="true">
                <span />
              </div>
            ) : null}
            <header>
              <div>
                <DialogPrimitive.Title asChild>
                  <h2>{title}</h2>
                </DialogPrimitive.Title>
                {description ? (
                  <DialogPrimitive.Description asChild>
                    <p>{description}</p>
                  </DialogPrimitive.Description>
                ) : null}
              </div>
              <DialogPrimitive.Close asChild>
                <IconButton
                  className="desktop-dialog__close"
                  actionId={actionId ? `${actionId}.close` : undefined}
                  aria-label={translate('关闭')}
                >
                  <CloseIcon size={15} aria-hidden="true" />
                </IconButton>
              </DialogPrimitive.Close>
            </header>
            <InternalScrollArea className="desktop-dialog__body">{children}</InternalScrollArea>
            {footer ? <footer>{footer}</footer> : null}
          </DialogPrimitive.Content>
        </DialogPortal>
      </DialogPrimitive.Root>
    </DismissalBoundary>
  );
}
