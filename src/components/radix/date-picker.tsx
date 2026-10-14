'use client';
import { TemporalPicker } from '../temporal';
import { parseTemporal, temporalValue } from '../temporal/value';
import { useTranslation } from '../../strings';
import { cn } from './utils';

export interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  actionId?: string;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  'aria-label'?: string;
}

/** Compatibility preserves the Date API; rendering belongs to the shared picker. */
export function DatePicker({
  value,
  onChange,
  className,
  triggerClassName,
  actionId = 'date-picker',
  ...props
}: DatePickerProps) {
  const t = useTranslation();
  return (
    <div className={cn('desktop-date-picker', className)}>
      <TemporalPicker
        {...props}
        size="sm"
        className={triggerClassName}
        actionId={actionId}
        triggerActionId={`${actionId}.open`}
        aria-label={props['aria-label'] || props.placeholder || t('选择日期')}
        value={value && !Number.isNaN(value.getTime()) ? temporalValue(value, 'date') : ''}
        onValueChange={(next) => onChange(parseTemporal(next, 'date'))}
      />
    </div>
  );
}
