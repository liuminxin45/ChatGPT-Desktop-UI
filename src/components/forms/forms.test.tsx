// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox, EditableCombobox, Switch, Select } from './index';
import { IconButton } from '../actions';
import { configureUIRuntime, UIStringsProvider, useLocale, useTranslation } from '../../strings';

afterEach(() => {
  cleanup();
  configureUIRuntime({});
});

describe('public form contracts', () => {
  it('shows a pending placeholder when no empty-value option exists', () => {
    render(<Select value="" options={[]} placeholder="同步设置…" aria-label="模型" disabled />);
    expect(screen.getByRole('combobox', { name: '模型' }).textContent).toContain('同步设置…');
  });
  it('keeps local labels and locales independent of the legacy host bridge', () => {
    configureUIRuntime({ translate: () => 'Host label', getLocale: () => 'zh-CN' });
    function Label() {
      const translate = useTranslation();
      return (
        <span>
          {useLocale()}: {translate('关闭')}
        </span>
      );
    }
    render(
      <>
        <Label />
        <UIStringsProvider labels={{ 关闭: 'Local close' }} locale="en-GB">
          <Label />
        </UIStringsProvider>
        <UIStringsProvider locale="fr" translate={() => 'Fermer'}>
          <Label />
        </UIStringsProvider>
      </>,
    );
    expect(screen.getByText('zh-CN: Host label')).toBeTruthy();
    expect(screen.getByText('en-GB: Local close')).toBeTruthy();
    expect(screen.getByText('fr: Fermer')).toBeTruthy();
  });
  it('forwards refs to the native focus targets', () => {
    const check = createRef<HTMLInputElement>();
    const icon = createRef<HTMLButtonElement>();
    render(
      <>
        <Checkbox ref={check} aria-label="Accept" />
        <IconButton ref={icon} aria-label="Close" />
      </>,
    );
    expect(check.current).toBe(screen.getByRole('checkbox'));
    expect(icon.current).toBe(screen.getByRole('button'));
    check.current?.focus();
    expect(document.activeElement).toBe(check.current);
    icon.current?.focus();
    expect(document.activeElement).toBe(icon.current);
  });
  it('keeps controlled state with the caller and invokes both compatible callbacks once', async () => {
    const changes: boolean[] = [];
    let clicks = 0;
    const view = render(
      <Switch
        checked
        aria-label="Controlled"
        onClick={() => clicks++}
        onCheckedChange={(next) => changes.push(next)}
      />,
    );
    await userEvent.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
    expect(changes).toEqual([false]);
    expect(clicks).toBe(1);
    view.rerender(<Switch checked={false} aria-label="Controlled" />);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false');
  });
  it('supports uncontrolled state, cancellation and native disabled behavior', async () => {
    const changes: boolean[] = [];
    const view = render(
      <Switch defaultChecked aria-label="Uncontrolled" onCheckedChange={(next) => changes.push(next)} />,
    );
    await userEvent.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false');
    expect(changes).toEqual([false]);
    view.rerender(
      <Switch
        aria-label="Uncontrolled"
        onClick={(event) => event.preventDefault()}
        onCheckedChange={(next) => changes.push(next)}
      />,
    );
    await userEvent.click(screen.getByRole('switch'));
    expect(changes).toEqual([false]);
    view.rerender(
      <Switch disabled aria-label="Uncontrolled" onCheckedChange={(next) => changes.push(next)} />,
    );
    await userEvent.click(screen.getByRole('switch'));
    expect(changes).toEqual([false]);
  });
  it('commits a chosen option once across Enter and subsequent blur', async () => {
    const commits: string[] = [];
    render(
      <>
        <EditableCombobox
          aria-label="Candidate"
          value=""
          options={[{ value: 'one' }, { value: 'two' }]}
          onValueChange={() => {}}
          onCommit={(next) => commits.push(next)}
        />
        <button>Next</button>
      </>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{ArrowDown}{Enter}{ArrowDown}{ArrowDown}{Enter}');
    await user.tab();
    expect(commits).toEqual(['one', 'two']);
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Next' }));
  });
});
