// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComposerActionButton, type ComposerActionButtonProps } from './index';

afterEach(cleanup);

for (const layout of ['command', 'row', 'tile', 'surface'] as const)
  for (const state of ['ready', 'sending', 'stoppable', 'stopping'] as const)
    it(`preserves ${state} behavior when untyped callers pass ${layout}`, async () => {
      const onSend = vi.fn();
      const onStop = vi.fn();
      render(
        <ComposerActionButton
          {...({ layout } as unknown as Partial<ComposerActionButtonProps>)}
          state={state}
          actionId="test.composer"
          onSend={onSend}
          onStop={onStop}
        />,
      );
      const button = screen.getByRole('button') as HTMLButtonElement;
      expect(button.classList.contains('desktop-button')).toBe(true);
      expect(button.classList.contains('desktop-surface-action')).toBe(false);
      expect(button.classList.contains('desktop-button--row')).toBe(false);
      expect(button.classList.contains('desktop-button--tile')).toBe(false);
      expect(button.disabled).toBe(state === 'sending' || state === 'stopping');
      await userEvent.click(button);
      expect(onSend).toHaveBeenCalledTimes(state === 'ready' ? 1 : 0);
      expect(onStop).toHaveBeenCalledTimes(state === 'stoppable' ? 1 : 0);
    });

it('keeps Stop available for an empty next draft', () => {
  render(
    <ComposerActionButton
      state="stoppable"
      sendDisabled
      actionId="test.stop"
      onSend={() => {}}
      onStop={() => {}}
    />,
  );
  expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(false);
});
