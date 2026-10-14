// @vitest-environment jsdom
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, it, expect, vi } from 'vitest';
import { DesktopShell, NavigationRail, NavigationRailItem, TitleBar, WindowControls } from './index';

afterEach(cleanup);

it('keeps the same editor and sidebar subtree while shell visibility changes', () => {
  const shell = (visible: boolean) => (
    <DesktopShell
      navigation={
        <NavigationRail>
          <NavigationRailItem label="Projects" actionId="project.open">
            P
          </NavigationRailItem>
        </NavigationRail>
      }
      navigationVisible={visible}
      sidebar={<input aria-label="Sidebar draft" defaultValue="Sidebar text" />}
      sidebarVisible={visible}
    >
      <input aria-label="Editor draft" defaultValue="Retained text" />
    </DesktopShell>
  );
  const { rerender } = render(shell(true));
  const sidebar = screen.getByRole('textbox', { name: 'Sidebar draft' });
  const editor = screen.getByRole('textbox', { name: 'Editor draft' });
  fireEvent.change(editor, { target: { value: 'Unsaved edit' } });
  rerender(shell(false));
  expect(screen.getByRole('textbox', { name: 'Editor draft' })).toBe(editor);
  expect((editor as HTMLInputElement).value).toBe('Unsaved edit');
  expect(sidebar.closest('aside')?.hasAttribute('inert')).toBe(true);
  rerender(shell(true));
  expect(screen.getByRole('textbox', { name: 'Sidebar draft' })).toBe(sidebar);
});

it('keeps router-link semantics, native activation and Host markers on one target', () => {
  const navigate = vi.fn();
  render(
    <NavigationRailItem
      asChild
      label="Projects"
      actionId="project.open"
      selected
      unread
      data-desktop-feature="projects"
    >
      <a
        href="/projects"
        onClick={(event) => {
          event.preventDefault();
          navigate();
        }}
      >
        Projects
      </a>
    </NavigationRailItem>,
  );
  const link = screen.getByRole('link', { name: 'Projects' });
  expect(link.getAttribute('href')).toBe('/projects');
  expect(link.getAttribute('aria-current')).toBe('page');
  expect(link.getAttribute('data-desktop-action')).toBe('project.open');
  fireEvent.click(link);
  expect(navigate).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('button')).toBeNull();
});

it('does not invoke a disabled Host link or an unavailable native window action', () => {
  const navigate = vi.fn();
  render(
    <>
      <NavigationRailItem asChild label="Unavailable" disabled>
        <a href="/unavailable" onClick={navigate}>
          Unavailable
        </a>
      </NavigationRailItem>
      <WindowControls />
    </>,
  );
  fireEvent.click(screen.getByRole('link', { name: 'Unavailable' }));
  expect(navigate).not.toHaveBeenCalled();
  expect(screen.getAllByRole('button').every((button) => (button as HTMLButtonElement).disabled)).toBe(true);
});

it('retains custom menu ownership and invokes Host window callbacks once', () => {
  const minimize = vi.fn(),
    maximize = vi.fn(),
    close = vi.fn();
  render(
    <TitleBar
      actions={<button data-desktop-action="host.menu.open">Host menu</button>}
      windowControls={
        <WindowControls
          maximized
          onMinimize={minimize}
          onMaximize={maximize}
          onClose={close}
          actionIds={{ minimize: 'host.minimize', maximize: 'host.maximize', close: 'host.close' }}
        />
      }
    />,
  );
  expect(screen.getByRole('button', { name: 'Host menu' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Minimize window' }));
  fireEvent.click(screen.getByRole('button', { name: 'Restore window' }));
  fireEvent.click(screen.getByRole('button', { name: 'Close window' }));
  for (const callback of [minimize, maximize, close]) expect(callback).toHaveBeenCalledTimes(1);
});
