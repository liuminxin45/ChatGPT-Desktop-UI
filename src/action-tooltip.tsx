import { Children, createContext, isValidElement, useContext, useEffect, useState, type ReactElement, type ReactNode } from 'react';
import * as Primitive from '@radix-ui/react-tooltip';
import { flushSync } from 'react-dom';
import { ToolVisibilityContext } from './surface-visibility';
import { createDesktopPortal } from './scoped-surface';
const TooltipPortal = createDesktopPortal(Primitive.Portal);


const TooltipBoundary = createContext(false);

/** Display copy only: never use this text for action identities or telemetry. */
export function actionLabel(children: ReactNode): string {
  return Children.toArray(children).map(child => {
    if (typeof child === 'string' || typeof child === 'number') return String(child);
    if (isValidElement<{ children?: ReactNode }>(child)) return actionLabel(child.props.children);
    return '';
  }).join('').replace(/\s+/g, ' ').trim();
}

export function ActionTooltip({ label, children, side = 'bottom', disabled = false, direct = false, suppressed = false }: {
  label: string;
  children: ReactElement;
  side?: 'right' | 'bottom' | 'top' | 'left';
  disabled?: boolean;
  /** An expanded menu or Popover owns Escape; its trigger tooltip stays closed. */
  suppressed?: boolean;
  /** Keep rows, media and domain grids as direct layout children. */
  direct?: boolean;
}) {
  const nested = useContext(TooltipBoundary);
  const visible = useContext(ToolVisibilityContext);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!visible || suppressed) setOpen(false); }, [visible, suppressed]);
  useEffect(() => {
    if (!open || !visible || suppressed) return;
    // Tooltip is descriptive, not an interaction layer. Remove its Radix layer
    // before the original Escape reaches document-level overlay handlers.
    // No redispatched key or forced parent close: Select/menu/child Dialog still
    // owns dismissal, and standalone tooltips simply disappear.
    const dismiss = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing || event.keyCode === 229) return;
      flushSync(() => setOpen(false));
    };
    window.addEventListener('keydown', dismiss, true);
    return () => window.removeEventListener('keydown', dismiss, true);
  }, [open, visible, suppressed]);
  if (!label || nested) return children;
  return <TooltipBoundary.Provider value={true}>
    <Primitive.Provider delayDuration={300} skipDelayDuration={100}>
      <Primitive.Root open={visible && !suppressed && open} onOpenChange={next => setOpen(!suppressed && next)} disableHoverableContent>
        <Primitive.Trigger asChild>
          {direct ? children : <span className="desktop-action-tooltip" tabIndex={disabled ? 0 : undefined}>{children}</span>}
        </Primitive.Trigger>
        <TooltipPortal><Primitive.Content onEscapeKeyDown={event => {
          if (event.isComposing || event.keyCode === 229) event.preventDefault();
        }} side={side} sideOffset={5} collisionPadding={8} className="desktop-tooltip">{label}</Primitive.Content></TooltipPortal>
      </Primitive.Root>
    </Primitive.Provider>
  </TooltipBoundary.Provider>;
}
