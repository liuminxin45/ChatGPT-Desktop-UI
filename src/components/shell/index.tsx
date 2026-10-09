import type { Icon } from '@phosphor-icons/react';
import { CaretRight, MagnifyingGlass, PushPin } from '@phosphor-icons/react';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
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
export interface TitleBarProps {
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
  trailing,
  windowControls,
  labels = { back: 'Back', forward: 'Forward', sidebar: 'Toggle page sidebar' },
}: TitleBarProps) {
  return (
    <header className="kit-titlebar" data-desktop-feature="shell" data-desktop-surface="titlebar">
      <div className="kit-titlebar__actions">
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
  items,
  selected,
  onSelect,
  footer,
  pinnedIds,
  onPinnedChange,
  ariaLabel = 'Application navigation',
  unreadLabel = 'Unread',
  moreLabel = 'More',
  pinLabel = 'Pin',
  unpinLabel = 'Unpin',
}: {
  items: NavigationItem[];
  selected: string;
  onSelect(id: string): void;
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
      className="kit-rail"
      aria-label={ariaLabel}
      data-desktop-feature="shell"
      data-desktop-surface="navigation"
    >
      <div className="kit-rail__items">
        {shown.map((item) => {
          const ItemIcon = item.icon;
          const active = item.id === selected;
          return (
            <Tooltip label={item.label} key={item.id}>
              <IconButton
                className="kit-rail__item"
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                actionId={`navigation.${item.id}`}
                disabled={item.disabled}
                onClick={() => onSelect(item.id)}
              >
                <ItemIcon size={20} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
                {item.unread ? <span className="kit-unread" aria-label={unreadLabel} /> : null}
              </IconButton>
            </Tooltip>
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
                        onSelect={() => onSelect(item.id)}
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
}: {
  titlebar?: ReactNode;
  navigation: ReactNode;
  navigationVisible?: boolean;
  sidebar?: ReactNode;
  sidebarVisible?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="kit-shell">
      {titlebar}
      <div className="kit-shell__body">
        <div className="kit-shell__navigation" hidden={!navigationVisible}>
          {navigation}
        </div>
        <aside className="kit-sidebar" hidden={!sidebarVisible || !sidebar}>
          {sidebar}
        </aside>
        <main className="kit-shell__main">{children}</main>
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
export function SettingsNavigation({
  categories,
  selected,
  onSelect,
  title = 'Settings',
  searchLabel = 'Search settings',
  noMatchesLabel = 'No matching categories',
}: {
  categories: SettingsCategory[];
  selected: string;
  onSelect(id: string): void;
  title?: string;
  searchLabel?: string;
  noMatchesLabel?: string;
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
      <h2>{title}</h2>
      <div className="kit-settings-search">
        <MagnifyingGlass size={16} />
        <Input
          data-desktop-action="settings.category.search"
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
                  data-desktop-action={`settings.category.${category.id}`}
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

export function SettingsPage({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <InternalScrollArea className="kit-settings-scroll">
      <div className="kit-settings-content">
        <h1>{title}</h1>
        {children}
      </div>
    </InternalScrollArea>
  );
}
export function SettingsSection({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="kit-settings-section">
      <h2>{title}</h2>
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
