import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from './utils';
import { Select as DesktopSelect, type SelectOption, type SelectProps } from '../forms';
import { createDesktopPortal } from '../../scoped-surface';
const SelectPortal = createDesktopPortal(SelectPrimitive.Portal);

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

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
  <SelectPortal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn('desktop-select-content', className)}
      position={position}
      {...props}
      onPointerDownOutside={(event) => {
        props.onPointerDownOutside?.(event);
        event.detail.originalEvent.preventDefault();
      }}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport className="desktop-select-viewport">{children}</SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPortal>
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

// Compatibility names forward to the canonical control, including compact
// density, long values, empty values and feature instrumentation.
const SelectControl = DesktopSelect;
type SelectControlOption = SelectOption;
type SelectControlProps = SelectProps;

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
