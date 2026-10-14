import { Slot } from '@radix-ui/react-slot';
import {
  cloneElement,
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { ActionTooltip } from '../../action-tooltip';
import { classes } from '../classes';

export interface NavigationRailItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The Host may supply a real router link without replacing shared target geometry. */
  asChild?: boolean;
  label: string;
  actionId?: string;
  selected?: boolean;
  unread?: boolean;
  children: ReactNode;
}

/** One semantic link or command, with a name-only tooltip and shared navigation feedback. */
export const NavigationRailItem = forwardRef<HTMLElement, NavigationRailItemProps>(
  function NavigationRailItem(
    {
      asChild = false,
      label,
      actionId,
      selected = false,
      unread = false,
      children,
      className,
      disabled,
      onClick,
      ...props
    },
    ref,
  ) {
    const Target = asChild ? Slot : 'button';
    const dot = unread ? <span className="kit-unread" aria-hidden="true" /> : null;
    const content = asChild ? (
      cloneElement(
        children as ReactElement<{ children?: ReactNode; onClick?: import('react').MouseEventHandler }>,
        disabled
          ? {
              onClick: (event) => {
                event.preventDefault();
                event.stopPropagation();
              },
            }
          : undefined,
        <>
          {(children as ReactElement<{ children?: ReactNode }>).props.children}
          {dot}
        </>,
      )
    ) : (
      <>
        {children}
        {dot}
      </>
    );
    return (
      <ActionTooltip label={label} side="right">
        <Target
          {...props}
          ref={ref as import('react').Ref<HTMLButtonElement>}
          className={classes('kit-rail__item', className)}
          {...(!asChild
            ? { type: 'button', disabled }
            : disabled
              ? { 'aria-disabled': true, tabIndex: -1 }
              : {})}
          aria-label={props['aria-label'] || label}
          aria-current={selected ? 'page' : props['aria-current']}
          data-desktop-action={actionId}
          onClick={(event) => {
            if (disabled) {
              event.preventDefault();
              return;
            }
            onClick?.(event);
          }}
        >
          {content}
        </Target>
      </ActionTooltip>
    );
  },
);
