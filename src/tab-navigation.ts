export type TabNavigationItem = { disabled?: boolean };

export function nextEnabledTabIndex(
  items: readonly TabNavigationItem[],
  currentIndex: number,
  key: string,
): number {
  const enabled = items.flatMap((item, index) => item.disabled ? [] : [index]);
  if (!enabled.length) return -1;
  if (key === 'Home') return enabled[0];
  if (key === 'End') return enabled.at(-1)!;
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') return currentIndex;
  const position = enabled.indexOf(currentIndex);
  const base = position >= 0 ? position : 0;
  const direction = key === 'ArrowRight' ? 1 : -1;
  return enabled[(base + direction + enabled.length) % enabled.length];
}
