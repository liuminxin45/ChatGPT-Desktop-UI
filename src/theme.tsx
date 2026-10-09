import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Select } from './controls';
import { InputBehaviorRoot } from './input-behavior';

export type Theme = 'light' | 'dark' | 'system';
const ThemeContext = createContext<{ theme: Theme; setTheme(value: Theme): void }>({ theme: 'system', setTheme() {} });
/** One root per standalone document. Embedded surfaces inherit their host instead. */
export function DesktopRoot({ children, storageKey, defaultTheme = 'system' }: { children: ReactNode; storageKey?: string; defaultTheme?: Theme }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (!storageKey || typeof localStorage === 'undefined') return defaultTheme;
    try { const value = localStorage.getItem(storageKey); return value === 'dark' || value === 'light' || value === 'system' ? value : defaultTheme; }
    catch { return defaultTheme; }
  });
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const previousDark = document.documentElement.classList.contains('dark');
    const previousScheme = document.documentElement.style.colorScheme;
    const apply = () => { const dark = theme === 'dark' || (theme === 'system' && media.matches); document.documentElement.classList.toggle('dark', dark); document.documentElement.style.colorScheme = dark ? 'dark' : 'light'; };
    apply(); media.addEventListener('change', apply);
    if (storageKey) { try { localStorage.setItem(storageKey, theme); } catch { /* Preferences cannot block the UI. */ } }
    return () => { media.removeEventListener('change', apply); document.documentElement.classList.toggle('dark', previousDark); document.documentElement.style.colorScheme = previousScheme; };
  }, [theme, storageKey]);
  return <ThemeContext.Provider value={{ theme, setTheme }}><InputBehaviorRoot><div className="phd-desktop-surface">{children}</div></InputBehaviorRoot></ThemeContext.Provider>;
}
export function useDesktopTheme() { return useContext(ThemeContext); }

/** Backward-compatible name; the root and its context have one implementation. */
export const DesktopSurface = DesktopRoot;
export function DesktopThemeSelect({ onAction, labels = {appearance:'Appearance',system:'System',light:'Light',dark:'Dark'} }: {
  onAction?(outcome: 'exposed' | 'invoked'): void;
  labels?: {appearance:string;system:string;light:string;dark:string};
}) {
  const {theme,setTheme}=useDesktopTheme();
  useEffect(()=>{onAction?.('exposed');},[]);
  return <Select actionId="appearance.theme" aria-label={labels.appearance} className="phd-desktop-theme" value={theme}
    options={(['system','light','dark'] as const).map(value=>({value,label:labels[value]}))}
    onValueChange={value=>{setTheme(value as Theme);onAction?.('invoked');}}/>;
}
