import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { useContext, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { protectModalEscape } from '../../runtime/modal-keyboard';
import { AttachmentIcon, ChevronDownIcon, CloseIcon } from '../../icons';
import { useTranslation } from '../../strings';
import { ToolVisibilityContext } from '../../surface-visibility';
import { Button, IconButton } from '../actions';
import { classes } from '../classes';
import { InternalScrollArea } from '../lists';
import { createDesktopPortal } from '../../scoped-surface';
const MenuPortal = createDesktopPortal(DropdownMenuPrimitive.Portal);
const DialogPortal = createDesktopPortal(DialogPrimitive.Portal);

/** Non-interactive file drop feedback; the Host owns drag events and attachment scope. */
export function DropOverlay({ label, surfaceId, variant = 'overlay', active = false }: { label: string; surfaceId?: string; variant?: 'overlay' | 'boundary'; active?: boolean }) {
  return (
    <div className={`desktop-drop-overlay desktop-drop-overlay--${variant}`} role="status" aria-label={label} data-active={active || undefined} data-desktop-surface={surfaceId}>
      {variant === 'boundary' ? <svg className="desktop-drop-boundary" aria-hidden="true" width="100%" height="100%"><rect x="2" y="2" width="100%" height="100%" rx="12" pathLength="100" /></svg> : <><AttachmentIcon size={20} aria-hidden="true" /><span>{label}</span></>}
    </div>
  );
}

/** Removable draft context; the attachment owns the complete action hit area. */
export function ContextAttachment({ label, icon, removeLabel, removeActionId, onRemove }: { label: string; icon?: ReactNode; removeLabel: string; removeActionId: string; onRemove(): void }) {
  return <span className="desktop-context-attachment">
    {icon && <span className="desktop-context-attachment__icon" aria-hidden="true">{icon}</span>}
    <span className="desktop-context-attachment__label" title={label}>{label}</span>
    <Button size="sm" variant="ghost" iconOnly icon={<CloseIcon size={14} />} aria-label={removeLabel} actionId={removeActionId} onClick={onRemove}>{removeLabel}</Button>
  </span>;
}
export function MenuButton({
  label,
  actionId,
  featureId,
  surfaceId,
  toolId,
  items,
  onOpenChange,
}: {
  label?: string;
  actionId: string;
  featureId?: string;
  surfaceId?: string;
  toolId?: string;
  /** Host observes user opening/dismissal without moving action ownership. */
  onOpenChange?(open: boolean): void;
  items: Array<{ label: ReactNode; actionId: string; disabled?: boolean; onSelect(): void }>;
}) {
  const translate = useTranslation();
  const visible = useContext(ToolVisibilityContext);
  const [open, setOpen] = useState(false);
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
        <Button size="sm" variant="ghost" actionId={actionId}>
          {label ?? translate('更多')}
          <ChevronDownIcon size={14} aria-hidden="true" />
        </Button>
      </DropdownMenuPrimitive.Trigger>
      <MenuPortal>
        <DropdownMenuPrimitive.Content
          className="desktop-menu"
          align="end"
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
  onClose,
  onCloseAutoFocus,
  ...props
}: Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> & {
  actionId?: string;
  className?: string;
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  onClose(): void;
  /** Let a successful navigation transfer focus instead of restoring its former trigger. */
  onCloseAutoFocus?(event: Event): void;
}) {
  const translate = useTranslation();
  const visible = useContext(ToolVisibilityContext);
  const previousFocus = useRef<HTMLElement | null>(null);
  const dialogContent = useRef<HTMLDivElement>(null);
  return (
    <DialogPrimitive.Root
      open={open && visible}
      onOpenChange={(next) => {
        if (!next && visible) onClose();
      }}
    >
      <DialogPortal>
        <DialogPrimitive.Overlay className="desktop-dialog-backdrop" />
        <DialogPrimitive.Content
          {...props}
          onEscapeKeyDown={protectModalEscape}
          ref={dialogContent}
          className={classes('desktop-dialog', className)}
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
            onCloseAutoFocus?.(event);
            if (event.defaultPrevented) return;
            event.preventDefault();
            if (
              visible &&
              previousFocus.current?.isConnected &&
              !previousFocus.current.closest('[aria-hidden="true"],[inert]')
            )
              previousFocus.current.focus();
          }}
        >
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
  );
}
