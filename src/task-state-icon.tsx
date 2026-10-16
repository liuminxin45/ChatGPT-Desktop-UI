import type { SVGProps } from 'react';

export type TaskState = 'not-started' | 'in-progress' | 'paused' | 'completed' | 'cancelled' | 'unknown';

/** Compact task state; excluded work keeps its state shape and adds a minus mark. */
export function TaskStateIcon({ state, excludedFromStats = false, className = '', ...props }: SVGProps<SVGSVGElement> & {
  state: TaskState;
  excludedFromStats?: boolean;
}) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" {...props} className={`desktop-task-state desktop-task-state--${state} ${className}`} data-excluded={excludedFromStats || undefined}>
    <circle cx="12" cy="12" r="9" strokeDasharray={state === 'not-started' ? '2 3' : undefined} />
    {state === 'in-progress' && <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />}
    {state === 'paused' && <path d="M10 9v6m4-6v6" />}
    {state === 'completed' && <path d="m8 12 3 3 5-6" />}
    {state === 'cancelled' && <path d="m9 9 6 6m0-6-6 6" />}
    {state === 'unknown' && <><path d="M9.7 9a2.4 2.4 0 0 1 4.6 1c0 1.5-2.3 1.5-2.3 3" /><path d="M12 16h.01" /></>}
    {excludedFromStats && <><circle cx="19" cy="19" r="4" className="desktop-task-state__marker" stroke="none" /><path d="M17 19h4" /></>}
  </svg>;
}
