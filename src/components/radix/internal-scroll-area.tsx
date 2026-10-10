import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from './utils';
import { InternalScrollArea as NativeScrollArea } from '../lists';

export const internalScrollAreaClassName = 'desktop-internal-scroll';

export const InternalScrollArea = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function InternalScrollArea({ className, ...props }, ref) {
    return <NativeScrollArea ref={ref} className={cn(internalScrollAreaClassName, className)} {...props} />;
  },
);
