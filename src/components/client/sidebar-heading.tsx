import type { HTMLAttributes } from 'react';
import { classes } from '../classes';

/** Shared contextual-sidebar title, including titles inside navigation controls. */
export function ClientSidebarHeading({
  as: Tag = 'h2',
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { as?: 'h2' | 'span' }) {
  return <Tag {...props} className={classes('client-sidebar-heading', className)} />;
}
