import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from './utils';
import { ControlButton } from '../actions/control-button';

const buttonVariants = cva('desktop-button', {
  variants: {
    variant: {
      default: 'desktop-button--secondary',
      primary: 'desktop-button--primary',
      destructive: 'desktop-button--danger',
      outline: 'desktop-button--secondary',
      secondary: 'desktop-button--secondary',
      ghost: 'desktop-button--ghost',
      link: 'desktop-button--link',
    },
    size: {
      default: '',
      sm: 'desktop-button--sm',
      lg: 'desktop-button--lg',
      icon: 'desktop-button--icon',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
      /** Stable product-usage identifier. Required for new or changed actions. */
      actionId?: string;
      confirmOnEnter?: boolean;
      /** An action glyph, displayed beside the visible label by default. */
      icon?: React.ReactNode;
      /** Familiar compact controls only; size="icon" also opts in. */
      iconOnly?: boolean;
      /** A real count/state badge, separate from the hidden action caption. */
      badge?: React.ReactNode;
    }
>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      actionId,
      confirmOnEnter,
      icon,
      iconOnly,
      badge,
      children,
      ...props
    },
    ref,
  ) => {
    const compact = iconOnly ?? size === 'icon';
    return (
      <ControlButton
        ref={ref}
        data-slot="button"
        asChild={asChild}
        actionId={actionId}
        confirmOnEnter={confirmOnEnter}
        icon={icon}
        iconOnly={compact}
        badge={badge}
        className={cn(
          buttonVariants({ variant, size, className }),
          icon && compact && 'desktop-button--icon',
        )}
        {...props}
      >
        {children}
      </ControlButton>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
