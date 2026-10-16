import { ActionTooltip } from '../../action-tooltip';
import type { ReactElement } from 'react';

export function Tooltip({
  label,
  children,
  overflowOnly = false,
}: {
  label: string;
  children: ReactElement;
  overflowOnly?: boolean;
}) {
  return (
    <ActionTooltip label={label} side="right" overflowOnly={overflowOnly} direct={overflowOnly}>
      {children}
    </ActionTooltip>
  );
}
