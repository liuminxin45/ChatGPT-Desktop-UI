'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../actions';
import { Select } from '../forms';
import { Calendar } from '../radix/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../radix/popover';
import { useLocale, useTranslation } from '../../strings';
import { ToolVisibilityContext } from '../../surface-visibility';
import { classes } from '../classes';
import { parseTemporal, temporalValue, validTemporal, type TemporalMode } from './value';
export type { TemporalMode } from './value';

export interface TemporalPickerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onChange' | 'size'> {
  /** Local date/month/wall-time string; empty string represents no selection. */
  value: string;
  onValueChange(value: string): void;
  mode?: TemporalMode;
  min?: string;
  max?: string;
  readOnly?: boolean;
  clearable?: boolean;
  required?: boolean;
  name?: string;
  placeholder?: string;
  size?: 'sm' | 'md';
  actionId: string;
  /** Compatibility adapters may retain a distinct historical trigger action. */
  triggerActionId?: string;
}

/** Shared popup-only selection. Datetime edits commit only on explicit confirmation. */
export const TemporalPicker = React.forwardRef<HTMLButtonElement, TemporalPickerProps>(
  function TemporalPicker(
    {
      value,
      onValueChange,
      mode = 'date',
      min,
      max,
      readOnly = false,
      clearable = true,
      required = false,
      name,
      placeholder,
      size = 'md',
      actionId,
      triggerActionId,
      disabled,
      className,
      onClick,
      ...props
    },
    ref,
  ) {
    const locale = useLocale();
    const t = useTranslation();
    const visible = React.useContext(ToolVisibilityContext);
    const [open, setOpen] = React.useState(false);
    const popup = React.useRef<HTMLDivElement>(null);
    const [draft, setDraft] = React.useState(value);
    const [year, setYear] = React.useState(() => (parseTemporal(value, mode) ?? new Date()).getFullYear());
    const blocked = disabled || readOnly;
    // Hidden retained Tools must never leave a popup active in another destination.
    React.useEffect(() => {
      if (!visible || blocked) setOpen(false);
    }, [visible, blocked]);
    const selected = parseTemporal(value, mode);
    const draftDate = parseTemporal(draft, mode);
    const today = new Date();
    const todayValue = temporalValue(today, mode);
    const commit = (next: string) => {
      if (blocked || (next ? !validTemporal(next, mode, min, max) : !clearable || required)) return;
      setOpen(false);
      if (next !== value) onValueChange(next);
    };
    const changeOpen = (next: boolean) => {
      if (next && !blocked) {
        let initial = value || todayValue;
        if (min && initial < min) initial = min;
        if (max && initial > max) initial = max;
        setDraft(initial);
        setYear((parseTemporal(initial, mode) ?? today).getFullYear());
      }
      setOpen(next && !blocked);
    };
    const chooseDay = (date: Date | undefined) => {
      if (!date) return;
      const day = temporalValue(date, 'date');
      if (mode === 'date') commit(day);
      else setDraft(`${day}T${draft.split('T')[1] || '00:00'}`);
    };
    const dayMin = min && parseTemporal(min.slice(0, 10), 'date');
    const dayMax = max && parseTemporal(max.slice(0, 10), 'date');
    const time = draft.split('T')[1] || '00:00';
    const timeValue = (hour: string, minute: string) => `${draft.slice(0, 10)}T${hour}:${minute}`;
    const hours =
      mode === 'datetime-local'
        ? Array.from({ length: 24 }, (_, hour) => {
            const hh = String(hour).padStart(2, '0');
            return {
              value: hh,
              label: hh,
              disabled: !Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, '0')).some(
                (mm) => validTemporal(timeValue(hh, mm), mode, min, max),
              ),
            };
          })
        : [];
    const minutes =
      mode === 'datetime-local'
        ? Array.from({ length: 60 }, (_, minute) => {
            const mm = String(minute).padStart(2, '0');
            return {
              value: mm,
              label: mm,
              disabled: !validTemporal(timeValue(time.slice(0, 2), mm), mode, min, max),
            };
          })
        : [];
    const label = selected
      ? new Intl.DateTimeFormat(
          locale,
          mode === 'month'
            ? { year: 'numeric', month: 'long' }
            : {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                ...(mode === 'datetime-local'
                  ? { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' as const }
                  : {}),
              },
        ).format(selected)
      : value ||
        placeholder ||
        t(mode === 'month' ? '选择月份' : mode === 'datetime-local' ? '选择日期时间' : '选择日期');
    return (
      <div className="desktop-temporal-picker" data-desktop-surface="temporal-picker">
        {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
        <Popover open={open} onOpenChange={changeOpen}>
          <PopoverTrigger asChild>
            <Button
              {...props}
              ref={ref}
              layout="row"
              disabled={disabled}
              size={size}
              className={classes('desktop-temporal-trigger', !value && 'desktop-muted', className)}
              actionId={triggerActionId || actionId}
              aria-readonly={readOnly || undefined}
              aria-required={required || undefined}
              icon={<CalendarIcon aria-hidden="true" className="desktop-control-glyph" />}
              onClick={(event) => {
                onClick?.(event);
                if (blocked) event.preventDefault();
              }}
            >
              <span className="desktop-temporal-value">{label}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            ref={popup}
            align="start"
            collisionPadding={12}
            className="desktop-temporal-popover"
            aria-label={props['aria-label'] || t('选择日期')}
            onOpenAutoFocus={(event) => {
              if (mode !== 'month') return;
              const target =
                popup.current?.querySelector<HTMLButtonElement>(
                  '.desktop-temporal-months button[aria-pressed="true"]:not(:disabled)',
                ) ||
                popup.current?.querySelector<HTMLButtonElement>(
                  '.desktop-temporal-months button:not(:disabled)',
                );
              if (target) {
                event.preventDefault();
                target.focus();
              }
            }}
            data-desktop-input-scope
            data-desktop-surface="temporal-picker.popup"
            onKeyDown={(event) => {
              // Portal events still bubble through React: never submit a parent editor.
              if (event.key === 'Enter' || event.key === 'Escape') event.stopPropagation();
            }}
          >
            {mode === 'month' ? (
              <>
                <div className="desktop-temporal-heading">
                  <Button
                    size="sm"
                    iconOnly
                    icon={<ChevronLeft />}
                    actionId={`${actionId}.previous-year`}
                    aria-label={t('上一年')}
                    disabled={year <= 1 || Boolean(min && year <= Number(min.slice(0, 4)))}
                    onClick={() => setYear(year - 1)}
                  />
                  <Select
                    size="sm"
                    aria-label={t('年份')}
                    actionId={`${actionId}.year`}
                    value={String(year)}
                    onValueChange={(next) => setYear(Number(next))}
                    options={Array.from({ length: 201 }, (_, index) => year - 100 + index)
                      .filter(
                        (y) =>
                          y >= 1 &&
                          y <= 9999 &&
                          (!min || y >= Number(min.slice(0, 4))) &&
                          (!max || y <= Number(max.slice(0, 4))),
                      )
                      .map((y) => ({ value: String(y), label: String(y) }))}
                  />
                  <Button
                    size="sm"
                    iconOnly
                    icon={<ChevronRight />}
                    actionId={`${actionId}.next-year`}
                    aria-label={t('下一年')}
                    disabled={year >= 9999 || Boolean(max && year >= Number(max.slice(0, 4)))}
                    onClick={() => setYear(year + 1)}
                  />
                </div>
                <div
                  className="desktop-temporal-months"
                  role="group"
                  aria-label={t('月份')}
                  onKeyDown={(event) => {
                    const offsets: Record<string, number> = {
                      ArrowLeft: -1,
                      ArrowRight: 1,
                      ArrowUp: -4,
                      ArrowDown: 4,
                      Home: -12,
                      End: 12,
                    };
                    if (!(event.key in offsets)) return;
                    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button')];
                    let index = buttons.indexOf(event.target as HTMLButtonElement);
                    if (index < 0) return;
                    event.preventDefault();
                    const offset = offsets[event.key];
                    index = event.key === 'Home' ? -1 : event.key === 'End' ? 12 : index;
                    const step = event.key === 'Home' ? 1 : event.key === 'End' ? -1 : offset < 0 ? -1 : 1;
                    index = event.key === 'Home' ? 0 : event.key === 'End' ? 11 : index + offset;
                    while (index >= 0 && index < 12 && buttons[index].disabled) index += step;
                    buttons[index]?.focus();
                  }}
                >
                  {Array.from({ length: 12 }, (_, month) => {
                    const date = new Date(0);
                    date.setFullYear(year, month, 1);
                    const monthValue = temporalValue(date, 'month');
                    const monthLabel = new Intl.DateTimeFormat(locale, { month: 'short' }).format(date);
                    return (
                      <Button
                        key={month}
                        variant="ghost"
                        size="sm"
                        actionId={`${actionId}.select`}
                        disabled={!validTemporal(monthValue, mode, min, max)}
                        aria-pressed={value === monthValue}
                        data-current={temporalValue(today, 'month') === monthValue || undefined}
                        onClick={() => commit(monthValue)}
                      >
                        {monthLabel}
                      </Button>
                    );
                  })}
                </div>
              </>
            ) : (
              <Calendar
                mode="single"
                selected={mode === 'date' ? selected : draftDate}
                defaultMonth={draftDate ?? selected ?? today}
                onSelect={chooseDay}
                initialFocus
                actionId={actionId}
                startMonth={dayMin || undefined}
                endMonth={dayMax || undefined}
                disabled={(date) => Boolean((dayMin && date < dayMin) || (dayMax && date > dayMax))}
              />
            )}
            {mode === 'datetime-local' && (
              <div className="desktop-temporal-time">
                <label>
                  <span>{t('小时')}</span>
                  <Select
                    size="sm"
                    actionId={`${actionId}.hour`}
                    aria-label={t('小时')}
                    value={time.slice(0, 2)}
                    options={hours}
                    onValueChange={(hour) => setDraft(timeValue(hour, time.slice(3, 5)))}
                  />
                </label>
                <span aria-hidden="true">:</span>
                <label>
                  <span>{t('分钟')}</span>
                  <Select
                    size="sm"
                    actionId={`${actionId}.minute`}
                    aria-label={t('分钟')}
                    value={time.slice(3, 5)}
                    options={minutes}
                    onValueChange={(minute) => setDraft(timeValue(time.slice(0, 2), minute))}
                  />
                </label>
              </div>
            )}
            <div className="desktop-temporal-footer">
              <Button
                variant="ghost"
                size="sm"
                actionId={`${actionId}.today`}
                disabled={!validTemporal(todayValue, mode, min, max)}
                onClick={() => (mode === 'datetime-local' ? setDraft(todayValue) : commit(todayValue))}
              >
                {t(mode === 'month' ? '本月' : '今天')}
              </Button>
              {clearable && !required && value && (
                <Button variant="ghost" size="sm" actionId={`${actionId}.clear`} onClick={() => commit('')}>
                  {t('清除日期')}
                </Button>
              )}
              {mode === 'datetime-local' && (
                <div className="desktop-temporal-confirm">
                  <Button
                    variant="ghost"
                    size="sm"
                    actionId={`${actionId}.cancel`}
                    onClick={() => setOpen(false)}
                  >
                    {t('取消')}
                  </Button>
                  <Button
                    size="sm"
                    actionId={`${actionId}.confirm`}
                    disabled={!validTemporal(draft, mode, min, max)}
                    onClick={() => commit(draft)}
                  >
                    {t('确定')}
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);
