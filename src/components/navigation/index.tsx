import { useRef, type ReactNode } from 'react';
import { useTranslation } from '../../strings';
import { nextEnabledTabIndex } from '../../tab-navigation';

export interface TabsItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  tabId?: string;
  panelId?: string;
}

export function Tabs({
  value,
  items,
  onValueChange,
  ariaLabel,
  actionId = 'tabs',
}: {
  value: string;
  items: TabsItem[];
  onValueChange(value: string): void;
  ariaLabel?: string;
  actionId?: string;
}) {
  const translate = useTranslation();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = items.findIndex((item) => item.value === value && !item.disabled);
  const activeIndex = selectedIndex >= 0 ? selectedIndex : items.findIndex((item) => !item.disabled);
  return (
    <div
      className="desktop-tabs"
      role="tablist"
      aria-label={ariaLabel ?? translate('页面导航')}
      aria-orientation="horizontal"
    >
      {items.map((item, index) => (
        <button
          key={item.value}
          ref={(element) => {
            tabRefs.current[index] = element;
          }}
          id={item.tabId}
          type="button"
          role="tab"
          tabIndex={index === activeIndex ? 0 : -1}
          data-desktop-action={`${actionId}.${item.value}`}
          aria-selected={item.value === value}
          aria-controls={item.panelId}
          disabled={item.disabled}
          onClick={() => onValueChange(item.value)}
          onKeyDown={(event) => {
            const nextIndex = nextEnabledTabIndex(items, index, event.key);
            if (
              nextIndex < 0 ||
              nextIndex === index ||
              !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
            )
              return;
            event.preventDefault();
            tabRefs.current[nextIndex]?.focus();
            onValueChange(items[nextIndex].value);
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
