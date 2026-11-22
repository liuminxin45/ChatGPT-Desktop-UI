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
    <div
      className={`desktop-loading-spinner ${className}`.trim()}
      data-size={size}
      data-has-message={Boolean(message) || undefined}
    >
      {message ? (
        <span className="desktop-ai-activity desktop-ai-activity--active">{message}</span>
      ) : (
        <Loader2 aria-hidden="true" />
      )}
    </div>
  );
}
