"use client";

import * as React from "react";
import { buttonVariants } from './button';
import { cn } from './utils';
import {
  AppAlertDialog as AlertDialog,
  AppAlertDialogAction,
  AppAlertDialogCancel,
  AppAlertDialogContent as AlertDialogContent,
  AppAlertDialogDescription as AlertDialogDescription,
  AppAlertDialogFooter as AlertDialogFooter,
  AppAlertDialogHeader as AlertDialogHeader,
  AppAlertDialogTitle as AlertDialogTitle,
  AppAlertDialogTrigger as AlertDialogTrigger,
} from './app-dialog';

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AppAlertDialogAction>,
  React.ComponentPropsWithoutRef<typeof AppAlertDialogAction>
>(({ className, ...props }, ref) => (
  <AppAlertDialogAction ref={ref} className={cn(buttonVariants(), className)} {...props} />
));
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AppAlertDialogCancel>,
  React.ComponentPropsWithoutRef<typeof AppAlertDialogCancel>
>(({ className, ...props }, ref) => (
  <AppAlertDialogCancel ref={ref} className={cn(buttonVariants({ variant: "ghost" }), className)} {...props} />
));
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
