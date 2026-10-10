import * as React from 'react';

import { cn } from './utils';
import { Textarea as NativeTextarea } from '../forms';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<typeof NativeTextarea>>(
  ({ className, ...props }, ref) => (
    <NativeTextarea ref={ref} data-slot="textarea" className={cn(className)} {...props} />
  ),
);

Textarea.displayName = 'Textarea';

export { Textarea };
