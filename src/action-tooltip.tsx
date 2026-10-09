import { Children, createContext, isValidElement, useContext, useEffect, useState, type ReactElement, type ReactNode } from 'react';
import * as Primitive from '@radix-ui/react-tooltip';
import { ToolVisibilityContext } from './surface-visibility';

const TooltipBoundary = createContext(false);

/** Display copy only: never use this text for action identities or telemetry. */
export function actionLabel(children: ReactNode): string {
  return Children.toArray(children).map(child => {
    if (typeof child === 'string' || typeof child === 'number') return String(child);
    if (isValidElement<{ children?: ReactNode }>(child)) return actionLabel(child.props.children);
    return '';
  }).join('').replace(/\s+/g, ' ').trim();
}

export function ActionTooltip({ label, children, side = 'bottom', disabled = false }: {
  label: string;
  children: ReactElement;
  side?: 'right' | 'bottom' | 'top' | 'left';
  disabled?: boolean;
}) {
  const nested = useContext(TooltipBoundary);
  const visible = useContext(ToolVisibilityContext);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!visible) setOpen(false); }, [visible]);
  if (!label || nested) return children;
  return <TooltipBoundary.Provider value={true}>
    <Primitive.Provider delayDuration={300} skipDelayDuration={100}>
      <Primitive.Root open={visible && open} onOpenChange={setOpen} disableHoverableContent>
        <Primitive.Trigger asChild>
          <span className="phd-action-tooltip" tabIndex={disabled ? 0 : undefined}>{children}</span>
        </Primitive.Trigger>
        <Primitive.Portal><Primitive.Content side={side} sideOffset={5} collisionPadding={8} className="phd-tooltip">{label}</Primitive.Content></Primitive.Portal>
      </Primitive.Root>
    </Primitive.Provider>
  </TooltipBoundary.Provider>;
}
