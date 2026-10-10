import { type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '../../strings';
import { classes } from '../classes';

/** A compact inline condition with static content and separately operable recovery actions. */
export function InlineNotice({
  tone = 'info',
  title,
  description,
  actions,
  className,
}: {
  tone?: 'info' | 'warning' | 'danger';
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classes('desktop-inline-notice', className)}
      data-tone={tone}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <div className="desktop-inline-notice__content">
        <div>{title}</div>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="desktop-inline-notice__actions">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="desktop-state">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  action,
}: {
  title?: ReactNode;
  description: ReactNode;
  action?: ReactNode;
}) {
  const translate = useTranslation();
  return (
    <div className="desktop-state desktop-state--error" role="alert">
      <strong>{title ?? translate('出现问题')}</strong>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return <span className={classes('desktop-skeleton', className)} aria-hidden="true" />;
}

export function Markdown({ children, components }: { children: string; components?: Components }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
