// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, it, expect, vi } from 'vitest';
import { SettingsNavigation } from './index';
afterEach(cleanup);
it('retains default and caller supplied stable action IDs', () => {
  const select = vi.fn();
  const props = { categories: [{ id: 'general', label: 'General' }], selected: 'general', onSelect: select };
  const { rerender } = render(<SettingsNavigation {...props} />);
  expect(screen.getByRole('button', { name: 'General' }).getAttribute('data-desktop-action')).toBe(
    'settings.category.general',
  );
  rerender(<SettingsNavigation {...props} actionId="mail.settings.section" />);
  const button = screen.getByRole('button', { name: 'General' });
  expect(button.getAttribute('data-desktop-action')).toBe('mail.settings.section.general');
  expect(screen.getByRole('textbox').getAttribute('data-desktop-action')).toBe(
    'mail.settings.section.search',
  );
  button.click();
  expect(select).toHaveBeenCalledWith('general');
});
