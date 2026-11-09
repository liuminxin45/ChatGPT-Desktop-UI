import { forwardRef, type SVGProps } from 'react';

export interface CodexIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  selected?: boolean;
}

// Cloud and terminal mark from the client recreation. Both states share the same silhouette.
const silhouette = 'M17 8c2-6 15-6 18 1 8 0 13 9 9 16 5 8-1 17-9 17-6 8-18 5-21-2-9 0-13-11-7-17-3-8 2-15 10-15Z';
const terminal = 'm18 21 5 5-5 5m10 0h7';
const terminalCutout = 'M16.85 22.15a1.63 1.63 0 0 1 2.3-2.3l5 5a1.63 1.63 0 0 1 0 2.3l-5 5a1.63 1.63 0 0 1-2.3-2.3L20.7 26Z M28 29.375h7a1.625 1.625 0 0 1 0 3.25h-7a1.625 1.625 0 0 1 0-3.25Z';

/** Decorative Codex glyph. Use the filled version for the current destination or open panel. */
export const CodexIcon = forwardRef<SVGSVGElement, CodexIconProps>(
  function CodexIcon({ size = 20, selected = false, ...props }, ref) {
    return (
      <svg ref={ref} width={size} height={size} viewBox="1 2 48 48" aria-hidden="true" {...props}>
        <path d={silhouette} fill="none" stroke="currentColor" strokeWidth={3.25} strokeLinejoin="round" />
        {selected ? (
          <path d={`${silhouette} ${terminalCutout}`} fill="currentColor" fillRule="evenodd" />
        ) : (
          <path d={terminal} fill="none" stroke="currentColor" strokeWidth={3.25} strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    );
  },
);
