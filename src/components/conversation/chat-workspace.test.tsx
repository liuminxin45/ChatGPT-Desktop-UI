// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { AIResponse, ChatAppSurface, ChatHeader, ChatWorkspace } from './index';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('preserves canonical native code copy through a static history presenter', async () => {
  media(false);
  const copy = vi.fn().mockResolvedValue(undefined);
  render(<AIResponse responseId="history-1" content={'```js\nconst saved = true;\n```'} onCopyCode={copy} />);
  fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
  await screen.findByRole('button', { name: 'Copied' });
  expect(copy).toHaveBeenCalledWith('const saved = true;\n');
});
function media(mobile: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: mobile, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  });
}

it('retains the exact sidebar and draft nodes while folding and opening', () => {
  media(false);
  function Fixture() {
    const [open, setOpen] = useState(true);
    return (
      <ChatAppSurface>
        <ChatWorkspace
          sidebarOpen={open}
          onSidebarOpenChange={setOpen}
          sidebarLabel="Conversations"
          closeSidebarLabel="Close conversations"
          sidebar={<input aria-label="Search conversations" defaultValue="saved filter" />}
          header={
            <ChatHeader
              title="Current conversation"
              leading={<button onClick={() => setOpen(!open)}>Toggle sidebar</button>}
            />
          }
        >
          <textarea aria-label="Draft" defaultValue="retained draft" />
        </ChatWorkspace>
      </ChatAppSurface>
    );
  }
  render(<Fixture />);
  const input = screen.getByLabelText('Draft'),
    search = screen.getByLabelText('Search conversations');
  fireEvent.click(screen.getByRole('button', { name: 'Toggle sidebar' }));
  expect(screen.getByLabelText('Draft')).toBe(input);
  expect(screen.getByLabelText('Search conversations')).toBe(search);
  expect(search.closest('aside')?.inert).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Toggle sidebar' }));
  expect(search.closest('aside')?.inert).toBe(false);
  expect((input as HTMLTextAreaElement).value).toBe('retained draft');
});

it('owns mobile modal semantics and respects consumed Escape and IME', () => {
  media(true);
  const change = vi.fn();
  render(
    <ChatWorkspace
      sidebarOpen
      onSidebarOpenChange={change}
      sidebarLabel="Conversations"
      closeSidebarLabel="Close conversations"
      sidebar={<button>Conversation</button>}
    >
      <textarea aria-label="Draft" />
    </ChatWorkspace>,
  );
  const dialog = screen.getByRole('dialog', { name: 'Conversations' });
  expect(dialog.getAttribute('aria-modal')).toBe('true');
  expect(screen.getByLabelText('Draft').parentElement?.inert).toBe(true);
  fireEvent.keyDown(screen.getByRole('button', { name: 'Conversation' }), {
    key: 'Escape',
    isComposing: true,
  });
  expect(change).not.toHaveBeenCalled();
  fireEvent.keyDown(screen.getByRole('button', { name: 'Conversation' }), { key: 'Escape' });
  expect(change).toHaveBeenCalledWith(false);
});

it('does not consume a keyboard event belonging to a nested control', () => {
  media(true);
  const change = vi.fn();
  render(
    <ChatWorkspace
      sidebarOpen
      onSidebarOpenChange={change}
      sidebarLabel="Conversations"
      closeSidebarLabel="Close conversations"
      sidebar={<button onKeyDown={(event) => event.preventDefault()}>Nested menu</button>}
    />,
  );
  fireEvent.keyDown(screen.getByRole('button', { name: 'Nested menu' }), { key: 'Escape' });
  expect(change).not.toHaveBeenCalled();
});
