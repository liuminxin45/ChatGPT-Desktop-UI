import { forwardRef, type ImgHTMLAttributes, type HTMLAttributes } from 'react';
import { classes } from '../classes';

/** Complete, unmasked image pixels with a soft edge shadow. Host owns sizing and loading. */
export const MediaImage = forwardRef<
  HTMLImageElement,
  ImgHTMLAttributes<HTMLImageElement> & {
    variant?: 'thumbnail' | 'viewer' | 'artwork';
  }
>(function MediaImage({ variant = 'thumbnail', className, ...props }, ref) {
  return (
    <img ref={ref} className={classes('desktop-media-image', className)} data-variant={variant} {...props} />
  );
});

/** Compact controls on a translucent media surface with readable media colors. */
export const MediaToolbar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function MediaToolbar(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={classes('desktop-media-toolbar', className)} {...props} />;
});
