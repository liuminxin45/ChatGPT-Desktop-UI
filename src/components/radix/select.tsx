import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from './utils';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;
const EMPTY_SELECT_VALUE = '__desktop_empty_select_value__';

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className = '', children, ...props }, ref) => (
  <SelectPrimitive.Trigger ref={ref} className={cn('desktop-select', className)} {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="desktop-control-glyph opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className = '', ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton ref={ref} className={cn('desktop-select-scroll', className)} {...props}>
    <ChevronUp className="desktop-control-glyph" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className = '', ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton ref={ref} className={cn('desktop-select-scroll', className)} {...props}>
    <ChevronDown className="desktop-control-glyph" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className = '', children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn('desktop-select-content', className)}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport className="desktop-select-viewport">{children}</SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className = '', ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={cn('desktop-menu-label', className)} {...props} />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className = '', children, ...props }, ref) => (
  <SelectPrimitive.Item ref={ref} className={cn('desktop-select-item', className)} {...props}>
    <span className="desktop-select-indicator">
      <SelectPrimitive.ItemIndicator>
        <Check className="desktop-control-glyph" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className = '', ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn('desktop-menu-separator', className)} {...props} />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

interface SelectControlOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

interface SelectControlProps {
  options: readonly SelectControlOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  id?: string;
  title?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  actionId?: string;
  featureId?: string;
  surfaceId?: string;
}

function SelectControl({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  className,
  contentClassName,
  disabled,
  name,
  required,
  id,
  title,
  actionId,
  featureId,
  surfaceId,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: SelectControlProps) {
  const encode = (next: string | undefined) => (next === '' ? EMPTY_SELECT_VALUE : next);
  const decode = (next: string) => (next === EMPTY_SELECT_VALUE ? '' : next);
  return (
    <Select
      value={encode(value)}
      defaultValue={encode(defaultValue)}
      onValueChange={(next) => onValueChange?.(decode(next))}
      disabled={disabled}
      name={name}
      required={required}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel || title}
        aria-labelledby={ariaLabelledBy}
        data-desktop-action={actionId ? `${actionId}.open` : undefined}
        className={className}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className={contentClassName}
        data-desktop-feature={featureId}
        data-desktop-surface={surfaceId}
      >
        {options.map((option) => (
          <SelectItem
            data-desktop-action={actionId}
            key={option.value}
            value={encode(option.value)!}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectControl,
};
export type { SelectControlOption, SelectControlProps };
