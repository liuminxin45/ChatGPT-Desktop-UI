import { ActionTooltip } from '../../action-tooltip';
import type { ReactElement } from 'react';

export function Tooltip({ label, children }: { label: string; children: ReactElement }) {
  return (
    <ActionTooltip label={label} side="right">
      {children}
    </ActionTooltip>
  );
}
