// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Slider } from './index';

it('exposes a labelled continuous native range and forwards live values', () => {
  const change = vi.fn();
  const { rerender } = render(
    <Slider aria-label="Direction" value={35} onValueChange={change} aria-valuetext="35 percent scene" />,
  );
  const range = screen.getByRole('slider');
  expect(range.getAttribute('min')).toBe('0');
  expect(range.getAttribute('max')).toBe('100');
  expect(range.getAttribute('aria-valuetext')).toBe('35 percent scene');
  fireEvent.change(range, { target: { value: '72' } });
  expect(change).toHaveBeenCalledWith(72);
  rerender(<Slider aria-label="Direction" value={72} onValueChange={change} disabled />);
  expect((range as HTMLInputElement).disabled).toBe(true);
});
