// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { ActionTooltip } from '../../action-tooltip';
afterEach(cleanup);
it('suppressed hints immediately relinquish their layer even with an exit animation', async () => {
  function Fixture() {
    const [suppressed, setSuppressed] = useState(false);
    return (
      <>
        <style>
          {
            '.desktop-tooltip[data-state="delayed-open"],.desktop-tooltip[data-state="instant-open"]{animation-name:hint-in}.desktop-tooltip[data-state="closed"]{animation-name:hint-out;animation-duration:10s}'
          }
        </style>
        <ActionTooltip label="Hint" suppressed={suppressed}>
          <button>Action</button>
        </ActionTooltip>
        <button onClick={() => setSuppressed(true)}>Open next surface</button>
      </>
    );
  }
  render(<Fixture />);
  fireEvent.focus(screen.getByRole('button', { name: 'Action' }));
  await screen.findByRole('tooltip', { name: 'Hint' });
  fireEvent.click(screen.getByRole('button', { name: 'Open next surface' }));
  expect(screen.queryByRole('tooltip', { hidden: true })).toBeNull();
});
