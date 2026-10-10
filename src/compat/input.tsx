import * as React from "react";

import { cn } from './utils';
import { Input as NativeInput } from '../components/forms';

const Input = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <NativeInput
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "flex w-full",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
