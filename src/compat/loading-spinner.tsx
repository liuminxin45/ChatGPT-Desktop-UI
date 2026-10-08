import { t as phdT, useTranslation } from '../strings';
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  message = phdT("加载中..."),
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  useTranslation();
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-[var(--phd-color-info)]`} />
      <span className={`${textSizeClasses[size]} text-[var(--phd-color-text-muted)]`}>
        {message}
      </span>
    </div>
  );
}
