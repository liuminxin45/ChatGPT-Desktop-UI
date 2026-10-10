import * as React from "react";

import { cn } from './utils';
import { Textarea as NativeTextarea } from '../components/forms';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<typeof NativeTextarea>
>(({ className, ...props }, ref) => (
  <NativeTextarea
    ref={ref}
    data-slot="textarea"
    className={cn(
      "resize-none field-sizing-content min-h-16 w-full",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";

export { Textarea };
