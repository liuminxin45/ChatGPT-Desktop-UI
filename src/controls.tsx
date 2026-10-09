import { t as phdT, useTranslation, currentLocale } from './strings';
import { createContext, useContext, forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ButtonHTMLAttributes, type CSSProperties , type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { useVirtualizer } from '@tanstack/react-virtual';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, CloseIcon } from './icons';
import { nextEnabledTabIndex } from './tab-navigation';

export { nextEnabledTabIndex } from './tab-navigation';

/** Shared overlays inherit the native Surface visibility without owning its lifecycle. */
export const ToolVisibilityContext = createContext(true);

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export const internalScrollAreaClassName = 'phd-internal-scroll';

export const InternalScrollArea = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function InternalScrollArea({ className, ...props }, ref) {
  const phdT = useTranslation();
    return <div ref={ref} className={classes(internalScrollAreaClassName, className)} {...props} />;
  },
);

export interface VirtualListProps<T> {
  items: readonly T[];
  getItemKey(item: T, index: number): string | number;
  renderItem(item: T, index: number): ReactNode;
  estimateSize: number | ((item: T, index: number) => number);
  ariaLabel: string;
  resetKey?: unknown;
  overscan?: number;
  className?: string;
  contentClassName?: string;
  itemClassName?: string | ((item: T, index: number) => string | undefined);
  role?: 'list' | 'listbox';
  style?: CSSProperties;
}

export function VirtualList<T>({ items, getItemKey, renderItem, estimateSize, ariaLabel, resetKey, overscan = 8, className, contentClassName, itemClassName, role = 'list', style }: VirtualListProps<T>) {
  'use no memo';
  const phdT = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => {
      const item = items[index];
      return item && typeof estimateSize === 'function' ? estimateSize(item, index) : typeof estimateSize === 'number' ? estimateSize : 48;
    },
    overscan,
    getItemKey: (index) => items[index] ? getItemKey(items[index], index) : index,
  });
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [resetKey]);
  useEffect(() => {
    const element = scrollRef.current;
    const restore = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; offset: number; top: number; handled: boolean }>).detail;
      if (!items.length) return;
      const index = items.findIndex((item, i) => String(getItemKey(item, i)) === detail.key);
      const offset = index >= 0 ? virtualizer.getOffsetForIndex(index, 'start')?.[0] : detail.top;
      if (offset === undefined) return;
      virtualizer.scrollToOffset(Math.max(0, offset + (index >= 0 ? detail.offset : 0)));
      detail.handled = true;
    };
    element?.addEventListener('phd:restore-list-anchor', restore);
    return () => element?.removeEventListener('phd:restore-list-anchor', restore);
  }, [items, getItemKey, virtualizer]);
  return (
    <InternalScrollArea ref={scrollRef} role={role} aria-label={ariaLabel} className={classes('phd-virtual-list', className)} style={style}>
      <div className={classes('phd-virtual-list__content', contentClassName)} style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((row) => {
          const item = items[row.index];
          if (!item) return null;
          return <div key={row.key} ref={virtualizer.measureElement} data-index={row.index} data-phd-item-key={String(getItemKey(item, row.index))} role={role === 'listbox' ? 'option' : 'listitem'} className={classes('phd-virtual-list__item', typeof itemClassName === 'function' ? itemClassName(item, row.index) : itemClassName)} style={{ transform: `translateY(${row.start}px)` }}>{renderItem(item, row.index)}</div>;
        })}
      </div>
    </InternalScrollArea>
  );
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  actionId?: string;
  confirmOnEnter?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant = 'secondary', size = 'md', type = 'button', actionId, confirmOnEnter, title: _title, ...props }, ref) {
  const phdT = useTranslation();
    return <button ref={ref} type={type} data-phd-action={actionId} data-phd-enter-confirm={confirmOnEnter || undefined} className={classes('phd-button', `phd-button--${variant}`, `phd-button--${size}`, className)} {...props} />;
  },
);

export function IconButton({ className, type = 'button', actionId, title: _title, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { actionId?: string }) {
  const phdT = useTranslation();
  return <button type={type} data-phd-action={actionId} className={classes('phd-icon-control', className)} {...props} />;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
  const phdT = useTranslation();
    return <input ref={ref} className={classes('phd-input', className)} {...props} />;
  },
);

export function Checkbox({ className, type: _type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const phdT = useTranslation();
  return <input type="checkbox" className={classes('phd-checkbox', className)} {...props} />;
}

export function Switch({ className, checked = false, type = 'button', actionId, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean; actionId?: string }) {
  const phdT = useTranslation();
  return <button
    type={type}
    role="switch"
    aria-checked={checked}
    data-phd-action={actionId}
    className={classes('phd-switch', checked && 'phd-switch--checked', className)}
    {...props}
  ><span aria-hidden="true" />{children}</button>;
}

export interface EditableComboboxOption { value: string; label?: ReactNode; searchText?: string }
export interface EditableComboboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'> {
  actionId?: string;
  value: string;
  options: readonly EditableComboboxOption[];
  onValueChange(value: string): void;
  onCommit?(value: string, option?: EditableComboboxOption): void;
  emptyMessage?: ReactNode;
}

export function EditableCombobox({ actionId, value, options, onValueChange, onCommit, emptyMessage, className, onFocus, onBlur, onKeyDown, ...props }: EditableComboboxProps) {
  const phdT = useTranslation();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleOptions = useMemo(() => {
    const query = value.trim().toLocaleLowerCase();
    if (!query || options.some((option) => option.value === value)) return [...options];
    return options.filter((option) => `${option.value} ${option.searchText || ''}`.toLocaleLowerCase().includes(query));
  }, [options, value, currentLocale()]);
  useEffect(() => { setActiveIndex(0); }, [value]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  const commit = (option?: EditableComboboxOption) => {
    const next = option?.value ?? value;
    if (option) onValueChange(next);
    onCommit?.(next, option);
    setOpen(false);
  };
  return <div ref={rootRef} className="phd-editable-combobox">
    <Input
      {...props}
      data-phd-action={actionId ? `${actionId}.change` : undefined}
      className={className}
      value={value}
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={open}
      aria-controls={listId}
      aria-activedescendant={open && visibleOptions[activeIndex] ? `${listId}-${activeIndex}` : undefined}
      onFocus={(event) => { setOpen(true); onFocus?.(event); }}
      onBlur={(event) => { onCommit?.(value, options.find((option) => option.value === value)); onBlur?.(event); }}
      onChange={(event) => { onValueChange(event.target.value); setOpen(true); }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown' && visibleOptions.length) { event.preventDefault(); setOpen(true); setActiveIndex((index) => Math.min(visibleOptions.length - 1, index + 1)); }
        else if (event.key === 'ArrowUp' && visibleOptions.length) { event.preventDefault(); setOpen(true); setActiveIndex((index) => Math.max(0, index - 1)); }
        else if (event.key === 'Enter' && open && visibleOptions[activeIndex]) { event.preventDefault(); commit(visibleOptions[activeIndex]); }
        else if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
        onKeyDown?.(event);
      }}
    />
    {open ? <div id={listId} className="phd-editable-combobox__content" role="listbox">
      {visibleOptions.length ? visibleOptions.map((option, index) => <button data-phd-action={actionId ? `${actionId}.select` : undefined} id={`${listId}-${index}`} key={option.value} type="button" role="option" aria-selected={option.value === value} data-highlighted={index === activeIndex ? '' : undefined} onPointerDown={(event) => event.preventDefault()} onMouseEnter={() => setActiveIndex(index)} onClick={() => commit(option)}><span>{option.label ?? option.value}</span><small>{option.value}</small></button>) : <div className="phd-editable-combobox__empty">{emptyMessage ?? phdT("没有匹配项")}</div>}
    </div> : null}
  </div>;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const phdT = useTranslation();
  return <textarea className={classes('phd-textarea', className)} {...props} />;
}

export interface SelectOption { value: string; label: ReactNode; disabled?: boolean }
export interface SelectProps {
  actionId?: string;
  featureId?: string;
  surfaceId?: string;
  toolId?: string;
  options: readonly SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?(value: string): void;
  placeholder?: ReactNode;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  id?: string;
  title?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const EMPTY_SELECT_VALUE = '__phd_empty_select_value__';

export function Select({ actionId, featureId, surfaceId, toolId, className, contentClassName, options, value, defaultValue, onValueChange, placeholder, disabled, name, required, id, title, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy }: SelectProps) {
  const phdT = useTranslation();
  const visible = useContext(ToolVisibilityContext);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!visible) setOpen(false); }, [visible]);
  const encode = (next: string | undefined) => next === '' ? EMPTY_SELECT_VALUE : next;
  const decode = (next: string) => next === EMPTY_SELECT_VALUE ? '' : next;
  return (
    <SelectPrimitive.Root
      open={visible && open}
      onOpenChange={setOpen}
      value={encode(value)}
      defaultValue={encode(defaultValue)}
      onValueChange={(next) => onValueChange?.(decode(next))}
      disabled={disabled}
      name={name}
      required={required}
    >
      <SelectPrimitive.Trigger data-phd-action={actionId ? `${actionId}.open` : undefined} id={id} aria-label={ariaLabel || title} aria-labelledby={ariaLabelledBy} className={classes('phd-select', className)}>
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="phd-select__icon"><ChevronDownIcon size={15} aria-hidden="true" /></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content data-phd-feature={featureId} data-phd-surface={surfaceId} data-phd-tool-surface={toolId} onCloseAutoFocus={(event) => { if (!visible) event.preventDefault(); }} position="popper" sideOffset={4} className={classes('phd-select-content', contentClassName)}>
          <SelectPrimitive.ScrollUpButton className="phd-select-scroll"><ChevronUpIcon size={15} aria-hidden="true" /></SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="phd-select-viewport">
            {options.map((option) => (
              <SelectPrimitive.Item data-phd-action={actionId} key={option.value} value={encode(option.value)!} disabled={option.disabled} className="phd-select-item">
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="phd-select-item__indicator"><CheckIcon size={14} aria-hidden="true" /></SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="phd-select-scroll"><ChevronDownIcon size={15} aria-hidden="true" /></SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export interface TabsItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  tabId?: string;
  panelId?: string;
}

export function Tabs({ value, items, onValueChange, ariaLabel, actionId = 'tabs' }: { value: string; items: TabsItem[]; onValueChange(value: string): void; ariaLabel?: string; actionId?: string }) {
  const phdT = useTranslation();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = items.findIndex((item) => item.value === value && !item.disabled);
  const activeIndex = selectedIndex >= 0 ? selectedIndex : items.findIndex((item) => !item.disabled);
  return <div className="phd-tabs" role="tablist" aria-label={ariaLabel ?? phdT("页面导航")} aria-orientation="horizontal">{items.map((item, index) => <button
    key={item.value}
    ref={(element) => { tabRefs.current[index] = element; }}
    id={item.tabId}
    type="button"
    role="tab"
    tabIndex={index === activeIndex ? 0 : -1}
    data-phd-action={`${actionId}.${item.value}`}
    aria-selected={item.value === value}
    aria-controls={item.panelId}
    disabled={item.disabled}
    onClick={() => onValueChange(item.value)}
    onKeyDown={(event) => {
      const nextIndex = nextEnabledTabIndex(items, index, event.key);
      if (nextIndex < 0 || nextIndex === index || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      tabRefs.current[nextIndex]?.focus();
      onValueChange(items[nextIndex].value);
    }}
  >{item.label}</button>)}</div>;
}

/** Compact first row for independent Tools: page navigation on the left, contextual actions on the right. */
export function ToolPageBar({ navigation, status, actions, className, ariaLabel }: { navigation?: ReactNode; status?: ReactNode; actions?: ReactNode; className?: string; ariaLabel?: string }) {
  const phdT = useTranslation();
  return <div className={classes('phd-tool-page-bar', className)} role="group" aria-label={ariaLabel ?? phdT("页面导航与操作")}>
    {navigation ? <div className="phd-tool-page-bar__navigation">{navigation}</div> : <div className="phd-tool-page-bar__navigation"/>}
    {status ? <div className="phd-tool-page-bar__status" role="status">{status}</div> : null}
    {actions ? <div className="phd-tool-page-bar__actions">{actions}</div> : null}
  </div>;
}

/** Host and Native Tools share the same full-width workspace and compact toolbar. */
export function WorkbenchPage({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes('phd-workbench', className)} {...props} />;
}

export const PageBar = ToolPageBar;

export function PageToolbar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes('phd-page-toolbar', className)} {...props} />;
}

export function MenuButton({ label, actionId, featureId, surfaceId, toolId, items }: { label?: string; actionId: string; featureId?: string; surfaceId?: string; toolId?: string; items: Array<{ label: ReactNode; actionId: string; disabled?: boolean; onSelect(): void }> }) {
  const phdT = useTranslation();
  const visible = useContext(ToolVisibilityContext);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!visible) setOpen(false); }, [visible]);
  return <DropdownMenuPrimitive.Root open={open && visible} onOpenChange={setOpen}>
    <DropdownMenuPrimitive.Trigger asChild onPointerDown={event => event.preventDefault()} onKeyDown={event => {
      if (['Enter', ' ', 'ArrowDown'].includes(event.key)) { event.preventDefault(); event.currentTarget.click(); }
    }} onClick={() => setOpen(value => !value)}><Button size="sm" variant="ghost" actionId={actionId}>{label ?? phdT("更多")}<ChevronDownIcon size={14} aria-hidden="true"/></Button></DropdownMenuPrimitive.Trigger>
    <DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content className="phd-menu" align="end" sideOffset={5} data-phd-feature={featureId} data-phd-surface={surfaceId} data-phd-tool-surface={toolId} onCloseAutoFocus={event => { if (!visible) event.preventDefault(); }}>
      {items.map(item => <DropdownMenuPrimitive.Item key={item.actionId} className="phd-menu-item" data-phd-action={item.actionId} disabled={item.disabled} onSelect={item.onSelect}>{item.label}</DropdownMenuPrimitive.Item>)}
    </DropdownMenuPrimitive.Content></DropdownMenuPrimitive.Portal>
  </DropdownMenuPrimitive.Root>;
}

export function Dialog({ actionId, className, open, title, description, children, footer, onClose }: { actionId?: string; className?: string; open: boolean; title: ReactNode; description?: ReactNode; children?: ReactNode; footer?: ReactNode; onClose(): void }) {
  const phdT = useTranslation();
  const visible = useContext(ToolVisibilityContext);
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open || !visible) return undefined;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusable = () => [...(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex="-1"])') || [])];
    (focusable()[0] || dialog)?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onCloseRef.current(); return; }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) { event.preventDefault(); dialog?.focus(); return; }
      const first = items[0]; const last = items.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { window.removeEventListener('keydown', onKeyDown); if (previouslyFocused && !previouslyFocused.closest('[aria-hidden="true"]') && (document.activeElement === document.body || dialog?.contains(document.activeElement))) previouslyFocused.focus(); };
  }, [open, visible]);
  if (!open) return null;
  return <div className="phd-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section ref={dialogRef} className={classes('phd-dialog', className)} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}><header><div><h2 id={titleId}>{title}</h2>{description ? <p>{description}</p> : null}</div><IconButton actionId={actionId ? `${actionId}.close` : undefined} aria-label={phdT("关闭")}  onClick={onClose}><CloseIcon size={15} aria-hidden="true" /></IconButton></header><InternalScrollArea className="phd-dialog__body">{children}</InternalScrollArea>{footer ? <footer>{footer}</footer> : null}</section></div>;
}

export function Surface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const phdT = useTranslation();
  return <div className={classes('phd-ui-surface', className)} {...props} />;
}

export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  const phdT = useTranslation();
  return (
    <header className="phd-page-header">
      <div className="phd-page-header__copy">
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="phd-page-header__actions">{actions}</div> : null}
    </header>
  );
}

export function EmptyState({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  const phdT = useTranslation();
  return <div className="phd-state"><strong>{title}</strong>{description ? <p>{description}</p> : null}{action}</div>;
}

export function ErrorState({ title, description, action }: { title?: ReactNode; description: ReactNode; action?: ReactNode }) {
  const phdT = useTranslation();
  return <div className="phd-state phd-state--error" role="alert"><strong>{title ?? phdT("出现问题")}</strong><p>{description}</p>{action}</div>;
}

export function LoadingSkeleton({ className }: { className?: string }) {
  const phdT = useTranslation();
  return <span className={classes('phd-skeleton', className)} aria-hidden="true" />;
}

export function Markdown({ children, components }: { children: string; components?: Components }) {
  const phdT = useTranslation();
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{children}</ReactMarkdown>;
}

/** Reusable floating surfaces; positioning and application state belong to the Host. */
export const FloatingLauncher = forwardRef<HTMLButtonElement, ButtonProps>(function FloatingLauncher({ className, ...props }, ref) {
  return <Button ref={ref} variant="ghost" className={classes('phd-floating-launcher', className)} {...props} />;
});
export const FloatingPanel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function FloatingPanel({ className, ...props }, ref) {
  return <div ref={ref} className={classes('phd-floating-panel', className)} {...props} />;
});
