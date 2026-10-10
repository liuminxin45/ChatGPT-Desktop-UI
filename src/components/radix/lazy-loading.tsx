import { t as translate, useTranslation, currentLocale } from '../../strings';
import { appDialogContentClassName, appDialogOverlayClassName } from './app-dialog';
import { cn } from './utils';
import { Skeleton } from './skeleton';

export function LazyDialogFallback() {
  const translate = useTranslation();
  return (
    <div className={appDialogOverlayClassName} role="status" aria-label={translate('详情加载中')}>
      <div className={cn(appDialogContentClassName, 'desktop-loading-dialog')}>
        <Skeleton className="desktop-loading-heading" />
        <div className="desktop-loading-content">
          <Skeleton />
        </div>
      </div>
    </div>
  );
}

export function LazyPanelFallback() {
  const translate = useTranslation();
  return (
    <div className="desktop-loading-panel" role="status" aria-label={translate('内容加载中')}>
      <Skeleton className="desktop-loading-heading" />
      <Skeleton className="desktop-loading-content" />
    </div>
  );
}
