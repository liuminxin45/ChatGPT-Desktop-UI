import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { useContext, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDownIcon, CloseIcon } from '../../icons';
import { useTranslation } from '../../strings';
import { ToolVisibilityContext } from '../../surface-visibility';
import { Button, IconButton } from '../actions';
import { classes } from '../classes';
import { InternalScrollArea } from '../lists';
export function MenuButton({
  label,
  actionId,
  featureId,
  surfaceId,
  toolId,
  items,
}: {
  label?: string;
  actionId: string;
  featureId?: string;
  surfaceId?: string;
  toolId?: string;
  items: Array<{ label: ReactNode; actionId: string; disabled?: boolean; onSelect(): void }>;
}) {
  const translate = useTranslation();
  const visible = useContext(ToolVisibilityContext);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!visible) setOpen(false);
  }, [visible]);
  return (
    <DropdownMenuPrimitive.Root open={open && visible} onOpenChange={setOpen}>
      <DropdownMenuPrimitive.Trigger
        asChild
        onPointerDown={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
            event.currentTarget.click();
          }
        }}
        onClick={() => setOpen((value) => !value)}
      >
        <Button size="sm" variant="ghost" actionId={actionId}>
          {label ?? translate('更多')}
          <ChevronDownIcon size={14} aria-hidden="true" />
        </Button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
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
      </DropdownMenuPrimitive.Portal>
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
}: {
  actionId?: string;
  className?: string;
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  onClose(): void;
}) {
  const translate = useTranslation();
  const visible = useContext(ToolVisibilityContext);
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    if (!open || !visible) return undefined;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusable = () => [
      ...(dialog?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
      ) || []),
    ];
    (focusable()[0] || dialog)?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) {
        event.preventDefault();
        dialog?.focus();
        return;
      }
      const first = items[0];
      const last = items.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (
        previouslyFocused &&
        !previouslyFocused.closest('[aria-hidden="true"]') &&
        (document.activeElement === document.body || dialog?.contains(document.activeElement))
      )
        previouslyFocused.focus();
    };
  }, [open, visible]);
  if (!open) return null;
  return (
    <div
      className="desktop-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className={classes('desktop-dialog', className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header>
          <div>
            <h2 id={titleId}>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <IconButton
            actionId={actionId ? `${actionId}.close` : undefined}
            aria-label={translate('关闭')}
            onClick={onClose}
          >
            <CloseIcon size={15} aria-hidden="true" />
          </IconButton>
        </header>
        <InternalScrollArea className="desktop-dialog__body">{children}</InternalScrollArea>
        {footer ? <footer>{footer}</footer> : null}
      </section>
    </div>
  );
}
