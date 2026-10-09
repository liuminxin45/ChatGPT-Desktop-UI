import { useRef } from "react";
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
  appearance = "surface",
  disabled = false,
  className,
  actionId = "segment",
}: {
  value: T;
  items: readonly SegmentedControlItem<T>[];
  onValueChange(value: T): void;
  ariaLabel: string;
  appearance?: "surface" | "underline";
  disabled?: boolean;
  className?: string;
  actionId?: string;
}) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const moveSelection = (currentValue: T, direction: -1 | 1 | "first" | "last") => {
    const enabledItems = items.filter((item) => !disabled && !item.disabled);
    if (!enabledItems.length) return;
    const currentIndex = enabledItems.findIndex((item) => item.value === currentValue);
    const next = direction === "first"
      ? enabledItems[0]
      : direction === "last"
        ? enabledItems.at(-1)!
        : enabledItems[(Math.max(0, currentIndex) + direction + enabledItems.length) % enabledItems.length];
    onValueChange(next.value);
    buttonRefs.current[next.value]?.focus();
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center",
        appearance === "surface"
          ? "h-9 rounded-md bg-[var(--desktop-color-surface-muted)] p-1"
          : "h-12 gap-4",
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <Button
            key={item.value}
            actionId={`${actionId}.${item.value}`}
            ref={(element) => { buttonRefs.current[item.value] = element; }}
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={selected}
            disabled={disabled || item.disabled}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(item.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                moveSelection(item.value, -1);
              } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                moveSelection(item.value, 1);
              } else if (event.key === "Home") {
                event.preventDefault();
                moveSelection(item.value, "first");
              } else if (event.key === "End") {
                event.preventDefault();
                moveSelection(item.value, "last");
              }
            }}
            className={cn(
              "font-normal active:scale-100",
              appearance === "surface"
                ? "h-7 flex-1 px-3 text-xs"
                : "relative h-full rounded-none px-0 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-transparent",
              selected
                ? appearance === "surface"
                  ? "bg-[var(--desktop-color-surface)] text-[var(--desktop-color-text)] shadow-sm hover:bg-[var(--desktop-color-surface)]"
                  : "text-[var(--desktop-color-text)] after:bg-[var(--desktop-color-info)] hover:bg-transparent"
                : "text-[var(--desktop-color-text-muted)] hover:bg-transparent hover:text-[var(--desktop-color-text)]",
            )}
          >
            {item.label}
          </Button>
        );
      })}
    </div>
  );
}
