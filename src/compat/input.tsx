import * as React from "react";

import { cn } from './utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "phd-input flex h-9 w-full rounded-md px-3 py-1 text-sm text-foreground transition-colors file:border-0 file:bg-transparent file:text-sm file:font-normal placeholder:text-muted-foreground focus-visible:border-[var(--phd-color-border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--phd-color-focus)]/35 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
