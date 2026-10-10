import { useEffect, useImperativeHandle, useMemo, useRef, useState, type CSSProperties, type ReactNode, type Ref, type UIEvent } from "react";
import { listRowGap, listRowInset } from './list-geometry';

export interface FixedVirtualListHandle {
  /** Scroll using the managed content height and row gap, including offscreen rows. */
  scrollToIndex(index: number): void;
}

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
  apiRef?: Ref<FixedVirtualListHandle>;
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
  apiRef,
}: FixedVirtualListProps<T>) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const stride = rowHeight + listRowGap;
  useImperativeHandle(apiRef, () => ({
    scrollToIndex(index) {
      if (!Number.isFinite(index) || !items.length) return;
      const top = Math.max(0, Math.min(items.length - 1, Math.trunc(index))) * stride + listRowGap / 2;
      viewportRef.current?.scrollTo({ top });
      setScrollTop(viewportRef.current?.scrollTop || 0);
    },
  }), [items.length, stride]);

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
    const start = Math.max(0, Math.floor(scrollTop / stride) - overscan);
    const visibleCount = Math.ceil(viewportHeight / stride) + overscan * 2;
    return { start, end: Math.min(items.length, start + visibleCount) };
  }, [items.length, overscan, stride, scrollTop, viewportHeight]);

  useEffect(() => {
    const element = viewportRef.current;
    const restore = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; offset: number; top: number; handled: boolean }>).detail;
      if (!element || !items.length) return;
      const index = items.findIndex((item, i) => String(getItemKey(item, i)) === detail.key);
      const top = Math.max(0, index >= 0 ? index * stride + listRowGap / 2 + detail.offset : detail.top);
      element.scrollTop = top; setScrollTop(element.scrollTop); detail.handled = true;
    };
    element?.addEventListener('desktop:restore-list-anchor', restore);
    return () => element?.removeEventListener('desktop:restore-list-anchor', restore);
  }, [items, getItemKey, stride]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => setScrollTop(event.currentTarget.scrollTop);

  return (
    <div
      ref={viewportRef}
      className={['desktop-internal-scroll', 'desktop-fixed-virtual-list', className].filter(Boolean).join(' ')}
      style={style}
      role="list"
      tabIndex={0}
      aria-label={ariaLabel}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * stride, position: "relative" }}>
        {items.slice(range.start, range.end).map((item, offset) => {
          const index = range.start + offset;
          return (
            <div
              key={getItemKey(item, index)}
              data-desktop-item-key={String(getItemKey(item, index))}
              role="listitem"
              style={{ height: rowHeight, left: listRowInset, position: "absolute", right: listRowInset, top: index * stride + listRowGap / 2 }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
