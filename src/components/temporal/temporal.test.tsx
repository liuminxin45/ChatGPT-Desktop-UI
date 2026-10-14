// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemporalPicker } from './index';
import { parseTemporal, temporalValue, validTemporal } from './value';

afterEach(cleanup);
describe('local calendar values', () => {
  it('rejects impossible dates and preserves leap days and local minutes', () => {
    expect(parseTemporal('2025-02-29', 'date')).toBeUndefined();
    expect(parseTemporal('2024-02-29', 'date')).toBeDefined();
    expect(parseTemporal('2026-13', 'month')).toBeUndefined();
    expect(parseTemporal('2026-10-14T24:00', 'datetime-local')).toBeUndefined();
    const date = parseTemporal('2026-12-31T23:59', 'datetime-local')!;
    expect(date.getHours()).toBe(23);
    expect(temporalValue(date, 'datetime-local')).toBe('2026-12-31T23:59');
    expect(temporalValue(parseTemporal('0001-01-01', 'date')!, 'date')).toBe('0001-01-01');
  });
  it('enforces inclusive month, day and minute limits', () => {
    expect(validTemporal('2026-10', 'month', '2026-10', '2026-12')).toBe(true);
    expect(validTemporal('2026-09', 'month', '2026-10')).toBe(false);
    expect(validTemporal('2026-10-14T08:29', 'datetime-local', '2026-10-14T08:30')).toBe(false);
    expect(validTemporal('2026-10-14T08:30', 'datetime-local', '2026-10-14T08:30')).toBe(true);
  });
});
describe('popup selection', () => {
  it('commits months once and prevents opening disabled and read-only controls', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <TemporalPicker
        actionId="test.month"
        aria-label="Month filter"
        value="2026-10"
        mode="month"
        onValueChange={change}
        min="2026-10"
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Month filter' }));
    await user.click(screen.getByRole('button', { name: 'Nov', exact: true }));
    expect(change).toHaveBeenCalledExactlyOnceWith('2026-11');
    cleanup();
    for (const state of [{ disabled: true }, { readOnly: true }]) {
      render(
        <TemporalPicker
          {...state}
          actionId="test.disabled"
          aria-label="Locked"
          value="2026-10"
          mode="month"
          onValueChange={change}
        />,
      );
      await user.click(screen.getByRole('button', { name: 'Locked' }));
      expect(screen.queryByRole('button', { name: 'Nov', exact: true })).toBeNull();
      cleanup();
    }
  });
});
