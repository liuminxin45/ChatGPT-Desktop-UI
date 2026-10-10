'use client';

import { t as translate, useTranslation, currentLocale } from '../../strings';
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { X } from 'lucide-react';

import { Button } from './button';
import { InternalScrollArea } from './internal-scroll-area';
import { cn } from './utils';

export type AppDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'wide' | 'full';

export const appDialogOverlayClassName = 'desktop-app-dialog-backdrop';
export const appDialogContentClassName = 'desktop-app-dialog';
export const appDialogHeaderClassName = 'desktop-app-dialog-header';
export const appDialogBodyClassName = 'desktop-app-dialog-body';
export const appDialogFooterClassName = 'desktop-app-dialog-footer';

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
>(function AppDialogContent(
  {
    className,
    children,
    size = 'md',
    showCloseButton = true,
    closeActionId = 'dialog.close',
    closeDisabled = false,
    manualLayout = false,
    onPointerDownOutside,
    onInteractOutside,
    ...props
  },
  ref,
) {
  const translate = useTranslation();
  const childNodes = React.Children.toArray(children);
  const hasExplicitBody = childNodes.some(
    (child) => React.isValidElement(child) && child.type === AppDialogBody,
  );
  const arrangedChildren =
    manualLayout || hasExplicitBody ? (
      children
    ) : (
      <>
        {childNodes.filter((child) => React.isValidElement(child) && child.type === AppDialogHeader)}
        {childNodes.some(
          (child) =>
            !React.isValidElement(child) ||
            (child.type !== AppDialogHeader && child.type !== AppDialogFooter),
        ) && (
          <AppDialogBody>
            {childNodes.filter(
              (child) =>
                !React.isValidElement(child) ||
                (child.type !== AppDialogHeader && child.type !== AppDialogFooter),
            )}
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
        data-size={size}
        className={cn(appDialogContentClassName, className)}
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
              className="desktop-app-dialog-close"
              aria-label={translate('关闭弹窗')}
              actionId={closeActionId}
              disabled={closeDisabled}
            >
              <X className="desktop-control-glyph" />
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
  return <DialogPrimitive.Title ref={ref} className={cn('desktop-app-dialog-title', className)} {...props} />;
});

export const AppDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function AppDialogDescription({ className, ...props }, ref) {
  const translate = useTranslation();
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('desktop-app-dialog-description', className)}
      {...props}
    />
  );
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
>(function AppAlertDialogContent({ className, size = 'sm', ...props }, ref) {
  const translate = useTranslation();
  const childNodes = React.Children.toArray(props.children);
  const arrangedChildren = (
    <>
      {childNodes.filter((child) => React.isValidElement(child) && child.type === AppAlertDialogHeader)}
      {childNodes.some(
        (child) =>
          !React.isValidElement(child) ||
          (child.type !== AppAlertDialogHeader && child.type !== AppAlertDialogFooter),
      ) && (
        <AppDialogBody>
          {childNodes.filter(
            (child) =>
              !React.isValidElement(child) ||
              (child.type !== AppAlertDialogHeader && child.type !== AppAlertDialogFooter),
          )}
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
        data-size={size}
        className={cn(appDialogContentClassName, className)}
        {...props}
      >
        {arrangedChildren}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
});

export function AppAlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const translate = useTranslation();
  return (
    <div className={cn(appDialogHeaderClassName, 'desktop-alert-dialog-header', className)} {...props} />
  );
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
  return (
    <AlertDialogPrimitive.Title ref={ref} className={cn('desktop-app-dialog-title', className)} {...props} />
  );
});

export const AppAlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(function AppAlertDialogDescription({ className, ...props }, ref) {
  const translate = useTranslation();
  return (
    <AlertDialogPrimitive.Description
      ref={ref}
      className={cn('desktop-app-dialog-description', className)}
      {...props}
    />
  );
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
  confirmLabel = translate('确定'),
  cancelLabel = translate('取消'),
  destructive = false,
  busy = false,
  confirmActionId = 'dialog.confirm',
  cancelActionId = 'dialog.cancel',
  onConfirm,
}: AppConfirmDialogProps) {
  const translate = useTranslation();
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const pending = busy || submitting;

  React.useEffect(() => {
    if (!open) {
      setSubmitting(false);
      setSubmitError('');
    }
  }, [open]);

  const changeOpen = (next: boolean) => {
    if (!next && pending) return;
    if (next) setSubmitError('');
    onOpenChange(next);
  };

  const confirm = async () => {
    if (pending) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await onConfirm();
      if (result !== false) onOpenChange(false);
    } catch (error) {
      setSubmitError(error instanceof Error && error.message ? error.message : translate('操作失败，请重试'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={changeOpen}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className={appDialogOverlayClassName} />
        <AlertDialogPrimitive.Content className={appDialogContentClassName} data-size="sm">
          <div className={appDialogHeaderClassName}>
            <div className="desktop-app-dialog-copy">
              <AlertDialogPrimitive.Title className="desktop-app-dialog-title">
                {title}
              </AlertDialogPrimitive.Title>
              {description && (
                <AlertDialogPrimitive.Description className="desktop-app-dialog-description">
                  {description}
                </AlertDialogPrimitive.Description>
              )}
            </div>
          </div>
          {submitError ? (
            <div className="desktop-confirm-error" role="alert">
              {submitError}
            </div>
          ) : null}
          <div className={appDialogFooterClassName}>
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="ghost" actionId={cancelActionId} disabled={pending}>
                {cancelLabel}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <Button
              variant={destructive ? 'destructive' : 'default'}
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
