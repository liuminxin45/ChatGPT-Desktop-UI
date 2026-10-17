import * as SelectPrimitive from '@radix-ui/react-select';
import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type FormHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '../../icons';
import { useLocale, useTranslation } from '../../strings';
import { isInputComposing } from '../../input-behavior';
import { ToolVisibilityContext } from '../../surface-visibility';
import { useDismissalLayer } from '../../dismissal';
import { classes } from '../classes';
import { createDesktopPortal } from '../../scoped-surface';
const SelectPortal = createDesktopPortal(SelectPrimitive.Portal);

/** Explicit responsive form layout; never repaint arbitrary Host forms or labels. */
export function SettingsForm({ className, ...props }: FormHTMLAttributes<HTMLFormElement>) {
  return <form className={classes('desktop-settings-form', className)} {...props} />;
}

export function FieldRow({
  className,
  inline = false,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { inline?: boolean }) {
  return (
    <label className={classes('desktop-field-row', className)} data-inline={inline || undefined} {...props} />
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={classes('desktop-input', className)} {...props} />;
});

/** One text-entry boundary for an input with leading icons or trailing actions. */
export const InputGroup = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  function InputGroup({ className, ...props }, ref) {
    return <label ref={ref} className={classes('desktop-input-group', className)} {...props} />;
  },
);

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Checkbox(
  { className, type: _type, ...props },
  ref,
) {
  return <input ref={ref} type="checkbox" className={classes('desktop-checkbox', className)} {...props} />;
});

/** Native mutually exclusive choice; the Host supplies name, value and grouping labels. */
export const Radio = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Radio(
  { className, type: _type, ...props },
  ref,
) {
  return <input ref={ref} type="radio" className={classes('desktop-radio', className)} {...props} />;
});

export interface SwitchProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?(checked: boolean): void;
  actionId?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    className,
    checked,
    defaultChecked = false,
    onCheckedChange,
    onClick,
    type = 'button',
    actionId,
    children,
    ...props
  }: SwitchProps,
  ref,
) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const active = checked ?? internalChecked;
  return (
    <button
      ref={ref}
      type={type}
      role="switch"
      aria-checked={active}
      data-desktop-action={actionId}
      className={classes('desktop-switch', active && 'desktop-switch--checked', className)}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (checked === undefined) setInternalChecked(!active);
        onCheckedChange?.(!active);
      }}
    >
      <span aria-hidden="true" />
      {children}
    </button>
  );
});

export interface EditableComboboxOption {
  value: string;
  label?: ReactNode;
  searchText?: string;
}

export interface EditableComboboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'> {
  actionId?: string;
  value: string;
  options: readonly EditableComboboxOption[];
  onValueChange(value: string): void;
  onCommit?(value: string, option?: EditableComboboxOption): void;
  emptyMessage?: ReactNode;
}

export function EditableCombobox({
  actionId,
  value,
  options,
  onValueChange,
  onCommit,
  emptyMessage,
  className,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: EditableComboboxProps) {
  const translate = useTranslation();
  const locale = useLocale();
  const visible = useContext(ToolVisibilityContext);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useDismissalLayer(open && visible && !props.disabled, () => setOpen(false));
  const [activeIndex, setActiveIndex] = useState(-1);
  const committed = useRef(false);
  const visibleOptions = useMemo(() => {
    const query = value.trim().toLocaleLowerCase(locale);
    if (!query || options.some((option) => option.value === value)) return [...options];
    return options.filter((option) =>
      `${option.value} ${option.searchText || ''}`.toLocaleLowerCase(locale).includes(query),
    );
  }, [options, value, locale]);
  useEffect(() => {
    setActiveIndex(-1);
  }, [value]);
  useEffect(() => {
    if (!visible || props.disabled) setOpen(false);
  }, [visible, props.disabled]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  const commit = (option?: EditableComboboxOption, select = true) => {
    if (committed.current) {
      setOpen(false);
      return;
    }
    committed.current = true;
    const next = option?.value ?? value;
    if (option && select) onValueChange(next);
    onCommit?.(next, option);
    setOpen(false);
  };
  return (
    <div ref={rootRef} className="desktop-editable-combobox">
      <Input
        {...props}
        data-desktop-action={actionId ? `${actionId}.change` : undefined}
        className={className}
        value={value}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && visibleOptions[activeIndex] ? `${listId}-${activeIndex}` : undefined}
        onFocus={(event) => {
          committed.current = false;
          setOpen(visible && !props.disabled);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          commit(
            options.find((option) => option.value === value),
            false,
          );
          onBlur?.(event);
        }}
        onChange={(event) => {
          committed.current = false;
          onValueChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || isInputComposing(event)) return;
          if (event.key === 'ArrowDown' && visibleOptions.length) {
            event.preventDefault();
            if (!open) committed.current = false;
            setOpen(true);
            setActiveIndex((index) => Math.min(visibleOptions.length - 1, index + 1));
          } else if (event.key === 'ArrowUp' && visibleOptions.length) {
            event.preventDefault();
            if (!open) committed.current = false;
            setOpen(true);
            setActiveIndex((index) => Math.max(0, index - 1));
          } else if (
            event.key === 'Enter' &&
            open &&
            !event.shiftKey &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.repeat
          ) {
            event.preventDefault();
            commit(visibleOptions[activeIndex]);
          } else if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
          }
        }}
      />
      {open ? (
        <div id={listId} className="desktop-editable-combobox__content" role="listbox">
          {visibleOptions.length ? (
            visibleOptions.map((option, index) => (
              <button
                data-desktop-action={actionId ? `${actionId}.select` : undefined}
                id={`${listId}-${index}`}
                key={option.value}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={index === activeIndex}
                data-highlighted={index === activeIndex ? '' : undefined}
                onPointerDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => commit(option)}
              >
                <span>{option.label ?? option.value}</span>
                <small>{option.value}</small>
              </button>
            ))
          ) : (
            <div className="desktop-editable-combobox__empty">{emptyMessage ?? translate('没有匹配项')}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Grow with content and width changes; at a CSS max-height the field scrolls internally. */
  autoSize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, autoSize = false, onInput, ...props },
  ref,
) {
  const element = useRef<HTMLTextAreaElement | null>(null);
  const resize = useCallback(() => {
    const node = element.current;
    if (!autoSize || !node || !node.clientWidth) return;
    node.style.height = 'auto';
    const border = node.offsetHeight - node.clientHeight;
    node.style.height = `${node.scrollHeight + border}px`;
    // CSS max-height may clamp the measured height. Keep the rest of the draft
    // reachable instead of leaving auto-sized fields permanently overflow:hidden.
    node.style.overflowY = node.scrollHeight > node.clientHeight + 1 ? 'auto' : 'hidden';
  }, [autoSize]);
  useEffect(() => {
    resize();
    if (!autoSize || !element.current) return;
    let width = element.current.clientWidth;
    const observer = new ResizeObserver(() => {
      if (element.current?.clientWidth !== width) {
        width = element.current?.clientWidth ?? 0;
        resize();
      }
    });
    observer.observe(element.current);
    return () => observer.disconnect();
  }, [autoSize, resize]);
  useEffect(resize, [resize, props.value, props.defaultValue, props.rows]);
  return (
    <textarea
      ref={(node) => {
        element.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={classes('desktop-textarea', autoSize && 'desktop-textarea--auto', className)}
      {...props}
      rows={props.rows ?? (autoSize ? 1 : undefined)}
      onInput={(event) => {
        resize();
        onInput?.(event);
      }}
    />
  );
});

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  /** Custom trigger presentation; options retain their complete labels in the popup. */
  triggerContent?: ReactNode;
  /** Compact row controls retain full values, wrapping within their assigned column. */
  size?: 'sm' | 'md';
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

const EMPTY_SELECT_VALUE = '__desktop_empty_select_value__';

export function Select({
  triggerContent,
  size = 'md',
  actionId,
  featureId,
  surfaceId,
  toolId,
  className,
  contentClassName,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  disabled,
  name,
  required,
  id,
  title,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: SelectProps) {
  const visible = useContext(ToolVisibilityContext);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!visible) setOpen(false);
  }, [visible]);
  const hasEmptyOption = options.some((option) => option.value === '');
  useDismissalLayer(open && visible && !disabled, () => setOpen(false));
  const encode = (next: string | undefined) => (next === '' && hasEmptyOption ? EMPTY_SELECT_VALUE : next);
  const decode = (next: string) => (next === EMPTY_SELECT_VALUE ? '' : next);
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
      <SelectPrimitive.Trigger
        data-desktop-action={actionId ? `${actionId}.open` : undefined}
        id={id}
        aria-label={ariaLabel || title}
        aria-labelledby={ariaLabelledBy}
        className={classes('desktop-select', size === 'sm' && 'desktop-select--sm', className)}
      >
        <SelectPrimitive.Value placeholder={placeholder}>{triggerContent}</SelectPrimitive.Value>
        <SelectPrimitive.Icon className="desktop-select__icon">
          <ChevronDownIcon size={15} aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPortal>
        <SelectPrimitive.Content
          data-desktop-feature={featureId}
          data-desktop-surface={surfaceId}
          data-desktop-tool-surface={toolId}
          onCloseAutoFocus={(event) => {
            if (!visible) event.preventDefault();
          }}
          onPointerDownOutside={(event) => event.detail.originalEvent.preventDefault()}
          position="popper"
          sideOffset={4}
          className={classes('desktop-select-content', contentClassName)}
        >
          <SelectPrimitive.ScrollUpButton className="desktop-select-scroll">
            <ChevronUpIcon size={15} aria-hidden="true" />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="desktop-select-viewport">
            {options.map((option) => (
              <SelectPrimitive.Item
                data-desktop-action={actionId}
                key={option.value}
                value={encode(option.value)!}
                disabled={option.disabled}
                className="desktop-select-item"
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="desktop-select-item__indicator">
                  <CheckIcon size={14} aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="desktop-select-scroll">
            <ChevronDownIcon size={15} aria-hidden="true" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPortal>
    </SelectPrimitive.Root>
  );
}
