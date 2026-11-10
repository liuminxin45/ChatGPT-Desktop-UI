import type { MouseEventHandler, ReactNode } from 'react';
import { CloseIcon } from '../../icons';
import { classes } from '../classes';
import { ControlButton } from './control-button';

export const personPillClassName = 'desktop-person-pill';

// The package build embeds the same stylesheet imported by controls.css.
// Hosts only need this export when their document cannot inherit the kit CSS.
declare const __DESKTOP_PERSON_PILL_STYLES__: string;
export const personPillStyles =
  typeof __DESKTOP_PERSON_PILL_STYLES__ === 'undefined' ? '' : __DESKTOP_PERSON_PILL_STYLES__;

type PersonPillAction = {
  actionId: string;
  ariaLabel: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

export type PersonPillProps = {
  children: ReactNode;
  /** Use for placement or a maximum width set by the surrounding layout. */
  className?: string;
  /** Supplemental identity, e.g. an address behind a display name. */
  tooltip?: string;
} & ({ action: PersonPillAction; remove?: never } | { action?: never; remove?: PersonPillAction });

/** A person label with one compact surface, independent of ordinary button geometry. */
export function PersonPill({ children, className, tooltip, action, remove }: PersonPillProps) {
  const rootClass = classes(personPillClassName, className);
  const label = <span className="desktop-person-pill__label">{children}</span>;

  if (action) {
    return (
      <ControlButton
        className={rootClass}
        actionId={action.actionId}
        aria-label={action.ariaLabel}
        onClick={action.onClick}
        disabled={action.disabled}
        tooltip={tooltip}
        directTooltip
      >
        {label}
      </ControlButton>
    );
  }

  return (
    <span className={rootClass} title={tooltip}>
      {label}
      {remove && (
        <ControlButton
          className="desktop-person-pill__remove"
          actionId={remove.actionId}
          aria-label={remove.ariaLabel}
          onClick={remove.onClick}
          disabled={remove.disabled}
        >
          <CloseIcon aria-hidden="true" />
        </ControlButton>
      )}
    </span>
  );
}
