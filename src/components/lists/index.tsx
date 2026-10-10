import { useVirtualizer } from '@tanstack/react-virtual';
import {
  forwardRef,
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { classes } from '../classes';
import { listRowGap, listRowInset } from '../../list-geometry';

export const internalScrollAreaClassName = 'desktop-internal-scroll';

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

export interface VirtualListProps<T> {
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
    getItemKey: (index) => (items[index] ? getItemKey(items[index], index) : index),
  });
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [resetKey]);
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
    >
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
              style={{ transform: `translateY(${row.start}px)`, paddingInline: listRowInset }}
            >
              {renderItem(item, row.index)}
            </div>
          );
        })}
      </div>
    </InternalScrollArea>
  );
}
