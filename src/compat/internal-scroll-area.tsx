import { forwardRef, type HTMLAttributes } from "react";

import { cn } from './utils';

export const internalScrollAreaClassName =
  "desktop-internal-scroll overscroll-contain [scrollbar-gutter:stable]";

export const InternalScrollArea = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function InternalScrollArea({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(internalScrollAreaClassName, className)}
      {...props}
    />
  );
});
