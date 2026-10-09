import { type ReactNode, type ReactElement, useState, useId, cloneElement } from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { CaretRight, Check } from "@phosphor-icons/react";
import { InternalScrollArea } from "./controls";
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
          {item.heading ? (
            <Menu.Label className="client-menu-heading">
              {item.label}
            </Menu.Label>
          ) : null}
          {item.separator ? (
            <Menu.Separator className="client-menu-separator" />
          ) : null}
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
              <Menu.Portal>
                <Menu.SubContent
                  className="desktop-menu client-menu"
                  sideOffset={6}
                  collisionPadding={8}
                >
                  <MenuItems items={item.children} />
                </Menu.SubContent>
              </Menu.Portal>
            </Menu.Sub>
          ) : (
            <Menu.Item
              aria-label={item.label}
              aria-keyshortcuts={item.shortcut
                ?.replaceAll("Ctrl", "Control")
                .replaceAll("Win", "Meta")}
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
  side = "bottom",
  align = "start",
  className = "",
  onOpenChange,
}: {
  trigger: ReactElement;
  items: DesktopMenuItem[];
  heading?: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  className?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Menu.Root onOpenChange={onOpenChange}>
      <Menu.Trigger asChild>{cloneElement(trigger, {'data-desktop-action': trigger.props['data-desktop-action'] || `${items[0]?.id || 'client.menu'}.open`})}</Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          className={`desktop-menu client-menu ${className}`}
          side={side}
          align={align}
          sideOffset={5}
          collisionPadding={8}
          data-desktop-surface="client.menu"
        >
          {heading ? (
            <Menu.Label className="client-menu-heading">{heading}</Menu.Label>
          ) : null}
          <MenuItems items={items} />
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
/** Explicitly opt into the measured Windows reference profile without changing embedded Tool typography. */
export function DesktopClientSurface({ children }: { children: ReactNode }) {
  return <div className="desktop-client">{children}</div>;
}
export function ClientSidebar({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="client-sidebar">
      <header>{header}</header>
      <InternalScrollArea className="client-sidebar-scroll">
        {children}
      </InternalScrollArea>
    </div>
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
              {title}<CaretRight size={12} aria-hidden="true" />
            </button>
          ) : title}
        </h2>
        <div>{actions}</div>
      </header>
      {onOpenChange ? (
        <div id={contentId} hidden={!open}>{children}</div>
      ) : children}
    </section>
  );
}
export function SettingsGroup({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="client-settings-group">
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
  label: string;
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
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="client-settings-disclosure">
      <button
        type="button"
        aria-expanded={open}
        data-desktop-action="settings.advanced.toggle"
        onClick={() => setOpen(!open)}
      >
        {title}
        <CaretRight size={14} />
      </button>
      <div hidden={!open}>{children}</div>
    </section>
  );
}
