'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { enUS, zhCN } from 'date-fns/locale';
import { useTranslation, useLocale } from '../../strings';

import { cn } from './utils';
import { buttonVariants } from './button';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const locale = useLocale();
  const t = useTranslation();
  return (
    <DayPicker
      locale={locale === 'zh-CN' ? zhCN : enUS}
      labels={{ labelPrevious: () => t('Previous month'), labelNext: () => t('Next month') }}
      showOutsideDays={showOutsideDays}
      className={cn('desktop-calendar', className)}
      classNames={{
        months: 'desktop-calendar-months',
        month: 'desktop-calendar-month',
        caption: 'desktop-calendar-caption',
        caption_label: 'desktop-calendar-caption-label',
        nav: 'desktop-calendar-nav',
        nav_button: buttonVariants({ variant: 'ghost', size: 'icon' }),
        nav_button_previous: 'desktop-calendar-prev',
        nav_button_next: 'desktop-calendar-next',
        table: 'desktop-calendar-table',
        head_row: 'desktop-calendar-row',
        head_cell: 'desktop-calendar-head',
        row: 'desktop-calendar-row',
        cell: 'desktop-calendar-cell',
        day: cn(buttonVariants({ variant: 'ghost' }), 'desktop-calendar-day'),
        day_range_start: 'desktop-calendar-range-start',
        day_range_end: 'desktop-calendar-range-end',
        day_selected: 'desktop-calendar-selected',
        day_today: 'desktop-calendar-today',
        day_outside: 'desktop-calendar-outside',
        day_disabled: 'desktop-calendar-disabled',
        day_range_middle: 'desktop-calendar-range-middle',
        day_hidden: 'desktop-calendar-hidden',
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn('desktop-control-glyph', className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn('desktop-control-glyph', className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
