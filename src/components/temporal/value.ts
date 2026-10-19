export type TemporalMode = 'date' | 'month' | 'datetime-local';

const pad = (value: number) => String(value).padStart(2, '0');

/** Calendar values are local wall time. Never round-trip through UTC/ISO strings. */
export function temporalValue(date: Date, mode: TemporalMode): string {
  const month = `${String(date.getFullYear()).padStart(4, '0')}-${pad(date.getMonth() + 1)}`;
  if (mode === 'month') return month;
  const day = `${month}-${pad(date.getDate())}`;
  return mode === 'date' ? day : `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseTemporal(value: string, mode: TemporalMode): Date | undefined {
  const patterns = {
    month: /^\d{4}-\d{2}$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
    'datetime-local': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
  };
  if (!patterns[mode].test(value)) return undefined;
  const [year, month, day = 1, hour = 0, minute = 0] = value.split(/[-T:]/).map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(hour, minute, 0, 0);
  return year >= 1 && temporalValue(date, mode) === value ? date : undefined;
}

export function validTemporal(value: string, mode: TemporalMode, min?: string, max?: string) {
  return Boolean(parseTemporal(value, mode)) && (!min || value >= min) && (!max || value <= max);
}
