import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from './button';
import { cn } from './utils';

export const glassPanelClass = "glass-panel";
export const glassPanelStrongClass = "glass-panel-strong";
export const glassToolbarClass = "glass-toolbar";
export const glassInputClass = "glass-input";
export const glassSectionClass = "glass-section";
export const glassPageHeaderClass = "glass-page-header";
export const glassDotClass = "glass-dot";
export const glassModalOverlayClass = "glass-modal-overlay";
export const glassModalContentClass = "glass-modal-content";

const glassIconButtonVariants = cva(
  "h-9 w-9 rounded-md border-0 bg-transparent text-[var(--desktop-color-text-muted)] transition-colors duration-150 hover:bg-[var(--desktop-color-canvas)] hover:text-[var(--desktop-color-text)]",
  {
    variants: {
      tone: {
        neutral: "",
        primary: "text-[var(--desktop-color-info)] hover:text-[var(--desktop-color-info)]",
        warning: "text-[var(--desktop-color-warning)] hover:text-[var(--desktop-color-warning)]",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export function GlassPage({
  className,
  children,
  showOrbs = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { showOrbs?: boolean }) {
  return (
    <div className={cn("glass-page min-h-full", className)} {...props}>
      {showOrbs && (
        <>
          <div className="glass-orb glass-orb-a" aria-hidden="true" />
          <div className="glass-orb glass-orb-b" aria-hidden="true" />
          <div className="glass-orb glass-orb-c" aria-hidden="true" />
        </>
      )}
      {children}
    </div>
  );
}

export function GlassPanel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(glassPanelClass, className)} {...props}>
      {children}
    </div>
  );
}

export function GlassToolbar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(glassToolbarClass, className)} {...props}>
      {children}
    </div>
  );
}

export function GlassSection({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(glassSectionClass, className)} {...props}>
      {children}
    </div>
  );
}

export function GlassIconButton({
  className,
  tone,
  title,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "variant" | "size"> &
  VariantProps<typeof glassIconButtonVariants>) {
  const buttonNode = (
    <Button
      variant="ghost"
      size="icon"
      className={cn(glassIconButtonVariants({ tone }), className)}
      title={undefined}
      {...props}
      aria-label={props['aria-label'] || title}
    />
  );

  return buttonNode;
}
