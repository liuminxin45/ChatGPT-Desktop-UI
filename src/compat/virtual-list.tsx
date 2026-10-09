import {
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { cn } from './utils';
import { InternalScrollArea } from './internal-scroll-area';

export interface VirtualListProps<T> {
  items: readonly T[];
  getItemKey: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  estimateSize: number | ((item: T, index: number) => number);
  ariaLabel: string;
  resetKey?: unknown;
  overscan?: number;
  className?: string;
  contentClassName?: string;
  itemClassName?: string | ((item: T, index: number) => string | undefined);
  role?: "list" | "listbox";
  style?: CSSProperties;
  apiRef?: Ref<VirtualListHandle>;
}

export interface VirtualListHandle {
  scrollToIndex(index: number, align?: "start" | "center" | "end" | "auto"): void;
  getScrollElement(): HTMLDivElement | null;
}
/**
 * Standard internal long-list surface. It owns viewport scrolling, row
 * virtualization, dynamic measurement, overscan, and the shared scrollbar skin.
 */
export function VirtualList<T>({
  items,
  getItemKey,
  renderItem,
  estimateSize,
  ariaLabel,
  resetKey,
  overscan = 8,
  className,
  contentClassName,
  itemClassName,
  role = "list",
  style,
  apiRef,
}: VirtualListProps<T>) {
  "use no memo";

  const scrollRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual owns row measurement; this leaf is excluded from compiler memoization.
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => {
      const item = items[index];
      if (!item) return typeof estimateSize === "number" ? estimateSize : 48;
      return typeof estimateSize === "number"
        ? estimateSize
        : estimateSize(item, index);
    },
    overscan,
    getItemKey: (index) => {
      const item = items[index];
      return item ? getItemKey(item, index) : index;
    },
  });

  useImperativeHandle(apiRef, () => ({
    scrollToIndex(index, align = "auto") {
      virtualizer.scrollToIndex(index, { align });
    },
    getScrollElement() {
      return scrollRef.current;
    },
  }), [virtualizer]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [resetKey]);

  return (
    <InternalScrollArea
      ref={scrollRef}
      role={role}
      aria-label={ariaLabel}
      className={cn("overflow-y-auto", className)}
      style={style}
    >
      <div
        className={cn("relative w-full", contentClassName)}
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          if (!item) return null;
          const rowClassName =
            typeof itemClassName === "function"
              ? itemClassName(item, virtualRow.index)
              : itemClassName;
          return (
            <div
              key={virtualRow.key}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              role={role === "listbox" ? "option" : "listitem"}
              className={cn("absolute left-0 top-0 w-full", rowClassName)}
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </InternalScrollArea>
  );
}
