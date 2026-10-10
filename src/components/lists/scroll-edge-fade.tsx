import { createContext, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { classes } from '../classes';

export const scrollEdgeFadeSize = 24;
export const ScrollEdgeFadeContext = createContext<boolean | 'virtual'>(false);

export interface ScrollEdgeFadeProps {
  children: ReactNode;
  /** Fade the nearest shared scroll viewport; surrounding viewports remain unchanged. */
  enabled?: boolean;
  /** Host virtualizers include scrollEdgeFadeSize in paddingEnd and scrollPaddingEnd. */
  virtualized?: boolean;
}

/** Bottom optical boundary above a fixed composer. Adds no layout wrapper. */
export function ScrollEdgeFade({ children, enabled = true, virtualized = false }: ScrollEdgeFadeProps) {
  return (
    <ScrollEdgeFadeContext.Provider value={enabled && virtualized ? 'virtual' : enabled}>
      {children}
    </ScrollEdgeFadeContext.Provider>
  );
}

export interface ComposerDockProps extends HTMLAttributes<HTMLDivElement> {
  /** Shared horizontal/bottom spacing; the top touches the scroll viewport. */
  inset?: 'compact' | 'responsive' | 'none';
}

/** Fixed input region adjoining ScrollEdgeFade. Hosts retain state and controls. */
export const ComposerDock = forwardRef<HTMLDivElement, ComposerDockProps>(function ComposerDock(
  { inset = 'compact', className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={classes('desktop-composer-dock', `desktop-composer-dock--${inset}`, className)}
      {...props}
    />
  );
});
