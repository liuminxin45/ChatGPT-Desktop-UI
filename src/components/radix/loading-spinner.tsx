import { t as translate, useTranslation } from '../../strings';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({
  message = translate('加载中...'),
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  useTranslation();
  return (
    <div className={`desktop-loading-spinner ${className}`} data-size={size}>
      <Loader2 aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
