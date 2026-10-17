// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ComposerQueue, ComposerModelControl, ComposerPermissionSelect } from './composer-tools';
afterEach(cleanup);
it('renders static queue records with independent commands; blank space does nothing', () => {
  const steer = vi.fn(),
    remove = vi.fn(),
    edit = vi.fn();
  render(
    <ComposerQueue
      items={[{ id: 'one', text: 'Retained queued message', onSteer: steer, onRemove: remove, onEdit: edit }]}
    />,
  );
  fireEvent.click(screen.getByText('Retained queued message'));
  expect(steer).not.toHaveBeenCalled();
  expect(remove).not.toHaveBeenCalled();
  expect(edit).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Steer', exact: true }));
  expect(steer).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Remove message', exact: true }));
  expect(remove).toHaveBeenCalledTimes(1);
});
it('never fabricates edit or steer capability, and bounds the inline preview', () => {
  const edit = vi.fn(),
    steer = vi.fn();
  render(
    <ComposerQueue
      onViewAll={vi.fn()}
      items={Array.from({ length: 9 }, (_, i) => ({
        id: String(i),
        text: 'Queued ' + i,
        onEdit: edit,
        onSteer: steer,
        steerDisabled: true,
        editDisabled: true,
      }))}
    />,
  );
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
  fireEvent.click(screen.getAllByRole('button', { name: 'Steer', exact: true })[0]);
  expect(steer).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'View all queued messages' })).toBeTruthy();
});
it('displays both model values without hiding selected permission from accessibility', () => {
  render(
    <>
      <ComposerModelControl
        model={{ 'aria-label': 'Model', value: 'sol', options: [{ value: 'sol', label: 'GPT-6.1 Sol' }] }}
        effort={{
          'aria-label': 'Reasoning',
          value: 'high',
          options: [{ value: 'high', label: 'Extra High' }],
        }}
      />
      <ComposerPermissionSelect
        aria-label="Permissions"
        value="full"
        risk="elevated"
        options={[{ value: 'full', label: 'Full access' }]}
      />
    </>,
  );
  expect(screen.getByRole('combobox', { name: 'Model' }).textContent).toContain('GPT-6.1 Sol');
  expect(screen.getByRole('combobox', { name: 'Reasoning' }).textContent).toContain('Extra High');
  expect(screen.getByRole('combobox', { name: 'Permissions' }).textContent).toContain('Full access');
});
