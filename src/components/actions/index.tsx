import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { classes } from '../classes';
import { ControlButton } from './control-button';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Commands are compact; rows and media own distinct, shared geometry. Surface is reserved for domain graphics such as schedule grids. */
  layout?: 'command' | 'row' | 'tile' | 'surface';
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  actionId?: string;
  confirmOnEnter?: boolean;
  /** An action glyph, displayed beside the visible label by default. */
  icon?: ReactNode;
  /** Opt in only for familiar, compact toolbar controls. */
  iconOnly?: boolean;
  badge?: ReactNode;
  /** Additional information, never a repeated caption or familiar action name. */
  tooltip?: string;
  /** Show tooltip only while the target's text is clipped. */
  tooltipWhenTruncated?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, layout = 'command', variant = 'secondary', size = 'md', icon, iconOnly = false, ...props },
  ref,
) {
  return (
    <ControlButton
      ref={ref}
      directTooltip={layout !== 'command'}
      icon={icon}
      iconOnly={iconOnly}
      className={classes(
        layout === 'surface' ? 'desktop-surface-action' : 'desktop-button',
        layout !== 'surface' && `desktop-button--${variant}`,
        layout !== 'surface' && `desktop-button--${size}`,
        layout !== 'command' && `desktop-button--${layout}`,
        className,
        !!icon && iconOnly && 'desktop-button--icon',
      )}
      {...props}
    />
  );
});

/** A record command with feedback confined to its actual hit target. */
export const RecordAction = forwardRef<HTMLButtonElement, ButtonProps>(function RecordAction(
  { className, ...props },
  ref,
) {
  return (
    <Button ref={ref} variant="ghost" className={classes('desktop-record-action', className)} {...props} />
  );
});

/** Semantic navigation within a static record; never nests a button or claims the row. */
export const RecordLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { actionId: string }
>(function RecordLink({ actionId, className, ...props }, ref) {
  return (
    <a
      ref={ref}
      data-desktop-action={actionId}
      className={classes('desktop-record-link', className)}
      {...props}
    />
  );
});

export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    actionId?: string;
    tooltip?: string;
    tooltipWhenTruncated?: boolean;
  }
>(function IconButton({ className, type = 'button', actionId, title, ...props }, ref) {
  return (
    <ControlButton
      ref={ref}
      type={type}
      actionId={actionId}
      title={title}
      className={classes('desktop-icon-control', className)}
      {...props}
    />
  );
});

/** Reusable floating surfaces; positioning and application state belong to the Host. */
export const FloatingLauncher = forwardRef<HTMLButtonElement, ButtonProps>(function FloatingLauncher(
  { className, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant="ghost"
      className={classes('desktop-floating-launcher', className)}
      {...props}
    />
  );
});
