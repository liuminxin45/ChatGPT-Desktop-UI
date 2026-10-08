import { t as phdT, useTranslation, currentLocale } from '../strings';
import { appDialogContentClassName, appDialogOverlayClassName } from './app-dialog';
import { cn } from './utils';

export function LazyDialogFallback() {
  const phdT = useTranslation();
  return (
    <div
      className={cn(appDialogOverlayClassName, "z-[80]")}
      role="status"
      aria-label={phdT("详情加载中")}
    >
      <div className={cn(appDialogContentClassName, "h-[min(760px,92vh)] w-[min(1100px,94vw)] animate-pulse bg-[var(--phd-color-surface-muted)] p-5")}>
        <div className="h-10 w-2/5 rounded-md bg-[var(--phd-color-surface-selected)]" />
        <div className="mt-5 grid h-[calc(100%-4rem)] gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-md bg-[var(--phd-color-surface-selected)]" />
          <div className="rounded-md bg-[var(--phd-color-surface-selected)]" />
        </div>
      </div>
    </div>
  );
}

export function LazyPanelFallback() {
  const phdT = useTranslation();
  return (
    <div
      className="h-full min-h-64 animate-pulse space-y-4 p-5"
      role="status"
      aria-label={phdT("内容加载中")}
    >
      <div className="h-10 w-2/5 rounded-md bg-[var(--phd-color-surface-selected)]" />
      <div className="h-[calc(100%-3.5rem)] rounded-md bg-[var(--phd-color-surface-selected)]" />
    </div>
  );
}
