import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from './utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap phd-button rounded-md text-sm font-normal transition-all-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "phd-button--secondary",
        primary: "phd-button--primary",
        destructive:
          "phd-button--danger",
        outline:
          "phd-button--secondary",
        secondary:
          "phd-button--secondary",
        ghost: "phd-button--ghost",
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
    }
>(({ className, variant, size, asChild = false, actionId, confirmOnEnter, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const { title, type, ...restProps } = props;

  const buttonNode = (
    <Comp
      ref={ref}
      data-slot="button"
      data-phd-action={actionId}
      data-phd-enter-confirm={confirmOnEnter || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      title={undefined}
      type={asChild ? type : type ?? "button"}
      {...restProps}
      aria-label={restProps['aria-label'] || title}
    />
  );

  return buttonNode;
});
Button.displayName = "Button";

export { Button, buttonVariants };
