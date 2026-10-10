import { Children, isValidElement, useMemo, useState, type HTMLAttributes, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '../../strings';
import { classes } from '../classes';

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

/** Text-only AI activity. Ordinary loading states retain their existing controls. */
export function AIActivity({
  children,
  active = true,
  compact = false,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { active?: boolean; compact?: boolean }) {
  return (
    <span
      {...props}
      role={props.role ?? 'status'}
      className={classes(
        'desktop-ai-activity',
        active && 'desktop-ai-activity--active',
        compact && 'desktop-ai-activity--compact',
        className,
      )}
    >
      {children}
    </span>
  );
}

function textContent(value: ReactNode): string {
  return Children.toArray(value)
    .map((child) =>
      isValidElement<{ children?: ReactNode }>(child) ? textContent(child.props.children) : String(child),
    )
    .join('');
}

function CodeBlock({ children, disabled }: { children?: ReactNode; disabled?: boolean }) {
  const translate = useTranslation();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const code = Children.toArray(children).find(isValidElement<{ className?: string }>);
  const language = isValidElement<{ className?: string }>(code)
    ? code.props.className?.match(/language-(\S+)/)?.[1]
    : undefined;
  return (
    <div className="desktop-markdown-codeblock">
      <div className="desktop-markdown-codebar">
        <span>{language ?? translate('Code')}</span>
        <button
          type="button"
          className="desktop-markdown-copy"
          disabled={disabled}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(textContent(children));
              setCopied(true);
              setError(false);
            } catch {
              setError(true);
              setCopied(false);
            }
          }}
        >
          {translate(copied ? 'Copied' : error ? 'Copy unavailable' : 'Copy code')}
        </button>
      </div>
      <pre>{children}</pre>
    </div>
  );
}

/** AI typography is opt-in; default parsing and custom element adapters stay compatible. */
export function Markdown({
  children,
  components,
  variant = 'default',
  copyDisabled = false,
  className,
  ...props
}: Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children: string;
  components?: Components;
  variant?: 'default' | 'ai';
  copyDisabled?: boolean;
}) {
  const renderers = useMemo(
    () =>
      variant === 'ai'
        ? {
            pre: ({ children }: { children?: ReactNode }) => (
              <CodeBlock disabled={copyDisabled}>{children}</CodeBlock>
            ),
            ...components,
          }
        : components,
    [variant, copyDisabled, components],
  );
  const content = (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={renderers}>
      {children}
    </ReactMarkdown>
  );
  if (variant === 'default' && !className && !Object.keys(props).length) return content;
  return (
    <div {...props} className={classes(variant === 'ai' && 'desktop-ai-markdown', className)}>
      {content}
    </div>
  );
}
