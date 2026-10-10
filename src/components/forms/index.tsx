import * as SelectPrimitive from '@radix-ui/react-select';
import {
  forwardRef,
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
import { currentLocale, useTranslation } from '../../strings';
import { ToolVisibilityContext } from '../../surface-visibility';
import { classes } from '../classes';

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

export function Checkbox({ className, type: _type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" className={classes('desktop-checkbox', className)} {...props} />;
}

/** Native mutually exclusive choice; the Host supplies name, value and grouping labels. */
export const Radio = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Radio(
  { className, type: _type, ...props },
  ref,
) {
  return <input ref={ref} type="radio" className={classes('desktop-radio', className)} {...props} />;
});

export function Switch({
  className,
  checked = false,
  type = 'button',
  actionId,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean; actionId?: string }) {
  return (
    <button
      type={type}
      role="switch"
      aria-checked={checked}
      data-desktop-action={actionId}
      className={classes('desktop-switch', checked && 'desktop-switch--checked', className)}
      {...props}
    >
      <span aria-hidden="true" />
      {children}
    </button>
  );
}

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
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleOptions = useMemo(() => {
    const query = value.trim().toLocaleLowerCase();
    if (!query || options.some((option) => option.value === value)) return [...options];
    return options.filter((option) =>
      `${option.value} ${option.searchText || ''}`.toLocaleLowerCase().includes(query),
    );
  }, [options, value, currentLocale()]);
  useEffect(() => {
    setActiveIndex(0);
  }, [value]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  const commit = (option?: EditableComboboxOption) => {
    const next = option?.value ?? value;
    if (option) onValueChange(next);
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
          setOpen(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          onCommit?.(
            value,
            options.find((option) => option.value === value),
          );
          onBlur?.(event);
        }}
        onChange={(event) => {
          onValueChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && visibleOptions.length) {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((index) => Math.min(visibleOptions.length - 1, index + 1));
          } else if (event.key === 'ArrowUp' && visibleOptions.length) {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((index) => Math.max(0, index - 1));
          } else if (event.key === 'Enter' && open && visibleOptions[activeIndex]) {
            event.preventDefault();
            commit(visibleOptions[activeIndex]);
          } else if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
          }
          onKeyDown?.(event);
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
                aria-selected={option.value === value}
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
  /** Grow with content and width changes; the surrounding document owns scrolling. */
  autoSize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, autoSize = false, onInput, ...props },
  ref,
) {
  const element = useRef<HTMLTextAreaElement | null>(null);
  const resize = () => {
    const node = element.current;
    if (!autoSize || !node || !node.clientWidth) return;
    node.style.height = 'auto';
    const border = node.offsetHeight - node.clientHeight;
    node.style.height = `${node.scrollHeight + border}px`;
  };
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
  }, [autoSize]);
  useEffect(resize, [autoSize, props.value, props.defaultValue, props.rows]);
  return (
    <textarea
      ref={(node) => {
        element.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={classes('desktop-textarea', autoSize && 'desktop-textarea--auto', className)}
      {...props}
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
  const encode = (next: string | undefined) => (next === '' ? EMPTY_SELECT_VALUE : next);
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
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="desktop-select__icon">
          <ChevronDownIcon size={15} aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          data-desktop-feature={featureId}
          data-desktop-surface={surfaceId}
          data-desktop-tool-surface={toolId}
          onCloseAutoFocus={(event) => {
            if (!visible) event.preventDefault();
          }}
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
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
