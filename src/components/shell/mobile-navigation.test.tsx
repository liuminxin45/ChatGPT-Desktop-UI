// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { AvatarMenu, SettingsPage } from './index';
import { NavigationDrawer } from '../conversation';
import { DesktopProvider } from '../../scoped-surface';
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function media(mobile: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: mobile, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  });
}
it('embedded settings retain their scroll owner and omit duplicate headings', () => {
  render(
    <SettingsPage title="Settings" embedded>
      <button>Preference</button>
    </SettingsPage>,
  );
  expect(screen.queryByRole('heading', { name: 'Settings' })).toBeNull();
  expect(
    screen.getByRole('button', { name: 'Preference' }).closest('[aria-label="Settings"]'),
  ).not.toBeNull();
});
it('navigation retains the same draft node across opening and closing', () => {
  media(true);
  function Fixture() {
    const [open, setOpen] = useState(false);
    return (
      <NavigationDrawer
        open={open}
        onOpenChange={setOpen}
        label="Modules"
        closeLabel="Close navigation"
        navigation={<button onClick={() => setOpen(false)}>Select module</button>}
      >
        <button onClick={() => setOpen(true)}>Open navigation</button>
        <textarea aria-label="Draft" defaultValue="Keep draft" />
      </NavigationDrawer>
    );
  }
  render(<Fixture />);
  const draft = screen.getByLabelText('Draft');
  fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
  expect(screen.getByRole('dialog', { name: 'Modules' })).not.toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Select module' }));
  expect(screen.getByLabelText('Draft')).toBe(draft);
  expect((draft as HTMLTextAreaElement).value).toBe('Keep draft');
});
it('phone appearance replaces its parent panel rather than opening a side submenu', async () => {
  media(true);
  render(
    <DesktopProvider theme="light">
      <AvatarMenu onSettings={() => {}} />
    </DesktopProvider>,
  );
  fireEvent.keyDown(screen.getByRole('button', { name: 'Account' }), { key: 'Enter' });
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Appearance' }));
  expect(screen.getAllByRole('menu')).toHaveLength(1);
  expect(screen.getByRole('menuitemradio', { name: 'Dark' })).not.toBeNull();
  fireEvent.click(screen.getByRole('menuitem', { name: 'Back' }));
  expect(screen.getByRole('menuitem', { name: 'Appearance' })).not.toBeNull();
  expect(screen.queryByRole('menuitemradio')).toBeNull();
});
