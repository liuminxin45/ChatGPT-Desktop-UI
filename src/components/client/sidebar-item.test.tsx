// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ClientSidebar, ClientSidebarToolbar, ClientModeSwitcher, ClientSidebarItem } from './index';

describe('ClientSidebarItem', () => {
  it('does not manufacture an icon column and keeps indentation explicit', () => {
    render(<ClientSidebarItem label="Task without icon" depth={1} />);
    const button = screen.getByRole('button', { name: 'Task without icon' });
    expect(button.querySelector('.desktop-action-glyph')).toBeNull();
    expect(button.style.getPropertyValue('--desktop-sidebar-depth')).toBe('1');
  });
  it('allows a retained virtual viewport and a single title control', () => {
    const { container } = render(<ClientSidebar scrollable={false} header={<ClientSidebarToolbar title="Projects" titleControl={<ClientModeSwitcher label="Projects" actionId="mode" ariaLabel="Switch mode" items={[]} />} />}><div>Viewport</div></ClientSidebar>);
    expect(screen.getAllByText('Projects')).toHaveLength(1);
    expect(container.querySelector('.client-sidebar-content')).not.toBeNull();
    expect(container.querySelector('.client-sidebar-scroll')).toBeNull();
  });
  it('exposes one navigation target with its label, count and current state', () => {
    const select = vi.fn();
    render(
      <ClientSidebarItem
        label="Engineering review"
        count={12}
        selected
        actionId="review.open"
        onClick={select}
      />,
    );
    const button = screen.getByRole('button', { name: 'Engineering review 12' });
    expect(button.getAttribute('aria-current')).toBe('page');
    expect(button.getAttribute('data-desktop-action')).toBe('review.open');
    button.click();
    expect(select).toHaveBeenCalledOnce();
  });
  it('keeps disabled targets inert and omits absent counts', () => {
    const select = vi.fn();
    render(<ClientSidebarItem label="A long category name" disabled onClick={select} />);
    const button = screen.getByRole('button', { name: 'A long category name' });
    button.click();
    expect(select).not.toHaveBeenCalled();
    expect(button.querySelector('.client-sidebar-count')).toBeNull();
  });
  it('keeps trailing commands and blank record space independent from navigation', () => {
    const select = vi.fn(),
      command = vi.fn();
    const { container } = render(
      <ClientSidebarItem
        label="Project with actions"
        onClick={select}
        actions={<button onClick={command}>Project operations</button>}
      />,
    );
    const action = screen.getByRole('button', { name: 'Project operations' });
    expect(action.closest('.client-sidebar-link')).toBeNull();
    action.click();
    container.querySelector<HTMLElement>('.client-sidebar-record')!.click();
    expect(command).toHaveBeenCalledOnce();
    expect(select).not.toHaveBeenCalled();
    screen.getByRole('button', { name: 'Project with actions' }).click();
    expect(select).toHaveBeenCalledOnce();
  });
});
