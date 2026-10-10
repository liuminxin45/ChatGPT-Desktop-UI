import { useRef } from 'react';
import { Button } from './button';
import { cn } from './utils';

export type SegmentedControlItem<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export function SegmentedControl<T extends string>({
  value,
  items,
  onValueChange,
  ariaLabel,

  disabled = false,
  className,
  actionId = 'segment',
}: {
  value: T;
  items: readonly SegmentedControlItem<T>[];
  onValueChange(value: T): void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  actionId?: string;
}) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const moveSelection = (currentValue: T, direction: -1 | 1 | 'first' | 'last') => {
    const enabledItems = items.filter((item) => !disabled && !item.disabled);
    if (!enabledItems.length) return;
    const currentIndex = enabledItems.findIndex((item) => item.value === currentValue);
    const next =
      direction === 'first'
        ? enabledItems[0]
        : direction === 'last'
          ? enabledItems.at(-1)!
          : enabledItems[(Math.max(0, currentIndex) + direction + enabledItems.length) % enabledItems.length];
    onValueChange(next.value);
    buttonRefs.current[next.value]?.focus();
  };

  return (
    <div role="group" aria-label={ariaLabel} className={cn('desktop-segments', className)}>
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <Button
            key={item.value}
            actionId={`${actionId}.${item.value}`}
            ref={(element) => {
              buttonRefs.current[item.value] = element;
            }}
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={selected}
            disabled={disabled || item.disabled}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(item.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                moveSelection(item.value, -1);
              } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                moveSelection(item.value, 1);
              } else if (event.key === 'Home') {
                event.preventDefault();
                moveSelection(item.value, 'first');
              } else if (event.key === 'End') {
                event.preventDefault();
                moveSelection(item.value, 'last');
              }
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </div>
  );
}
