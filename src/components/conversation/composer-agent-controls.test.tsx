// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ComposerModelPicker, ComposerGoal, PlanReview } from './composer-agent-controls';
afterEach(cleanup);
it('exposes one acknowledged model/effort target without selecting or submitting on render', () => {
  const model = vi.fn(),
    effort = vi.fn();
  render(
    <ComposerModelPicker
      model="sol"
      effort="high"
      models={[{ value: 'sol', label: 'Sol' }]}
      efforts={[{ value: 'high', label: 'High' }]}
      onModelChange={model}
      onEffortChange={effort}
    />,
  );
  expect(screen.getByRole('button', { name: 'Select effort' }).textContent).toContain('SolHigh');
  expect(screen.queryByRole('combobox')).toBeNull();
  expect(model).not.toHaveBeenCalled();
  expect(effort).not.toHaveBeenCalled();
});
it('goal metadata and whitespace are inert; independent controls expose actual outcomes', () => {
  const edit = vi.fn(),
    pause = vi.fn(),
    remove = vi.fn();
  render(
    <ComposerGoal
      objective="Complete outcome"
      statusLabel="Pursuing goal"
      elapsed="3m 30s"
      onEdit={edit}
      onPause={pause}
      onRemove={remove}
    />,
  );
  fireEvent.click(screen.getByText('Pursuing goal'));
  expect(edit).not.toHaveBeenCalled();
  expect(pause).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Pause goal' }));
  expect(pause).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: 'Remove goal' }));
  expect(remove).toHaveBeenCalledOnce();
});
it('a proposed plan is readable but never executes without an explicit enabled command', () => {
  const run = vi.fn();
  const { rerender } = render(
    <PlanReview title="Plan" onExecute={run} actionsDisabled>
      Entire Markdown plan
    </PlanReview>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Implement this plan' }));
  expect(run).not.toHaveBeenCalled();
  expect(screen.getByText('Entire Markdown plan')).toBeTruthy();
  rerender(
    <PlanReview title="Plan" onExecute={run}>
      Entire Markdown plan
    </PlanReview>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Implement this plan' }));
  expect(run).toHaveBeenCalledOnce();
});

it('model descriptions are inline and Escape returns directly to effort', async () => {
  render(
    <ComposerModelPicker
      model="sol"
      effort="high"
      models={[{ value: 'sol', label: 'Sol', description: 'For daily work' }]}
      efforts={[{ value: 'high', label: 'High' }]}
      onModelChange={() => {}}
      onEffortChange={() => {}}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Select effort' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Select model' }));
  const option = await screen.findByRole('menuitemradio');
  expect(option.textContent).toContain('For daily work');
  fireEvent.focus(option);
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.keyDown(option, { key: 'Escape' });
  expect(screen.queryByRole('menuitemradio')).toBeNull();
  expect(screen.getByRole('dialog', { name: 'Select effort' })).not.toBeNull();
});
