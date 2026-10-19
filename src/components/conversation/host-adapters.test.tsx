// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ComposerSurface } from './index';
import { Markdown } from '../feedback';
import { Tabs } from '../navigation';

afterEach(cleanup);

it('composes shared input geometry without taking draft or keyboard ownership', () => {
  const changed = vi.fn();
  render(
    <ComposerSurface aria-label="Draft">
      <textarea aria-label="Message" onChange={changed} defaultValue="retained" />
      <button>Attachment</button>
    </ComposerSurface>,
  );
  const input = screen.getByLabelText('Message');
  fireEvent.change(input, { target: { value: 'edited' } });
  expect(changed).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('Draft').className).toContain('desktop-composer-surface');
});

it('copies canonical fenced code through the native Host callback and reports failures', async () => {
  const copy = vi.fn().mockResolvedValue(undefined);
  const view = render(
    <Markdown variant="ai" onCopyCode={copy}>
      {'```js\nconst text = "<tag>";\n```'}
    </Markdown>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
  await screen.findByRole('button', { name: 'Copied' });
  expect(copy).toHaveBeenCalledWith('const text = "<tag>";\n');
  view.unmount();
  render(
    <Markdown
      variant="ai"
      onCopyCode={async () => {
        throw Error('denied');
      }}
    >
      {'```\nretained\n```'}
    </Markdown>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
  await screen.findByRole('button', { name: 'Copy unavailable' });
  expect(screen.getByLabelText('Code').textContent).toBe('retained\n');
});

it('supports equal-width navigation while preserving tab keyboard selection', () => {
  const select = vi.fn();
  render(
    <Tabs
      stretch
      value="one"
      items={[
        { value: 'one', label: 'One' },
        { value: 'two', label: 'Two' },
      ]}
      onValueChange={select}
    />,
  );
  expect(screen.getByRole('tablist').getAttribute('data-stretch')).toBe('true');
  fireEvent.keyDown(screen.getByRole('tab', { name: 'One' }), { key: 'ArrowRight' });
  expect(select).toHaveBeenCalledWith('two');
});
