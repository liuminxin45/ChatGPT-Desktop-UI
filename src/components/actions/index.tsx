import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { classes } from '../classes';
import { ControlButton } from './control-button';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  actionId?: string;
  confirmOnEnter?: boolean;
  /** An action glyph, displayed beside the visible label by default. */
  icon?: ReactNode;
  /** Opt in only for familiar, compact toolbar controls. */
  iconOnly?: boolean;
  badge?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'secondary', size = 'md', icon, iconOnly = false, ...props },
  ref,
) {
  return (
    <ControlButton
      ref={ref}
      icon={icon}
      iconOnly={iconOnly}
      className={classes(
        'desktop-button',
        `desktop-button--${variant}`,
        `desktop-button--${size}`,
        className,
        !!icon && iconOnly && 'desktop-button--icon',
      )}
      {...props}
    />
  );
});

export function IconButton({
  className,
  type = 'button',
  actionId,
  title,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { actionId?: string }) {
  return (
    <ControlButton
      type={type}
      actionId={actionId}
      title={title}
      className={classes('desktop-icon-control', className)}
      {...props}
    />
  );
}

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
