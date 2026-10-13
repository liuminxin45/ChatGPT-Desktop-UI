// @vitest-environment jsdom
import { useEffect, useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SidebarPanel, type SidebarResizeOptions } from './sidebar-panel';
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  // jsdom has no PointerEvent or layout; actual CSS geometry is tested in test:sidebar.
  vi.stubGlobal(
    'PointerEvent',
    class extends MouseEvent {
      pointerId: number;
      constructor(type: string, options: PointerEventInit = {}) {
        super(type, options);
        this.pointerId = options.pointerId ?? 1;
      }
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const widthToken = (panel: HTMLElement) => panel.style.getPropertyValue('--desktop-sidebar-width');
const options = (overrides: Partial<SidebarResizeOptions> = {}): SidebarResizeOptions => ({
  width: 320,
  minWidth: 240,
  maxWidth: 460,
  label: 'Resize',
  actionId: 'sidebar.resize',
  onChange: vi.fn(),
  onStart: vi.fn(),
  onEnd: vi.fn(),
  ...overrides,
});
function pointerGeometry(panel: HTMLElement, handle: HTMLElement, scale = 1) {
  Object.defineProperty(panel, 'offsetWidth', { configurable: true, value: 320 });
  panel.getBoundingClientRect = () => ({ width: 320 * scale }) as DOMRect;
  let captured: number | undefined;
  Object.assign(handle, {
    setPointerCapture: vi.fn((id: number) => {
      captured = id;
    }),
    hasPointerCapture: (id: number) => captured === id,
    releasePointerCapture: vi.fn(() => {
      captured = undefined;
    }),
  });
}

it('folds at the minimum, restores that width and retains mounted children', () => {
  const start = vi.fn(),
    end = vi.fn(),
    mount = vi.fn(),
    unmount = vi.fn();
  function Child() {
    useEffect(() => {
      mount();
      return () => {
        unmount();
      };
    }, []);
    return <input aria-label="Draft" defaultValue="Keep this draft" />;
  }
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
          <Child />
        </SidebarPanel>
      </>
    );
  }
  render(<Host />);
  const draft = screen.getByRole('textbox'),
    panel = draft.parentElement!;
  const handle = screen.getByRole('separator');
  fireEvent.change(draft, { target: { value: 'Edited draft' } });
  fireEvent.keyDown(handle, { key: 'End' });
  expect(widthToken(panel)).toBe('460px');
  fireEvent.keyDown(handle, { key: 'Home' });
  expect(panel.hidden).toBe(true);
  expect(widthToken(panel)).toBe('240px');
  expect(panel.hasAttribute('inert')).toBe(true);
  expect(handle.tabIndex).toBe(-1);
  fireEvent.click(screen.getByRole('button', { name: 'Expand' }));
  expect(screen.getByRole('textbox')).toBe(draft);
  expect(panel.hidden).toBe(false);
  expect(widthToken(panel)).toBe('240px');
  expect(panel.hasAttribute('inert')).toBe(false);
  expect(handle.tabIndex).toBe(0);
  expect((draft as HTMLInputElement).value).toBe('Edited draft');
  expect(mount).toHaveBeenCalledTimes(1);
  expect(unmount).not.toHaveBeenCalled();
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
  expect(widthToken(panel)).toBe('240px');
  expect(screen.getByRole('separator').getAttribute('aria-valuenow')).toBe('240');
  rerender(<SidebarPanel resize={{ ...resize, width: 700 }}>Navigation</SidebarPanel>);
  expect(widthToken(panel)).toBe('460px');
  expect(screen.getByRole('separator').getAttribute('aria-valuenow')).toBe('460');
  expect(panel.hidden).toBe(false);
  rerender(
    <SidebarPanel hidden resize={{ ...resize, width: 700 }}>
      Navigation
    </SidebarPanel>,
  );
  expect(panel.hidden).toBe(true);
  expect(widthToken(panel)).toBe('460px');
  expect(resize.onChange).not.toHaveBeenCalled();
});

it('requests 10px keyboard changes and leaves width and folding under Host control', () => {
  const resize = options();
  render(<SidebarPanel resize={resize}>Navigation</SidebarPanel>);
  const panel = screen.getByRole('complementary'),
    handle = screen.getByRole('separator');
  Object.defineProperty(panel, 'offsetWidth', { value: 320 });
  for (const key of ['ArrowLeft', 'ArrowRight', 'End', 'Home', 'Enter']) fireEvent.keyDown(handle, { key });
  expect(vi.mocked(resize.onChange).mock.calls).toEqual([
    [310, false],
    [330, false],
    [460, false],
    [240, true],
  ]);
  expect(resize.onStart).toHaveBeenCalledTimes(4);
  expect(vi.mocked(resize.onEnd!).mock.calls).toEqual([[false], [false], [false], [false]]);
  expect(widthToken(panel)).toBe('320px');
  expect(panel.hidden).toBe(false);
});

it('accumulates keyboard steps against the Host target while width is still animating', () => {
  const resize = options();
  const { rerender } = render(<SidebarPanel resize={resize}>Navigation</SidebarPanel>);
  const panel = screen.getByRole('complementary'),
    handle = screen.getByRole('separator');
  Object.defineProperty(panel, 'offsetWidth', { configurable: true, value: 320 });
  fireEvent.keyDown(handle, { key: 'ArrowRight' });
  rerender(<SidebarPanel resize={{ ...resize, width: 330 }}>Navigation</SidebarPanel>);
  // The browser's transition has not reached the newly controlled width yet.
  Object.defineProperty(panel, 'offsetWidth', { value: 321 });
  fireEvent.keyDown(handle, { key: 'ArrowRight' });
  expect(vi.mocked(resize.onChange).mock.calls).toEqual([
    [330, false],
    [340, false],
  ]);
});

it('converts scaled drags to CSS pixels, caps width and finishes once', () => {
  const resize = options();
  render(
    <SidebarPanel id="sidebar" resize={resize}>
      Navigation
    </SidebarPanel>,
  );
  const panel = screen.getByRole('complementary'),
    handle = screen.getByRole('separator');
  pointerGeometry(panel, handle, 1.25);
  expect(handle.getAttribute('aria-controls')).toBe('sidebar');
  fireEvent.pointerDown(handle, { pointerId: 2, button: 2, clientX: 100 });
  expect(resize.onStart).not.toHaveBeenCalled();
  fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 100 });
  expect(panel.getAttribute('data-resizing')).toBe('true');
  fireEvent.pointerMove(handle, { pointerId: 2, clientX: 200 });
  fireEvent.keyDown(handle, { key: 'End' });
  expect(resize.onChange).not.toHaveBeenCalled();
  fireEvent.pointerMove(handle, { pointerId: 1, clientX: 150 });
  fireEvent.pointerMove(handle, { pointerId: 1, clientX: 1000 });
  expect(vi.mocked(resize.onChange).mock.calls).toEqual([
    [360, false],
    [460, false],
  ]);
  fireEvent.pointerUp(handle, { pointerId: 2 });
  expect(resize.onEnd).not.toHaveBeenCalled();
  fireEvent.pointerUp(handle, { pointerId: 1 });
  fireEvent.lostPointerCapture(handle, { pointerId: 1 });
  expect(panel.hasAttribute('data-resizing')).toBe(false);
  expect(vi.mocked(resize.onEnd!).mock.calls).toEqual([[false]]);
});

it.each(['Escape', 'pointercancel', 'lostpointercapture'])(
  'restores the initial width when cancelled by %s',
  (reason) => {
    const resize = options();
    render(<SidebarPanel resize={resize}>Navigation</SidebarPanel>);
    const panel = screen.getByRole('complementary'),
      handle = screen.getByRole('separator');
    pointerGeometry(panel, handle);
    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 100 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 140 });
    if (reason === 'Escape') fireEvent.keyDown(handle, { key: 'Escape' });
    else fireEvent(handle, new PointerEvent(reason, { pointerId: 1, bubbles: true }));
    fireEvent.pointerUp(handle, { pointerId: 1 });
    expect(vi.mocked(resize.onChange).mock.calls).toEqual([
      [360, false],
      [320, false],
    ]);
    expect(vi.mocked(resize.onEnd!).mock.calls).toEqual([[true]]);
    expect(panel.hasAttribute('data-resizing')).toBe(false);
  },
);

it('ends the drag before requesting folding at the minimum', () => {
  const resize = options();
  render(<SidebarPanel resize={resize}>Navigation</SidebarPanel>);
  const panel = screen.getByRole('complementary'),
    handle = screen.getByRole('separator');
  pointerGeometry(panel, handle);
  fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 100 });
  fireEvent.pointerMove(handle, { pointerId: 1, clientX: -100 });
  fireEvent.pointerUp(handle, { pointerId: 1 });
  fireEvent.lostPointerCapture(handle, { pointerId: 1 });
  expect(vi.mocked(resize.onChange).mock.calls).toEqual([[240, true]]);
  expect(vi.mocked(resize.onEnd!).mock.calls).toEqual([[false]]);
  expect(panel.hasAttribute('data-resizing')).toBe(false);
  expect(vi.mocked(resize.onEnd!).mock.invocationCallOrder[0]).toBeLessThan(
    vi.mocked(resize.onChange).mock.invocationCallOrder[0],
  );
});

it.each(['hide', 'scope', 'unmount'])('cancels an active drag when the Host requests %s', (change) => {
  const resize = options({ scopeId: 'first' });
  const { rerender, unmount } = render(<SidebarPanel resize={resize}>Navigation</SidebarPanel>);
  const panel = screen.getByRole('complementary'),
    handle = screen.getByRole('separator');
  pointerGeometry(panel, handle);
  fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 100 });
  fireEvent.pointerMove(handle, { pointerId: 1, clientX: 140 });
  if (change === 'unmount') unmount();
  else
    rerender(
      <SidebarPanel
        hidden={change === 'hide'}
        resize={{ ...resize, scopeId: change === 'scope' ? 'second' : 'first' }}
      >
        Navigation
      </SidebarPanel>,
    );
  expect(vi.mocked(resize.onChange).mock.calls).toEqual([
    [360, false],
    [320, false],
  ]);
  expect(vi.mocked(resize.onEnd!).mock.calls).toEqual([[true]]);
  if (change === 'unmount') expect(panel.isConnected).toBe(false);
  else expect(panel.hasAttribute('data-resizing')).toBe(false);
});
