'use client';

import * as React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, DayButton, useDayPicker, type MonthCaptionProps } from 'react-day-picker';
import { enUS, zhCN } from 'date-fns/locale';
import { useTranslation, useLocale } from '../../strings';

import { cn } from './utils';
import { buttonVariants } from './button';
import { Select } from '../forms';

type CalendarComponents = NonNullable<React.ComponentProps<typeof DayPicker>['components']> & {
  IconLeft?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  IconRight?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};
export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  components?: CalendarComponents;
  actionId?: string;
};

const CalendarActionContext = React.createContext('calendar');

function CalendarCaption({ calendarMonth, displayIndex, children: _children, ...props }: MonthCaptionProps) {
  const { goToMonth, dayPickerProps } = useDayPicker();
  const locale = useLocale();
  const t = useTranslation();
  const actionId = React.useContext(CalendarActionContext);
  const date = calendarMonth.date;
  const year = date.getFullYear();
  const from = dayPickerProps.startMonth?.getFullYear() ?? Math.max(1, year - 100);
  const to = dayPickerProps.endMonth?.getFullYear() ?? Math.min(9999, year + 100);
  return (
    <div {...props}>
      <Select
        size="sm"
        className="desktop-calendar-month-select"
        aria-label={t('月份')}
        actionId={`${actionId}.month`}
        value={String(date.getMonth())}
        options={Array.from({ length: 12 }, (_, month) => ({
          value: String(month),
          label: new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(2024, month, 1)),
          disabled: Boolean(
            (dayPickerProps.startMonth && new Date(year, month + 1, 0) < dayPickerProps.startMonth) ||
              (dayPickerProps.endMonth && new Date(year, month, 1) > dayPickerProps.endMonth),
          ),
        }))}
        onValueChange={(month) => {
          const next = new Date(date);
          next.setMonth(Number(month));
          next.setMonth(next.getMonth() - displayIndex);
          goToMonth(next);
        }}
      />
      <Select
        size="sm"
        className="desktop-calendar-year-select"
        aria-label={t('年份')}
        actionId={`${actionId}.year`}
        value={String(year)}
        options={Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => ({
          value: String(from + index),
          label: String(from + index),
        }))}
        onValueChange={(nextYear) => {
          const next = new Date(date);
          next.setFullYear(Number(nextYear));
          next.setMonth(next.getMonth() - displayIndex);
          goToMonth(next);
        }}
      />
    </div>
  );
}

function CalendarDay(props: React.ComponentProps<typeof DayButton>) {
  const actionId = React.useContext(CalendarActionContext);
  return <DayButton {...props} data-desktop-action={`${actionId}.select`} />;
}

function Calendar({
  className,
  classNames,
  components,
  actionId = 'calendar',
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const locale = useLocale();
  const t = useTranslation();
  const aliases = {
    caption: 'month_caption',
    nav_button_previous: 'button_previous',
    nav_button_next: 'button_next',
    table: 'month_grid',
    head_row: 'weekdays',
    head_cell: 'weekday',
    row: 'week',
    cell: 'day',
    day: 'day_button',
    day_selected: 'selected',
    day_today: 'today',
    day_outside: 'outside',
    day_disabled: 'disabled',
    day_hidden: 'hidden',
    day_range_start: 'range_start',
    day_range_end: 'range_end',
    day_range_middle: 'range_middle',
  } as const;
  const overrides = { ...classNames };
  for (const [legacy, modern] of Object.entries(aliases)) {
    const value = classNames?.[legacy as keyof typeof classNames];
    if (
      value !== undefined &&
      (modern === 'day' || classNames?.[modern as keyof typeof classNames] === undefined)
    )
      overrides[modern as keyof typeof overrides] = value;
  }
  return (
    <CalendarActionContext.Provider value={actionId}>
      <DayPicker
        locale={locale === 'zh-CN' ? zhCN : enUS}
        labels={{ labelPrevious: () => t('Previous month'), labelNext: () => t('Next month') }}
        showOutsideDays={showOutsideDays}
        className={cn('desktop-calendar', className)}
        classNames={{
          months: 'desktop-calendar-months',
          month: 'desktop-calendar-month',
          month_caption: 'desktop-calendar-caption',
          caption_label: 'desktop-calendar-caption-label',
          nav: 'desktop-calendar-nav',
          button_previous: cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'desktop-calendar-prev'),
          button_next: cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'desktop-calendar-next'),
          month_grid: 'desktop-calendar-table',
          weekdays: 'desktop-calendar-row',
          weekday: 'desktop-calendar-head',
          week: 'desktop-calendar-row',
          day: 'desktop-calendar-cell',
          day_button: cn(buttonVariants({ variant: 'ghost' }), 'desktop-calendar-day'),
          range_start: 'desktop-calendar-range-start',
          range_end: 'desktop-calendar-range-end',
          selected: 'desktop-calendar-selected',
          today: 'desktop-calendar-today',
          outside: 'desktop-calendar-outside',
          disabled: 'desktop-calendar-disabled',
          range_middle: 'desktop-calendar-range-middle',
          hidden: 'desktop-calendar-hidden',
          ...overrides,
        }}
        components={{
          MonthCaption: CalendarCaption,
          DayButton: CalendarDay,
          PreviousMonthButton: (buttonProps) => (
            <button {...buttonProps} type="button" data-desktop-action={`${actionId}.previous-month`} />
          ),
          NextMonthButton: (buttonProps) => (
            <button {...buttonProps} type="button" data-desktop-action={`${actionId}.next-month`} />
          ),
          Chevron: ({ className, orientation }) => {
            const Icon =
              orientation === 'left'
                ? (components?.IconLeft ?? ChevronLeft)
                : orientation === 'right'
                  ? (components?.IconRight ?? ChevronRight)
                  : ChevronDown;
            return <Icon className={cn('desktop-control-glyph', className)} />;
          },
          ...components,
        }}
        {...props}
      />
    </CalendarActionContext.Provider>
  );
}

export { Calendar };
