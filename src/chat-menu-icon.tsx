import type { SVGProps } from 'react';

/** Two-line navigation target used by the public mobile chat profile. */
export function ChatMenuIcon({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 8h16M4 16h10" />
    </svg>
  );
}
