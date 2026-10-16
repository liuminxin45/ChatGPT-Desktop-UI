import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { ActionTooltip, actionLabel } from '../../action-tooltip';

export interface ControlButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  actionId?: string;
  confirmOnEnter?: boolean;
  icon?: ReactNode;
  iconOnly?: boolean;
  badge?: ReactNode;
  directTooltip?: boolean;
  /** Supplemental information only. Accessible names and icon captions never create tooltips. */
  tooltip?: string;
  /** Reveal the full value only when the target or its text is actually clipped. */
  tooltipWhenTruncated?: boolean;
}

/** One native/Slot renderer for portable and compound button contracts. */
export const ControlButton = forwardRef<HTMLButtonElement, ControlButtonProps>(function ControlButton(
  {
    asChild,
    actionId,
    confirmOnEnter,
    title,
    type,
    icon,
    iconOnly = false,
    badge,
    children,
    directTooltip,
    tooltip = title,
    tooltipWhenTruncated = false,
    ...props
  },
  ref,
) {
  const Component = asChild ? Slot : 'button';
  const label = (icon ? actionLabel(children) : '') || props['aria-label'] || title || '';
  const target = (
    <Component
      ref={ref}
      type={asChild ? type : (type ?? 'button')}
      data-desktop-action={actionId}
      data-desktop-enter-confirm={confirmOnEnter || undefined}
      {...props}
      aria-label={props['aria-label'] || (iconOnly ? label : title)}
    >
      {icon ? (
        <>
          <span className="desktop-action-glyph" aria-hidden="true">
            {icon}
            {iconOnly && badge ? <span className="desktop-action-badge">{badge}</span> : null}
          </span>
          {iconOnly ? null : children}
        </>
      ) : (
        children
      )}
    </Component>
  );
  // Ordinary controls have no tooltip subtree, provider, timer or wrapper.
  if (!tooltip) return target;
  return (
    <ActionTooltip
      label={tooltip}
      disabled={!!props.disabled}
      direct={directTooltip}
      overflowOnly={tooltipWhenTruncated}
      suppressed={props['aria-expanded'] === true || props['aria-expanded'] === 'true'}
    >
      {target}
    </ActionTooltip>
  );
});
