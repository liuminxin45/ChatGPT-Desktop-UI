import { IconButton } from '../../controls';

export interface WindowControlsProps {
  maximized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  actionIds?: { minimize: string; maximize: string; close: string };
  labels?: { minimize: string; maximize: string; restore: string; close: string };
}

/** The shared glyphs and targets; native operations and their outcomes stay in the Host. */
export function WindowControls({
  maximized = false,
  onMinimize,
  onMaximize,
  onClose,
  actionIds = { minimize: 'window.minimize', maximize: 'window.maximize-toggle', close: 'window.close' },
  labels = {
    minimize: 'Minimize window',
    maximize: 'Maximize window',
    restore: 'Restore window',
    close: 'Close window',
  },
}: WindowControlsProps) {
  return (
    <div className="kit-window-controls">
      <IconButton
        actionId={actionIds.minimize}
        aria-label={labels.minimize}
        title={labels.minimize}
        disabled={!onMinimize}
        onClick={onMinimize}
      >
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M1 6.5h10" fill="none" stroke="currentColor" />
        </svg>
      </IconButton>
      <IconButton
        actionId={actionIds.maximize}
        aria-label={maximized ? labels.restore : labels.maximize}
        title={maximized ? labels.restore : labels.maximize}
        disabled={!onMaximize}
        onClick={onMaximize}
      >
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden="true">
          {maximized ? (
            <>
              <path d="M3.5 3.5v-2h7v7h-2" />
              <rect x="1.5" y="3.5" width="7" height="7" />
            </>
          ) : (
            <rect x="1.5" y="1.5" width="9" height="9" />
          )}
        </svg>
      </IconButton>
      <IconButton
        className="kit-window-close"
        actionId={actionIds.close}
        aria-label={labels.close}
        title={labels.close}
        disabled={!onClose}
        onClick={onClose}
      >
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="m1.5 1.5 9 9m0-9-9 9" fill="none" stroke="currentColor" />
        </svg>
      </IconButton>
    </div>
  );
}
