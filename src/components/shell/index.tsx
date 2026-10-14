import type { Icon } from '@phosphor-icons/react';
import { CaretRight, MagnifyingGlass, PushPin } from '@phosphor-icons/react';
import { classes } from '../classes';
import { ClientSidebarHeading } from '../client/sidebar-heading';
import { SidebarPanel, type SidebarResizeOptions } from './sidebar-panel';
export { SidebarPanel, type SidebarResizeOptions } from './sidebar-panel';
import * as Menu from '@radix-ui/react-dropdown-menu';
import {
  forwardRef,
  useEffect,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { NavigationRailItem } from './navigation-rail-item';
export { NavigationRailItem, type NavigationRailItemProps } from './navigation-rail-item';
export { WindowControls, type WindowControlsProps } from './window-controls';
import { ActionTooltip } from '../../action-tooltip';
import { IconButton, Input, InternalScrollArea } from '../../controls';
import {
  ArrowLeft,
  ArrowRight,
  DotsThree,
  Gear,
  Moon,
  SidebarSimple,
  SignOut,
  UserCircle,
} from '../../icons';
import { useDesktopTheme, type Theme } from '../../theme';

export function Tooltip({
  label,
  children,
  side = 'right',
}: {
  label: string;
  children: ReactNode;
  side?: 'right' | 'bottom' | 'top' | 'left';
}) {
  return (
    <ActionTooltip label={label} side={side}>
      {children as ReactElement}
    </ActionTooltip>
  );
}

export interface ShellAction {
  id: string;
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
}
export interface ShellMenu {
  id: string;
  label: string;
  actions: ShellAction[];
}
export interface TitleBarProps extends HTMLAttributes<HTMLElement> {
  /** Host action trees retain their commands, stable IDs and edit-target ownership. */
  actions?: ReactNode;
  onBack?: () => void;
  onForward?: () => void;
  onToggleSidebar?: () => void;
  canBack?: boolean;
  canForward?: boolean;
  canToggleSidebar?: boolean;
  menus?: ShellMenu[];
  trailing?: ReactNode;
  windowControls?: ReactNode;
  labels?: { back: string; forward: string; sidebar: string };
}
/** The host provides native/history actions. No native window IPC or persistence is owned here. */
export function TitleBar({
  onBack,
  onForward,
  onToggleSidebar,
  canBack = false,
  canForward = false,
  canToggleSidebar = false,
  menus = [],
  actions,
  trailing,
  windowControls,
  className,
  labels = { back: 'Back', forward: 'Forward', sidebar: 'Toggle page sidebar' },
  ...props
}: TitleBarProps) {
  return (
    <header
      data-desktop-feature="shell"
      data-desktop-surface="titlebar"
      {...props}
      className={classes('kit-titlebar', className)}
    >
      <div className="kit-titlebar__actions">
        {actions !== undefined ? (
          actions
        ) : (
          <>
            <Tooltip label={labels.back} side="bottom">
              <IconButton
                actionId="navigation.back"
                aria-label={labels.back}
                disabled={!canBack || !onBack}
                onClick={onBack}
              >
                <ArrowLeft size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip label={labels.forward} side="bottom">
              <IconButton
                actionId="navigation.forward"
                aria-label={labels.forward}
                disabled={!canForward || !onForward}
                onClick={onForward}
              >
                <ArrowRight size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip label={labels.sidebar} side="bottom">
              <IconButton
                actionId="navigation.sidebar.toggle"
                aria-label={labels.sidebar}
                disabled={!canToggleSidebar || !onToggleSidebar}
                onClick={onToggleSidebar}
              >
                <SidebarSimple size={16} />
              </IconButton>
            </Tooltip>
            {menus.map((menu) => (
              <Menu.Root key={menu.id}>
                <Menu.Trigger data-desktop-action={`menu.${menu.id}.open`} className="kit-titlebar__menu">
                  {menu.label}
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Content className="desktop-menu" sideOffset={5} collisionPadding={8}>
                    {menu.actions.map((action) => (
                      <Menu.Item
                        key={action.id}
                        className="desktop-menu-item"
                        data-desktop-action={action.id}
                        disabled={action.disabled || !action.onSelect}
                        onSelect={action.onSelect}
                      >
                        {action.label}
                      </Menu.Item>
                    ))}
                  </Menu.Content>
                </Menu.Portal>
              </Menu.Root>
            ))}
          </>
        )}
      </div>
      <div className="kit-titlebar__trailing">
        {trailing}
        {windowControls}
      </div>
    </header>
  );
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: Icon;
  unread?: boolean;
  disabled?: boolean;
}
export function NavigationRail({
  items = [],
  selected = '',
  onSelect,
  children,
  footer,
  pinnedIds,
  onPinnedChange,
  ariaLabel = 'Application navigation',
  unreadLabel = 'Unread',
  moreLabel = 'More',
  pinLabel = 'Pin',
  unpinLabel = 'Unpin',
  className,
  ...props
}: Omit<HTMLAttributes<HTMLElement>, 'onSelect'> & {
  items?: NavigationItem[];
  selected?: string;
  onSelect?(id: string): void;
  footer?: ReactNode;
  pinnedIds?: readonly string[];
  onPinnedChange?(ids: string[]): void;
  ariaLabel?: string;
  unreadLabel?: string;
  moreLabel?: string;
  pinLabel?: string;
  unpinLabel?: string;
}) {
  const shown = pinnedIds ? items.filter((item) => pinnedIds.includes(item.id)) : items;
  return (
    <nav
      className={classes('kit-rail', className)}
      aria-label={ariaLabel}
      data-desktop-feature="shell"
      data-desktop-surface="navigation"
      {...props}
    >
      <div className="kit-rail__items">
        {children}
        {shown.map((item) => {
          const ItemIcon = item.icon;
          const active = item.id === selected;
          return (
            <NavigationRailItem
              key={item.id}
              label={item.label}
              aria-label={item.unread ? `${item.label}, ${unreadLabel}` : item.label}
              selected={active}
              unread={item.unread}
              actionId={`navigation.${item.id}`}
              disabled={item.disabled || !onSelect}
              onClick={() => onSelect?.(item.id)}
            >
              <ItemIcon size={20} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
            </NavigationRailItem>
          );
        })}
        {pinnedIds ? (
          <Menu.Root>
            <Tooltip label={moreLabel}>
              <Menu.Trigger asChild>
                <button
                  type="button"
                  className="desktop-icon-control kit-rail__item"
                  aria-label={moreLabel}
                  aria-current={!pinnedIds.includes(selected) ? 'page' : undefined}
                  data-desktop-action="navigation.more.open"
                >
                  <DotsThree size={20} aria-hidden="true" />
                </button>
              </Menu.Trigger>
            </Tooltip>
            <Menu.Portal>
              <Menu.Content
                className="desktop-menu kit-navigation-menu"
                side="right"
                align="start"
                sideOffset={6}
                collisionPadding={8}
                data-desktop-feature="shell"
                data-desktop-surface="navigation.more"
              >
                {items.map((item) => {
                  const ItemIcon = item.icon;
                  const pinned = pinnedIds.includes(item.id);
                  return (
                    <div className="kit-navigation-menu__row" key={item.id}>
                      <Menu.Item
                        className="desktop-menu-item kit-navigation-menu__destination"
                        disabled={item.disabled}
                        data-desktop-action={`navigation.${item.id}`}
                        onSelect={() => onSelect?.(item.id)}
                      >
                        <ItemIcon
                          size={16}
                          weight={selected === item.id ? 'fill' : 'regular'}
                          aria-hidden="true"
                        />
                        {item.label}
                      </Menu.Item>
                      <Menu.CheckboxItem
                        className="desktop-menu-item kit-navigation-menu__pin"
                        checked={pinned}
                        disabled={!onPinnedChange || item.disabled}
                        aria-label={`${pinned ? unpinLabel : pinLabel} ${item.label}`}
                        data-desktop-action={`navigation.pin.${item.id}`}
                        onSelect={(event) => event.preventDefault()}
                        onCheckedChange={() =>
                          onPinnedChange?.(
                            pinned ? pinnedIds.filter((id) => id !== item.id) : [...pinnedIds, item.id],
                          )
                        }
                      >
                        <PushPin size={15} weight={pinned ? 'fill' : 'regular'} aria-hidden="true" />
                      </Menu.CheckboxItem>
                    </div>
                  );
                })}
              </Menu.Content>
            </Menu.Portal>
          </Menu.Root>
        ) : null}
      </div>
      <div className="kit-rail__footer">{footer}</div>
    </nav>
  );
}

export function AvatarMenu({
  name = 'Account',
  status,
  image,
  onAccount,
  onSettings,
  onExit,
  labels = {
    appearance: 'Appearance',
    account: 'Manage account',
    settings: 'Settings',
    exit: 'Exit application',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  },
}: {
  name?: string;
  status?: string;
  image?: string;
  onAccount?: () => void;
  onSettings?: () => void;
  onExit?: () => void;
  labels?: {
    appearance: string;
    account: string;
    settings: string;
    exit: string;
    system: string;
    light: string;
    dark: string;
  };
}) {
  const { theme, setTheme } = useDesktopTheme();
  const [failedImage, setFailedImage] = useState(false);
  useEffect(() => setFailedImage(false), [image]);
  return (
    <Menu.Root>
      <Menu.Trigger className="kit-avatar" aria-label={name} data-desktop-action="account.menu.open">
        {image && !failedImage ? (
          <img src={image} alt="" onError={() => setFailedImage(true)} />
        ) : (
          <UserCircle size={26} weight="regular" aria-hidden="true" />
        )}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          className="desktop-menu kit-account-menu"
          side="right"
          align="end"
          sideOffset={6}
          collisionPadding={8}
          data-desktop-feature="account"
          data-desktop-surface="account.menu"
        >
          <Menu.Label className="kit-account-menu__identity">
            {name}
            {status ? <small>{status}</small> : null}
          </Menu.Label>
          <Menu.Sub>
            <Menu.SubTrigger className="desktop-menu-item">
              <Moon size={16} />
              {labels.appearance}
              <CaretRight className="kit-menu-chevron" size={16} aria-hidden="true" />
            </Menu.SubTrigger>
            <Menu.Portal>
              <Menu.SubContent className="desktop-menu" sideOffset={6} collisionPadding={8}>
                <Menu.RadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
                  {(['system', 'light', 'dark'] as const).map((value) => (
                    <Menu.RadioItem
                      key={value}
                      className="desktop-menu-item"
                      value={value}
                      data-desktop-action={`appearance.${value}`}
                    >
                      {labels[value]}
                      <Menu.ItemIndicator className="kit-menu-chevron">✓</Menu.ItemIndicator>
                    </Menu.RadioItem>
                  ))}
                </Menu.RadioGroup>
              </Menu.SubContent>
            </Menu.Portal>
          </Menu.Sub>
          <Menu.Item
            className="desktop-menu-item"
            data-desktop-action="account.manage"
            disabled={!onAccount}
            onSelect={onAccount}
          >
            <UserCircle size={16} />
            {labels.account}
          </Menu.Item>
          <Menu.Item
            className="desktop-menu-item"
            data-desktop-action="settings.open"
            disabled={!onSettings}
            onSelect={onSettings}
          >
            <Gear size={16} />
            {labels.settings}
          </Menu.Item>
          <Menu.Item
            className="desktop-menu-item"
            data-desktop-action="application.exit"
            disabled={!onExit}
            onSelect={onExit}
          >
            <SignOut size={16} />
            {labels.exit}
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}

export function DesktopShell({
  titlebar,
  navigation,
  navigationVisible = true,
  sidebar,
  sidebarVisible = true,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  titlebar?: ReactNode;
  navigation: ReactNode;
  navigationVisible?: boolean;
  sidebar?: ReactNode;
  sidebarVisible?: boolean;
  children: ReactNode;
}) {
  return (
    <div {...props} className={classes('kit-shell', className)}>
      {titlebar}
      <div className="kit-shell__body">
        <div className="kit-shell__navigation" hidden={!navigationVisible}>
          {navigation}
        </div>
        <div className="kit-shell__workspace">
          <aside
            className="kit-sidebar"
            hidden={!sidebarVisible || !sidebar}
            {...(!sidebarVisible || !sidebar ? { inert: '' } : {})}
          >
            {sidebar}
          </aside>
          <main className="kit-shell__main">{children}</main>
        </div>
      </div>
    </div>
  );
}

export interface SettingsCategory {
  id: string;
  label: string;
  group?: string;
  keywords?: string[];
  icon?: Icon;
}
/** Shared settings shell; the Host owns category state and contextual sidebar visibility. */
export function SettingsLayout({
  sidebar,
  sidebarVisible = true,
  sidebarId,
  sidebarLabel,
  sidebarResize,
  children,
  className,
  ...props
}: import('react').HTMLAttributes<HTMLDivElement> & {
  sidebar: ReactNode;
  sidebarVisible?: boolean;
  sidebarId?: string;
  sidebarLabel?: string;
  sidebarResize?: SidebarResizeOptions;
}) {
  return (
    <div className={classes('kit-settings-layout', className)} {...props}>
      <SidebarPanel id={sidebarId} aria-label={sidebarLabel} hidden={!sidebarVisible} resize={sidebarResize}>
        {sidebar}
      </SidebarPanel>
      {children}
    </div>
  );
}
export function SettingsNavigation({
  categories,
  selected,
  onSelect,
  title = 'Settings',
  searchLabel = 'Search settings',
  noMatchesLabel = 'No matching categories',
  actionId = 'settings.category',
}: {
  categories: SettingsCategory[];
  selected: string;
  onSelect(id: string): void;
  title?: string;
  searchLabel?: string;
  noMatchesLabel?: string;
  actionId?: string;
}) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLocaleLowerCase();
  const filtered = categories.filter((category) =>
    [category.label, category.group || '', ...(category.keywords || [])].some((text) =>
      text.toLocaleLowerCase().includes(query),
    ),
  );
  return (
    <div className="kit-settings-nav">
      <ClientSidebarHeading>{title}</ClientSidebarHeading>
      <div className="kit-settings-search">
        <MagnifyingGlass size={16} />
        <Input
          data-desktop-action={`${actionId}.search`}
          aria-label={searchLabel}
          placeholder={searchLabel}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <InternalScrollArea className="kit-settings-nav__list">
        <nav aria-label={title}>
          {filtered.map((category, index) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.id}>
                {category.group && category.group !== filtered[index - 1]?.group ? (
                  <h3 className="kit-settings-group">{category.group}</h3>
                ) : null}
                <button
                  type="button"
                  className="kit-category"
                  data-desktop-action={`${actionId}.${category.id}`}
                  aria-current={category.id === selected ? 'page' : undefined}
                  onClick={() => onSelect(category.id)}
                >
                  {CategoryIcon ? <CategoryIcon size={16} /> : null}
                  {category.label}
                </button>
              </div>
            );
          })}
        </nav>
        {!filtered.length ? (
          <p className="kit-muted" role="status">
            {noMatchesLabel}
          </p>
        ) : null}
      </InternalScrollArea>
    </div>
  );
}

export const SettingsPage = forwardRef<
  HTMLDivElement,
  Omit<import('react').HTMLAttributes<HTMLDivElement>, 'title'> & { title: ReactNode; showTitle?: boolean }
>(function SettingsPage({ title, showTitle = true, children, className, ...props }, ref) {
  return (
    <InternalScrollArea ref={ref} className={classes('kit-settings-scroll', className)} {...props}>
      <div className="kit-settings-content">
        {showTitle ? <h1>{title}</h1> : null}
        {children}
      </div>
    </InternalScrollArea>
  );
});
export function SettingsSection({
  title,
  children,
  className,
  ...props
}: Omit<import('react').HTMLAttributes<HTMLElement>, 'title'> & { title?: ReactNode; children: ReactNode }) {
  return (
    <section className={classes('kit-settings-section', className)} {...props}>
      {title ? <h2>{title}</h2> : null}
      <div className="kit-settings-section__rows">{children}</div>
    </section>
  );
}
export function SettingRow({
  label,
  description,
  children,
}: {
  label: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="kit-setting-row">
      <div>
        <span>{label}</span>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="kit-setting-row__control">{children}</div>
    </div>
  );
}
