import { createContext, useContext, type ReactNode } from 'react';

const defaults: Record<string, string> = {
  '没有匹配项': 'No matches', '页面导航': 'Page navigation', '页面导航与操作': 'Page navigation and actions',
  '更多': 'More', '关闭': 'Close', '通知': 'Notifications', '出现问题': 'Something went wrong',
  '关闭弹窗': 'Close dialog', '确定': 'Confirm', '取消': 'Cancel', '操作失败，请重试': 'Operation failed. Try again.',
  '选择日期': 'Select date', '清除日期': 'Clear date', '清除日期 ': 'Clear date', '加载中': 'Loading', '加载中...': 'Loading...',
};
type Translator = (key: string) => string;
let runtime: { translate?: Translator; getLocale?: () => string } = {};
const StringsContext = createContext<{labels: Record<string, string>; locale: string; translate?: Translator}>({labels:defaults,locale:'en'});
/** Optional host bridge for defaults evaluated outside React; no persistence or subscription is owned here. */
export function configureUIRuntime(options: typeof runtime) { runtime = options; }
/** Override the small set of primitive accessibility/default labels without a global locale service. */
export function UIStringsProvider({ labels = {}, locale = 'en', translate, children }: { labels?: Record<string, string>; locale?: string; translate?: Translator; children: ReactNode }) {
  return <StringsContext.Provider value={{labels:{ ...defaults, ...labels },locale,translate}}>{children}</StringsContext.Provider>;
}
export function t(key: string) { return runtime.translate?.(key) ?? defaults[key] ?? key; }
export function useTranslation() { const context = useContext(StringsContext); return (key: string) => context.translate?.(key) ?? runtime.translate?.(key) ?? context.labels[key] ?? key; }
export function useLocale() { return useContext(StringsContext).locale; }
export function currentLocale() { return runtime.getLocale?.() ?? 'en'; }
