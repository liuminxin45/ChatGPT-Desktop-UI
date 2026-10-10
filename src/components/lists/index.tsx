import { useVirtualizer } from '@tanstack/react-virtual';
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { classes } from '../classes';
import { listRowGap, listRowInset } from '../../list-geometry';

export const internalScrollAreaClassName = 'desktop-internal-scroll';

/** Static record grouping. Put navigation, selection and commands on separate controls. */
export const RecordRow = forwardRef<
  HTMLDivElement,
  Omit<HTMLAttributes<HTMLDivElement>, 'onClick' | 'onKeyDown' | 'tabIndex' | 'role'> & {
    tabIndex?: -1;
    role?: 'group' | 'listitem';
  }
>(function RecordRow({ className, ...props }, ref) {
  return <div ref={ref} className={classes('desktop-record-row', className)} {...props} />;
});

/** Spaced rows for short lists; compose inside InternalScrollArea when scrolling is needed. */
export const ListStack = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ListStack(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={classes('desktop-list-stack', className)} {...props} />;
});

export const InternalScrollArea = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function InternalScrollArea({ className, ...props }, ref) {
    return <div ref={ref} className={classes(internalScrollAreaClassName, className)} {...props} />;
  },
);

export interface VirtualListScrollAnchor {
  key: string;
  offset: number;
  top: number;
}

export interface VirtualListProps<T> {
  initialScrollAnchor?: VirtualListScrollAnchor | null;
  onScrollAnchorChange?: (anchor: VirtualListScrollAnchor) => void;
  /** Sticky column headings share the viewport gutter and content inset with their records. */
  header?: ReactNode;
  items: readonly T[];
  getItemKey(item: T, index: number): string | number;
  renderItem(item: T, index: number): ReactNode;
  estimateSize: number | ((item: T, index: number) => number);
  ariaLabel: string;
  resetKey?: unknown;
  overscan?: number;
  className?: string;
  contentClassName?: string;
  itemClassName?: string | ((item: T, index: number) => string | undefined);
  role?: 'list' | 'listbox';
  style?: CSSProperties;
}

export function VirtualList<T>({
  initialScrollAnchor,
  onScrollAnchorChange,
  header,
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
  role = 'list',
  style,
}: VirtualListProps<T>) {
  'use no memo';
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef(initialScrollAnchor);
  const restoringRef = useRef(false);
  const resetRef = useRef(resetKey);
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const element = headerRef.current;
    if (!element) {
      setHeaderHeight(0);
      return;
    }
    const measure = () => setHeaderHeight(element.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [Boolean(header)]);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => {
      const item = items[index];
      return item && typeof estimateSize === 'function'
        ? estimateSize(item, index)
        : typeof estimateSize === 'number'
          ? estimateSize
          : 48;
    },
    overscan,
    gap: listRowGap,
    paddingStart: listRowGap / 2,
    paddingEnd: listRowGap / 2,
    scrollMargin: headerHeight,
    getItemKey: (index) => (items[index] ? getItemKey(items[index], index) : index),
  });
  useEffect(() => {
    if (Object.is(resetRef.current, resetKey)) return;
    resetRef.current = resetKey;
    anchorRef.current = null;
    scrollRef.current?.scrollTo({ top: 0 });
  }, [resetKey]);
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || !items.length) return;
    const index = items.findIndex((item, i) => String(getItemKey(item, i)) === anchor.key);
    const offset = index >= 0 ? virtualizer.getOffsetForIndex(index, 'start')?.[0] : anchor.top;
    if (offset === undefined) return;
    restoringRef.current = true;
    virtualizer.scrollToOffset(Math.max(0, offset + (index >= 0 ? anchor.offset : 0)));
    // Mount and measure the target before settling; estimates can differ from its real height.
    let frame = 0;
    let attempts = 0;
    const settle = () => {
      const row = virtualizer.getVirtualItems().find((item) => item.index === index);
      if (row) virtualizer.scrollToOffset(Math.max(0, row.start + anchor.offset));
      if (++attempts < 3) frame = requestAnimationFrame(settle);
      else restoringRef.current = false;
    };
    frame = requestAnimationFrame(settle);
    return () => {
      cancelAnimationFrame(frame);
      restoringRef.current = false;
    };
  }, [items, headerHeight]);
  useEffect(() => {
    const element = scrollRef.current;
    const restore = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; offset: number; top: number; handled: boolean }>)
        .detail;
      if (!items.length) return;
      const index = items.findIndex((item, i) => String(getItemKey(item, i)) === detail.key);
      const offset = index >= 0 ? virtualizer.getOffsetForIndex(index, 'start')?.[0] : detail.top;
      if (offset === undefined) return;
      virtualizer.scrollToOffset(Math.max(0, offset + (index >= 0 ? detail.offset : 0)));
      detail.handled = true;
    };
    element?.addEventListener('desktop:restore-list-anchor', restore);
    return () => element?.removeEventListener('desktop:restore-list-anchor', restore);
  }, [items, getItemKey, virtualizer]);
  return (
    <InternalScrollArea
      ref={scrollRef}
      role={role}
      tabIndex={0}
      aria-label={ariaLabel}
      className={classes('desktop-virtual-list', className)}
      style={style}
      onScroll={(event) => {
        if (restoringRef.current) return;
        const top = event.currentTarget.scrollTop;
        const row = virtualizer.getVirtualItems().find((item) => item.end > top + headerHeight);
        if (!row) return;
        const anchor = { key: String(row.key), offset: top - row.start, top };
        anchorRef.current = anchor;
        onScrollAnchorChange?.(anchor);
      }}
    >
      {header ? (
        <div ref={headerRef} className="desktop-virtual-list__header">
          {header}
        </div>
      ) : null}
      <div
        className={classes('desktop-virtual-list__content', contentClassName)}
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((row) => {
          const item = items[row.index];
          if (!item) return null;
          return (
            <div
              key={row.key}
              ref={virtualizer.measureElement}
              data-index={row.index}
              data-desktop-item-key={String(getItemKey(item, row.index))}
              role={role === 'listbox' ? 'option' : 'listitem'}
              className={classes(
                'desktop-virtual-list__item',
                typeof itemClassName === 'function' ? itemClassName(item, row.index) : itemClassName,
              )}
              style={{ transform: `translateY(${row.start - headerHeight}px)`, paddingInline: listRowInset }}
            >
              {renderItem(item, row.index)}
            </div>
          );
        })}
      </div>
    </InternalScrollArea>
  );
}
