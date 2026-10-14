// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SidebarPanel } from './sidebar-panel';
beforeEach(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  ),
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('folds at the minimum, restores that width and retains mounted children', () => {
  const start = vi.fn(),
    end = vi.fn();
  function Host() {
    const [width, setWidth] = useState(320),
      [hidden, setHidden] = useState(false);
    return (
      <>
        <button onClick={() => setHidden(false)}>Expand</button>
        <SidebarPanel
          hidden={hidden}
          resize={{
            width,
            minWidth: 240,
            maxWidth: 460,
            label: 'Resize',
            actionId: 'sidebar.resize',
            onStart: start,
            onEnd: end,
            onChange: (value, collapsed) => {
              setWidth(value);
              setHidden(collapsed);
            },
          }}
        >
          <input aria-label="Draft" defaultValue="Keep this draft" />
        </SidebarPanel>
      </>
    );
  }
  render(<Host />);
  const draft = screen.getByRole('textbox'),
    panel = draft.parentElement!;
  const handle = screen.getByRole('separator');
  fireEvent.keyDown(handle, { key: 'End' });
  expect(panel.style.getPropertyValue('--desktop-sidebar-width')).toBe('460px');
  fireEvent.keyDown(handle, { key: 'Home' });
  expect(panel.hidden).toBe(true);
  expect(panel.style.getPropertyValue('--desktop-sidebar-width')).toBe('240px');
  fireEvent.click(screen.getByRole('button', { name: 'Expand' }));
  expect(screen.getByRole('textbox')).toBe(draft);
  expect(panel.hidden).toBe(false);
  expect(panel.style.getPropertyValue('--desktop-sidebar-width')).toBe('240px');
  expect(start).toHaveBeenCalledTimes(2);
  expect(end.mock.calls).toEqual([[false], [false]]);
});

it('bounds externally restored widths without changing the Host fold state', () => {
  const resize = {
    width: 180,
    minWidth: 240,
    maxWidth: 460,
    label: 'Resize',
    actionId: 'sidebar.resize',
    onChange: vi.fn(),
  };
  const { rerender } = render(<SidebarPanel resize={resize}>Navigation</SidebarPanel>);
  const panel = screen.getByRole('complementary');
  expect(panel.style.getPropertyValue('--desktop-sidebar-width')).toBe('240px');
  expect(screen.getByRole('separator').getAttribute('aria-valuenow')).toBe('240');
  rerender(<SidebarPanel resize={{ ...resize, width: 700 }}>Navigation</SidebarPanel>);
  expect(panel.style.getPropertyValue('--desktop-sidebar-width')).toBe('460px');
  expect(resize.onChange).not.toHaveBeenCalled();
});
