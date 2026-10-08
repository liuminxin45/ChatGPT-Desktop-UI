import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type UIEvent } from "react";

export interface FixedVirtualListProps<T> {
  items: readonly T[];
  rowHeight: number;
  getItemKey: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  ariaLabel: string;
  className?: string;
  overscan?: number;
  resetKey?: unknown;
  style?: CSSProperties;
}

/** Dependency-free virtual list for isolated Tool UIs with fixed-height rows. */
export function FixedVirtualList<T>({
  items,
  rowHeight,
  getItemKey,
  renderItem,
  ariaLabel,
  className,
  overscan = 6,
  resetKey,
  style,
}: FixedVirtualListProps<T>) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const update = () => setViewportHeight(viewport.clientHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: 0 });
    setScrollTop(0);
  }, [resetKey]);

  const range = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleCount = Math.ceil(viewportHeight / rowHeight) + overscan * 2;
    return { start, end: Math.min(items.length, start + visibleCount) };
  }, [items.length, overscan, rowHeight, scrollTop, viewportHeight]);

  useEffect(() => {
    const element = viewportRef.current;
    const restore = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; offset: number; top: number; handled: boolean }>).detail;
      if (!element || !items.length) return;
      const index = items.findIndex((item, i) => String(getItemKey(item, i)) === detail.key);
      const top = Math.max(0, index >= 0 ? index * rowHeight + detail.offset : detail.top);
      element.scrollTop = top; setScrollTop(element.scrollTop); detail.handled = true;
    };
    element?.addEventListener('phd:restore-list-anchor', restore);
    return () => element?.removeEventListener('phd:restore-list-anchor', restore);
  }, [items, getItemKey, rowHeight]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => setScrollTop(event.currentTarget.scrollTop);

  return (
    <div
      ref={viewportRef}
      className={className}
      style={{ overflowY: "auto", scrollbarGutter: "stable", ...style }}
      role="list"
      aria-label={ariaLabel}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * rowHeight, position: "relative" }}>
        {items.slice(range.start, range.end).map((item, offset) => {
          const index = range.start + offset;
          return (
            <div
              key={getItemKey(item, index)}
              data-phd-item-key={String(getItemKey(item, index))}
              role="listitem"
              style={{ height: rowHeight, left: 0, position: "absolute", right: 0, top: index * rowHeight }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
