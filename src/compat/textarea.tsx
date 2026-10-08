import * as React from "react";

import { cn } from './utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    data-slot="textarea"
    className={cn(
      "resize-none border-input placeholder:text-muted-foreground focus-visible:border-[var(--phd-color-border-strong)] focus-visible:ring-[var(--phd-color-focus)]/35 aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex phd-textarea field-sizing-content min-h-16 w-full rounded-md px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";

export { Textarea };
