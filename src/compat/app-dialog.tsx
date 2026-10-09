"use client";

import { t as translate, useTranslation, currentLocale } from '../strings';
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { X } from "lucide-react";

import { Button } from './button';
import { InternalScrollArea } from './internal-scroll-area';
import { glassModalContentClass, glassModalOverlayClass } from './glass';
import { cn } from './utils';

export type AppDialogSize = "sm" | "md" | "lg" | "xl" | "wide" | "full";

const SIZE_CLASS: Record<AppDialogSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  wide: "sm:max-w-[1180px]",
  full: "h-[100dvh] max-w-[100vw] rounded-none border-0 sm:h-[96dvh] sm:max-w-[96vw] sm:rounded-lg sm:border xl:max-w-[1500px]",
};

export const appDialogOverlayClassName = cn(
  "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  glassModalOverlayClass,
);

export const appDialogContentClassName = cn(
  "fixed left-1/2 top-1/2 z-50 !flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 !flex-col !gap-0 !overflow-hidden rounded-xl border-0 !p-0 duration-200",
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  glassModalContentClass,
);

export const appDialogHeaderClassName =
  "flex min-h-14 shrink-0 items-start justify-between gap-4 !px-5 !py-4 !pr-14 text-left";
export const appDialogBodyClassName =
  "min-h-0 flex-1 overflow-y-auto px-5 py-4";
export const appDialogFooterClassName =
  "flex shrink-0 flex-col-reverse gap-2 !px-5 !py-4 sm:flex-row sm:justify-end";

export const AppDialog = DialogPrimitive.Root;
export const AppDialogTrigger = DialogPrimitive.Trigger;
export const AppDialogClose = DialogPrimitive.Close;
export const AppDialogPortal = DialogPrimitive.Portal;
export const AppDialogOverlay = DialogPrimitive.Overlay;

export const AppDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    size?: AppDialogSize;
    showCloseButton?: boolean;
    closeActionId?: string;
    closeDisabled?: boolean;
    manualLayout?: boolean;
  }
>(function AppDialogContent({
  className,
  children,
  size = "md",
  showCloseButton = true,
  closeActionId = 'dialog.close',
  closeDisabled = false,
  manualLayout = false,
  onPointerDownOutside,
  onInteractOutside,
  ...props
}, ref) {
  const translate = useTranslation();
  const childNodes = React.Children.toArray(children);
  const hasExplicitBody = childNodes.some(
    (child) => React.isValidElement(child) && child.type === AppDialogBody,
  );
  const arrangedChildren = manualLayout || hasExplicitBody
    ? children
    : (
      <>
        {childNodes.filter((child) => React.isValidElement(child) && child.type === AppDialogHeader)}
        {childNodes.some((child) => (
          !React.isValidElement(child)
          || (child.type !== AppDialogHeader && child.type !== AppDialogFooter)
        )) && (
          <AppDialogBody>
            {childNodes.filter((child) => (
              !React.isValidElement(child)
              || (child.type !== AppDialogHeader && child.type !== AppDialogFooter)
            ))}
          </AppDialogBody>
        )}
        {childNodes.filter((child) => React.isValidElement(child) && child.type === AppDialogFooter)}
      </>
    );
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={appDialogOverlayClassName} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(appDialogContentClassName, SIZE_CLASS[size], className)}
        onPointerDownOutside={onPointerDownOutside}
        onInteractOutside={onInteractOutside}
        {...props}
      >
        {arrangedChildren}
        {showCloseButton && (
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 z-10 h-8 w-8 rounded-md text-[var(--desktop-color-text-muted)] hover:bg-[var(--desktop-color-surface-muted)] hover:text-[var(--desktop-color-text)]"
              aria-label={translate("关闭弹窗")}
              actionId={closeActionId}
              disabled={closeDisabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export function AppDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const translate = useTranslation();
  return <div className={cn(appDialogHeaderClassName, className)} {...props} />;
}

export const AppDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function AppDialogTitle({ className, ...props }, ref) {
  const translate = useTranslation();
  return <DialogPrimitive.Title ref={ref} className={cn("text-base font-normal leading-6 text-[var(--desktop-color-text)]", className)} {...props} />;
});

export const AppDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function AppDialogDescription({ className, ...props }, ref) {
  const translate = useTranslation();
  return <DialogPrimitive.Description ref={ref} className={cn("mt-1 text-sm leading-5 text-[var(--desktop-color-text-muted)]", className)} {...props} />;
});

export const AppDialogBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof InternalScrollArea>
>(function AppDialogBody({ className, ...props }, ref) {
  const translate = useTranslation();
  return <InternalScrollArea ref={ref} className={cn(appDialogBodyClassName, className)} {...props} />;
});

export function AppDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const translate = useTranslation();
  return <div className={cn(appDialogFooterClassName, className)} {...props} />;
}

export function AppDialogAction(props: React.ComponentPropsWithoutRef<typeof Button>) {
  const translate = useTranslation();
  return <Button {...props} />;
}

export function AppDialogCancel(props: React.ComponentPropsWithoutRef<typeof Button>) {
  const translate = useTranslation();
  return <Button variant="ghost" {...props} />;
}

export const AppAlertDialog = AlertDialogPrimitive.Root;
export const AppAlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AppAlertDialogAction = AlertDialogPrimitive.Action;
export const AppAlertDialogCancel = AlertDialogPrimitive.Cancel;

export const AppAlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & { size?: AppDialogSize }
>(function AppAlertDialogContent({ className, size = "sm", ...props }, ref) {
  const translate = useTranslation();
  const childNodes = React.Children.toArray(props.children);
  const arrangedChildren = (
    <>
      {childNodes.filter((child) => React.isValidElement(child) && child.type === AppAlertDialogHeader)}
      {childNodes.some((child) => (
        !React.isValidElement(child)
        || (child.type !== AppAlertDialogHeader && child.type !== AppAlertDialogFooter)
      )) && (
        <AppDialogBody>
          {childNodes.filter((child) => (
            !React.isValidElement(child)
            || (child.type !== AppAlertDialogHeader && child.type !== AppAlertDialogFooter)
          ))}
        </AppDialogBody>
      )}
      {childNodes.filter((child) => React.isValidElement(child) && child.type === AppAlertDialogFooter)}
    </>
  );
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className={appDialogOverlayClassName} />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(appDialogContentClassName, SIZE_CLASS[size], className)}
        {...props}
      >
        {arrangedChildren}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
});

export function AppAlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const translate = useTranslation();
  return <div className={cn(appDialogHeaderClassName, "flex-col", className)} {...props} />;
}

export function AppAlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const translate = useTranslation();
  return <div className={cn(appDialogFooterClassName, className)} {...props} />;
}

export const AppAlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(function AppAlertDialogTitle({ className, ...props }, ref) {
  const translate = useTranslation();
  return <AlertDialogPrimitive.Title ref={ref} className={cn("text-base font-normal leading-6 text-[var(--desktop-color-text)]", className)} {...props} />;
});

export const AppAlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(function AppAlertDialogDescription({ className, ...props }, ref) {
  const translate = useTranslation();
  return <AlertDialogPrimitive.Description ref={ref} className={cn("mt-1 text-sm leading-5 text-[var(--desktop-color-text-muted)]", className)} {...props} />;
});

export type AppConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  destructive?: boolean;
  busy?: boolean;
  confirmActionId?: string;
  cancelActionId?: string;
  onConfirm: () => void | boolean | Promise<void | boolean>;
};

export function AppConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = translate("确定"),
  cancelLabel = translate("取消"),
  destructive = false,
  busy = false,
  confirmActionId = "dialog.confirm",
  cancelActionId = "dialog.cancel",
  onConfirm,
}: AppConfirmDialogProps) {
  const translate = useTranslation();
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");
  const pending = busy || submitting;

  React.useEffect(() => {
    if (!open) {
      setSubmitting(false);
      setSubmitError("");
    }
  }, [open]);

  const changeOpen = (next: boolean) => {
    if (!next && pending) return;
    if (next) setSubmitError("");
    onOpenChange(next);
  };

  const confirm = async () => {
    if (pending) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const result = await onConfirm();
      if (result !== false) onOpenChange(false);
    } catch (error) {
      setSubmitError(error instanceof Error && error.message
        ? error.message
        : translate("操作失败，请重试"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={changeOpen}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className={appDialogOverlayClassName} />
        <AlertDialogPrimitive.Content className={cn(appDialogContentClassName, SIZE_CLASS.sm)}>
          <div className={appDialogHeaderClassName}>
            <div className="min-w-0">
              <AlertDialogPrimitive.Title className="text-base font-normal leading-6 text-[var(--desktop-color-text)]">
                {title}
              </AlertDialogPrimitive.Title>
              {description && (
                <AlertDialogPrimitive.Description className="mt-1 text-sm leading-5 text-[var(--desktop-color-text-muted)]">
                  {description}
                </AlertDialogPrimitive.Description>
              )}
            </div>
          </div>
          {submitError ? (
            <div className="border-b border-[var(--desktop-color-border)] px-5 py-3 text-sm text-[var(--desktop-color-danger)]" role="alert">
              {submitError}
            </div>
          ) : null}
          <div className={appDialogFooterClassName}>
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="ghost" actionId={cancelActionId} disabled={pending}>{cancelLabel}</Button>
            </AlertDialogPrimitive.Cancel>
            <Button
              variant={destructive ? "destructive" : "default"}
              actionId={confirmActionId}
              disabled={pending}
              aria-busy={pending}
              onClick={() => void confirm()}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

// Transitional JSX aliases keep migrations mechanical while every business
// dialog moves onto this single implementation and sizing contract.
export {
  AppDialog as Dialog,
  AppDialogBody as DialogBody,
  AppDialogCancel as DialogCancel,
  AppDialogClose as DialogClose,
  AppDialogContent as DialogContent,
  AppDialogDescription as DialogDescription,
  AppDialogFooter as DialogFooter,
  AppDialogHeader as DialogHeader,
  AppDialogOverlay as DialogOverlay,
  AppDialogPortal as DialogPortal,
  AppDialogTitle as DialogTitle,
  AppDialogTrigger as DialogTrigger,
};
