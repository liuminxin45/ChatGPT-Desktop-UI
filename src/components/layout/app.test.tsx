// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AppHeading, AppIcon, AppSurface, AppTile } from './app';
import { DesktopProvider } from '../../scoped-surface';

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(cleanup);

it('opts in without changing the surrounding document or mounted input', () => {
  const { rerender } = render(
    <DesktopProvider theme="light">
      <AppSurface aria-label="App">
        <input aria-label="Draft" defaultValue="keep input" />
      </AppSurface>
    </DesktopProvider>,
  );
  const node = screen.getByRole('textbox');
  expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  expect(document.querySelector('.desktop-app')?.getAttribute('data-theme')).toBe('light');
  rerender(
    <DesktopProvider theme="dark">
      <AppSurface aria-label="App">
        <input aria-label="Draft" defaultValue="keep input" />
      </AppSurface>
    </DesktopProvider>,
  );
  expect(screen.getByRole('textbox')).toBe(node);
  expect((node as HTMLInputElement).value).toBe('keep input');
  expect(document.querySelector('.desktop-app')?.getAttribute('data-theme')).toBe('dark');
});

it('renders a semantic heading and a single named tile action', () => {
  const click = vi.fn();
  render(
    <>
      <AppHeading
        eyebrow="Workspace"
        title="Continue your work"
        description="One clear next action"
        size="hero"
      />
      <AppTile
        title="Capture a thought"
        description="Keep the original words"
        icon={<AppIcon name="capture" />}
        onClick={click}
        selected
      />
    </>,
  );
  expect(screen.getByRole('heading', { level: 1, name: 'Continue your work' })).toBeTruthy();
  const tile = screen.getByRole('button', { name: 'Capture a thought Keep the original words' });
  expect(tile.getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(tile);
  expect(click).toHaveBeenCalledTimes(1);
  expect(tile.querySelectorAll('button,a,input').length).toBe(0);
});

it('selects the workspace profile explicitly without replacing a retained editor', () => {
  const view = (theme: 'light' | 'dark') => (
    <DesktopProvider theme={theme}>
      <AppSurface profile="workspace">
        <input aria-label="Workspace draft" defaultValue="retain this" />
      </AppSurface>
    </DesktopProvider>
  );
  const { rerender } = render(view('light'));
  const input = screen.getByRole('textbox');
  expect(document.querySelector('.desktop-app')?.getAttribute('data-app-profile')).toBe('workspace');
  rerender(view('dark'));
  expect(screen.getByRole('textbox')).toBe(input);
  expect((input as HTMLInputElement).value).toBe('retain this');
  expect(document.querySelector('.desktop-app')?.getAttribute('data-theme')).toBe('dark');
});

it('supports decorative glyphs, independently labelled glyphs and disabled actions', () => {
  const click = vi.fn();
  render(
    <>
      <AppIcon name="poster" aria-label="Poster" />
      <AppTile title="Review" onClick={click} disabled />
    </>,
  );
  expect(screen.getByRole('img', { name: 'Poster' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Review' }));
  expect(click).not.toHaveBeenCalled();
});
