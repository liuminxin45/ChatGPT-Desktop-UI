import {
  forwardRef,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { classes } from '../classes';

/** Semantic table. The Host owns column geometry; cells own consistent content insets. */
export const Table = forwardRef<
  HTMLTableElement,
  TableHTMLAttributes<HTMLTableElement> & { density?: 'comfortable' | 'compact' }
>(function Table({ density = 'comfortable', className, ...props }, ref) {
  return (
    <table ref={ref} className={classes('desktop-table', className)} data-density={density} {...props} />
  );
});
export const TableHead = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableHead(props, ref) {
    return <thead ref={ref} {...props} />;
  },
);
export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody(props, ref) {
    return <tbody ref={ref} {...props} />;
  },
);
/** Static grouping: independent links and commands own their feedback, never the row. */
export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  function TableRow(props, ref) {
    return <tr ref={ref} {...props} />;
  },
);
export const TableHeaderCell = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  function TableHeaderCell(props, ref) {
    return <th ref={ref} scope="col" {...props} />;
  },
);
export const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement> & { pinned?: boolean; tone?: 'neutral' | 'warning' }
>(function TableCell({ pinned = false, tone = 'neutral', ...props }, ref) {
  return <td ref={ref} data-pinned={pinned || undefined} data-tone={tone} {...props} />;
});
