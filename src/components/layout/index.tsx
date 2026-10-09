import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { useTranslation } from '../../strings';
import { classes } from '../classes';

/** Compact first row for independent Tools: page navigation on the left, contextual actions on the right. */
export function ToolPageBar({
  navigation,
  status,
  actions,
  className,
  ariaLabel,
}: {
  navigation?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const translate = useTranslation();
  return (
    <div
      className={classes('desktop-tool-page-bar', className)}
      role="group"
      aria-label={ariaLabel ?? translate('页面导航与操作')}
    >
      {navigation ? (
        <div className="desktop-tool-page-bar__navigation">{navigation}</div>
      ) : (
        <div className="desktop-tool-page-bar__navigation" />
      )}
      {status ? (
        <div className="desktop-tool-page-bar__status" role="status">
          {status}
        </div>
      ) : null}
      {actions ? <div className="desktop-tool-page-bar__actions">{actions}</div> : null}
    </div>
  );
}

/** Host and Native Tools share the same full-width workspace and compact toolbar. */
export function WorkbenchPage({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes('desktop-workbench', className)} {...props} />;
}

export const PageBar = ToolPageBar;

export function PageToolbar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes('desktop-page-toolbar', className)} {...props} />;
}

export function Surface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes('desktop-ui-surface', className)} {...props} />;
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="desktop-page-header">
      <div className="desktop-page-header__copy">
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="desktop-page-header__actions">{actions}</div> : null}
    </header>
  );
}

export const FloatingPanel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function FloatingPanel({ className, ...props }, ref) {
    return <div ref={ref} className={classes('desktop-floating-panel', className)} {...props} />;
  },
);
