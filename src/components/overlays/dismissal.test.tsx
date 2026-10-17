// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { DismissalLayerProvider } from '../../dismissal';
import { Dialog } from './index';

afterEach(cleanup);

it('dismisses the child opened in the same commit before its parent and keeps the draft', async () => {
  const layers: Array<() => void> = [];
  const registerLayer = (dismiss: () => void) => {
    layers.push(dismiss);
    return () => {
      const index = layers.indexOf(dismiss);
      if (index >= 0) layers.splice(index, 1);
    };
  };
  function Fixture() {
    const [parent, setParent] = useState(true),
      [child, setChild] = useState(true);
    return (
      <DismissalLayerProvider registerLayer={registerLayer}>
        <Dialog open={parent} title="Parent editor" onClose={() => setParent(false)}>
          <textarea aria-label="Draft" defaultValue="Keep this draft" />
          <Dialog open={child} title="Child chooser" onClose={() => setChild(false)}>
            Choose later
          </Dialog>
        </Dialog>
      </DismissalLayerProvider>
    );
  }
  render(<Fixture />);
  await waitFor(() => expect(layers).toHaveLength(2));
  act(() => layers.at(-1)!());
  await waitFor(() => expect(screen.queryByText('Child chooser')).toBeNull());
  expect(screen.getByRole('textbox', { name: 'Draft' })).toHaveProperty('value', 'Keep this draft');
  expect(layers).toHaveLength(1);
  act(() => layers.at(-1)!());
  await waitFor(() => expect(layers).toHaveLength(0));
  expect(screen.queryByText('Parent editor')).toBeNull();
});

it('does not leave a host layer behind when the surface unmounts', async () => {
  let count = 0;
  const view = render(
    <DismissalLayerProvider
      registerLayer={() => {
        count++;
        return () => count--;
      }}
    >
      <Dialog open title="Temporary editor" onClose={() => {}}>
        Temporary body
      </Dialog>
    </DismissalLayerProvider>,
  );
  await waitFor(() => expect(count).toBe(1));
  view.unmount();
  expect(count).toBe(0);
});
