import { forwardRef, type HTMLAttributes } from "react";

import { cn } from './utils';
import { InternalScrollArea as NativeScrollArea } from '../components/lists';

export const internalScrollAreaClassName =
  "desktop-internal-scroll overscroll-contain [scrollbar-gutter:stable]";

export const InternalScrollArea = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function InternalScrollArea({ className, ...props }, ref) {
  return (
    <NativeScrollArea
      ref={ref}
      className={cn(internalScrollAreaClassName, className)}
      {...props}
    />
  );
});
