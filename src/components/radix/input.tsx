import * as React from 'react';

import { cn } from './utils';
import { Input as NativeInput } from '../forms';

const Input = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<'input'>>(
  ({ className, type, ...props }, ref) => {
    return <NativeInput ref={ref} type={type} data-slot="input" className={cn(className)} {...props} />;
  },
);
Input.displayName = 'Input';

export { Input };
