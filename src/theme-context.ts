import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export const DesktopThemeContext = createContext<{ theme: Theme; setTheme(value: Theme): void }>({
  theme: 'system',
  setTheme() {},
});
export function useDesktopThemeContext() {
  return useContext(DesktopThemeContext);
}
