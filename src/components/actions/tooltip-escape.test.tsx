// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './index';
import {
  AppDialog,
  AppDialogBody,
  AppDialogContent,
  AppDialogHeader,
  AppDialogTitle,
} from '../radix/app-dialog';

afterEach(cleanup);
function Fixture() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open viewer</Button>
      <AppDialog open={open} onOpenChange={setOpen}>
        <AppDialogContent aria-describedby={undefined}>
          <AppDialogHeader>
            <AppDialogTitle>Viewer</AppDialogTitle>
          </AppDialogHeader>
          <AppDialogBody>
            <Button aria-label="Zoom out" tooltip="Mouse wheel also changes zoom">
              Zoom out
            </Button>
          </AppDialogBody>
        </AppDialogContent>
      </AppDialog>
    </>
  );
}
it('one original Escape dismisses a focus tooltip and its dialog, restoring the opening action', async () => {
  render(<Fixture />);
  const user = userEvent.setup();
  const trigger = screen.getByRole('button', { name: 'Open viewer' });
  await user.click(trigger);
  await screen.findByRole('tooltip');
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});
it('IME Escape leaves both the dialog and descriptive tooltip open', async () => {
  render(<Fixture />);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Open viewer' }));
  await screen.findByRole('tooltip');
  fireEvent.keyDown(screen.getByRole('button', { name: 'Zoom out' }), { key: 'Escape', isComposing: true });
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(screen.getByRole('tooltip')).toBeTruthy();
});
