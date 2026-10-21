// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, it, expect } from 'vitest';
import { Surface } from './index';
afterEach(cleanup);
it('outlined read-only previews retain document semantics and native text nodes', () => {
  const { rerender } = render(
    <Surface variant="outlined" role="region" aria-label="Preview">
      <p>Selectable text</p>
      <a href="#source">Source</a>
    </Surface>,
  );
  const panel = screen.getByRole('region', { name: 'Preview' });
  expect(panel.tagName).toBe('DIV');
  expect(panel.classList.contains('desktop-ui-surface--outlined')).toBe(true);
  expect(panel.querySelector('input,textarea,[contenteditable]')).toBeNull();
  expect(screen.getByRole('link').getAttribute('href')).toBe('#source');
  rerender(
    <Surface role="region" aria-label="Preview">
      Default
    </Surface>,
  );
  expect(screen.getByRole('region').classList.contains('desktop-ui-surface--outlined')).toBe(false);
});
