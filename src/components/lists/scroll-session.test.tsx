// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { VirtualList } from './index';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('changes a Host scroll session without replacing the list viewport', () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  const scroll = HTMLElement.prototype.scrollTo;
  HTMLElement.prototype.scrollTo = function () {};
  try {
    const props = {
      items: [{ id: 'one' }],
      getItemKey: (item: { id: string }) => item.id,
      renderItem: (item: { id: string }) => <span>{item.id}</span>,
      estimateSize: 32,
    };
    const { rerender } = render(
      <VirtualList {...props} ariaLabel="Projects" scrollSession={{ key: 'projects' }} />,
    );
    const viewport = screen.getByRole('list', { name: 'Projects' });
    rerender(<VirtualList {...props} ariaLabel="Tasks" scrollSession={{ key: 'tasks' }} />);
    expect(screen.getByRole('list', { name: 'Tasks' })).toBe(viewport);
    rerender(<VirtualList {...props} ariaLabel="Projects" scrollSession={{ key: 'projects' }} />);
    expect(screen.getByRole('list', { name: 'Projects' })).toBe(viewport);
  } finally {
    HTMLElement.prototype.scrollTo = scroll;
  }
});
