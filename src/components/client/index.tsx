import { CaretRight, Check } from '@phosphor-icons/react';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { cloneElement, type HTMLAttributes, type ReactElement, type ReactNode, useId, useState } from 'react';
import { InternalScrollArea } from '../lists';
import { Button, type ButtonProps } from '../actions';
import { classes } from '../classes';
import { ClientProfileContext, createDesktopPortal } from '../../scoped-surface';
const MenuPortal = createDesktopPortal(Menu.Portal);

export interface DesktopMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  hint?: string;
  disabled?: boolean;
  separator?: boolean;
  checked?: boolean;
  heading?: boolean;
  onSelect?: () => void;
  children?: DesktopMenuItem[];
}
function MenuItems({ items }: { items: DesktopMenuItem[] }) {
  return (
    <>
      {items.map((item) => (
        <span className="client-menu-entry" key={item.id}>
          {item.heading ? <Menu.Label className="client-menu-heading">{item.label}</Menu.Label> : null}
          {item.separator ? <Menu.Separator className="client-menu-separator" /> : null}
          {item.heading ? null : item.children ? (
            <Menu.Sub>
              <Menu.SubTrigger
                aria-label={item.label}
                className="desktop-menu-item client-menu-item"
                disabled={item.disabled}
                data-desktop-action={item.id}
              >
                {item.icon}
                <span>{item.label}</span>
                <CaretRight size={16} />
              </Menu.SubTrigger>
              <MenuPortal>
                <Menu.SubContent className="desktop-menu client-menu" sideOffset={6} collisionPadding={8}>
                  <MenuItems items={item.children} />
                </Menu.SubContent>
              </MenuPortal>
            </Menu.Sub>
          ) : (
            <Menu.Item
              aria-label={item.label}
              aria-keyshortcuts={item.shortcut?.replaceAll('Ctrl', 'Control').replaceAll('Win', 'Meta')}
              className="desktop-menu-item client-menu-item"
              disabled={item.disabled || !item.onSelect}
              onSelect={item.onSelect}
              data-desktop-action={item.id}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.checked ? <Check size={15} /> : null}
              {item.hint ? <small>{item.hint}</small> : null}
              {item.shortcut ? <kbd>{item.shortcut}</kbd> : null}
            </Menu.Item>
          )}
        </span>
      ))}
    </>
  );
}
/** A host-owned action tree; no native commands or external transmission are inferred. */
export function DesktopMenu({
  trigger,
  items,
  heading,
  side = 'bottom',
  align = 'start',
  className = '',
  onOpenChange,
}: {
  trigger: ReactElement;
  items: DesktopMenuItem[];
  heading?: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Menu.Root onOpenChange={onOpenChange}>
      <Menu.Trigger asChild>
        {cloneElement(trigger, {
          'data-desktop-action':
            trigger.props['data-desktop-action'] || `${items[0]?.id || 'client.menu'}.open`,
        })}
      </Menu.Trigger>
      <MenuPortal>
        <Menu.Content
          className={`desktop-menu client-menu ${className}`}
          side={side}
          align={align}
          sideOffset={5}
          collisionPadding={8}
          data-desktop-surface="client.menu"
        >
          {heading ? <Menu.Label className="client-menu-heading">{heading}</Menu.Label> : null}
          <MenuItems items={items} />
        </Menu.Content>
      </MenuPortal>
    </Menu.Root>
  );
}
/** Explicitly opt into the measured Windows reference profile without changing embedded Tool typography. */
export function DesktopClientSurface({ children }: { children: ReactNode }) {
  return (
    <ClientProfileContext.Provider value={true}>
      <div className="desktop-client">{children}</div>
    </ClientProfileContext.Provider>
  );
}
export function ClientSidebar({
  header,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { header?: ReactNode; children: ReactNode }) {
  return (
    <div {...props} className={classes('client-sidebar', className)}>
      {header ? <header>{header}</header> : null}
      <InternalScrollArea className="client-sidebar-scroll">{children}</InternalScrollArea>
    </div>
  );
}

/** A retained navigation target with a readable label and an independent trailing count. */
export function ClientSidebarItem({
  label,
  count,
  selected = false,
  className,
  icon,
  ...props
}: Omit<ButtonProps, 'children' | 'variant' | 'iconOnly'> & {
  label: ReactNode;
  count?: number;
  selected?: boolean;
}) {
  return (
    <Button
      {...props}
      icon={icon || <span aria-hidden="true" />}
      variant="ghost"
      className={classes('client-sidebar-link', className)}
      aria-current={selected ? 'page' : undefined}
    >
      <span className="client-sidebar-label">{label}</span>
      {count !== undefined && <span className="client-sidebar-count">{count}</span>}
    </Button>
  );
}
export function SidebarSection({
  title,
  actions,
  children,
  open = true,
  onOpenChange,
  actionId,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  actionId?: string;
}) {
  const contentId = useId();
  return (
    <section className="client-sidebar-section">
      <header>
        <h2>
          {onOpenChange ? (
            <button
              type="button"
              className="client-section-toggle"
              aria-expanded={open}
              aria-controls={contentId}
              data-desktop-action={actionId}
              onClick={() => onOpenChange(!open)}
            >
              {title}
              <CaretRight size={12} aria-hidden="true" />
            </button>
          ) : (
            title
          )}
        </h2>
        <div>{actions}</div>
      </header>
      {onOpenChange ? (
        <div id={contentId} hidden={!open}>
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
export function SettingsGroup({
  title,
  children,
  className,
  ...props
}: Omit<import('react').HTMLAttributes<HTMLElement>, 'title'> & { title?: ReactNode; children: ReactNode }) {
  return (
    <section className={classes('client-settings-group', className)} {...props}>
      {title ? <h2>{title}</h2> : null}
      <div className="client-settings-card">{children}</div>
    </section>
  );
}
export function SettingsField({
  label,
  description,
  children,
}: {
  label: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="client-settings-field">
      <div>
        <h3>{label}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      <div>{children}</div>
    </div>
  );
}
export function SettingsDisclosure({
  title,
  children,
  defaultOpen = false,
  actionId = 'settings.advanced.toggle',
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  actionId?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="client-settings-disclosure">
      <button
        type="button"
        aria-expanded={open}
        data-desktop-action={actionId}
        onClick={() => setOpen(!open)}
      >
        {title}
        <CaretRight size={14} />
      </button>
      <div hidden={!open}>{children}</div>
    </section>
  );
}
