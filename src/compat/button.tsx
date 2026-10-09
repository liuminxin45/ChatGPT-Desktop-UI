import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from './utils';
import { ActionTooltip, actionLabel } from '../action-tooltip';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap desktop-button rounded-md text-sm font-normal transition-all-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "desktop-button--secondary",
        primary: "desktop-button--primary",
        destructive:
          "desktop-button--danger",
        outline:
          "desktop-button--secondary",
        secondary:
          "desktop-button--secondary",
        ghost: "desktop-button--ghost",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> &
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
>(({ className, variant, size, asChild = false, actionId, confirmOnEnter, icon, iconOnly, badge, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const { title, type, ...restProps } = props;
  const label = (icon ? actionLabel(children) : '') || restProps['aria-label'] || title || '';
  const compact = iconOnly ?? size === 'icon';

  const buttonNode = (
    <Comp
      ref={ref}
      data-slot="button"
      data-desktop-action={actionId}
      data-desktop-enter-confirm={confirmOnEnter || undefined}
      className={cn(buttonVariants({ variant, size, className }), icon && compact && 'desktop-button--icon')}
      title={undefined}
      type={asChild ? type : type ?? "button"}
      {...restProps}
      aria-label={restProps['aria-label'] || (compact ? label : title)}
    >{icon ? <><span className="desktop-action-glyph" aria-hidden="true">{icon}{compact && badge ? <span className="desktop-action-badge">{badge}</span> : null}</span>{compact ? null : children}</> : children}</Comp>
  );

  return <ActionTooltip label={compact || title || restProps['aria-label'] ? label : ''} disabled={!!restProps.disabled}>{buttonNode}</ActionTooltip>;
});
Button.displayName = "Button";

export { Button, buttonVariants };
