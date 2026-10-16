import { t as translate, useTranslation, useLocale } from '../../strings';
import * as React from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

import { cn } from './utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ToolVisibilityContext } from '../../surface-visibility';

export interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  actionId?: string;
  id?: string;
  'aria-label'?: string;
  disabled?: boolean;
  /** Required day navigation can omit the clear command without a Host CSS override. */
  clearable?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  className = '',
  triggerClassName = '',
  actionId = 'date-picker',
  id,
  'aria-label': ariaLabel,
  disabled = false,
  clearable = true,
}: DatePickerProps) {
  const translate = useTranslation();
  const locale = useLocale();
  const [isOpen, setIsOpen] = React.useState(false);
  const visible = React.useContext(ToolVisibilityContext);
  React.useEffect(() => {
    if (!visible || disabled) setIsOpen(false);
  }, [visible, disabled]);

  return (
    <div className={cn('desktop-date-picker', className)}>
      <Popover open={isOpen && visible && !disabled} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            aria-label={ariaLabel ?? translate('选择日期')}
            disabled={disabled}
            actionId={`${actionId}.open`}
            variant="outline"
            size="sm"
            className={cn('desktop-date-picker-trigger', !value && 'desktop-muted', triggerClassName)}
          >
            <CalendarIcon className="desktop-control-glyph" />
            <span className="desktop-date-picker-value">
              {value
                ? format(value, 'PP', { locale: locale === 'zh-CN' ? zhCN : enUS })
                : placeholder || translate('选择日期')}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          aria-label={ariaLabel ?? translate('选择日期')}
          className="desktop-date-picker-popover"
          align="start"
        >
          <Calendar
            mode="single"
            selected={value}
            defaultMonth={value}
            onSelect={(date) => {
              onChange(date);
              setIsOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {value && clearable && (
        <Button
          variant="ghost"
          size="icon"
          className="desktop-date-picker-clear"
          actionId={`${actionId}.clear`}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onChange(undefined);
          }}
          aria-label={translate('清除日期')}
        >
          <X className="desktop-control-glyph" />
        </Button>
      )}
    </div>
  );
}
