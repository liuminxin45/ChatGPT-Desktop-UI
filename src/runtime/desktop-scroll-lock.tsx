import { forwardRef, type ComponentProps } from 'react';
import { RemoveScroll as NativeRemoveScroll } from 'react-remove-scroll';

/** Desktop canvas has no body scrollbar. Keep modal wheel/touch isolation without
 * injecting a second global stylesheet or compensating an absent body gutter. */
export const RemoveScroll=Object.assign(forwardRef<HTMLDivElement,ComponentProps<typeof NativeRemoveScroll>>((props,ref)=>(
  <NativeRemoveScroll {...props} ref={ref} removeScrollBar={false} />
)),{classNames:NativeRemoveScroll.classNames});
