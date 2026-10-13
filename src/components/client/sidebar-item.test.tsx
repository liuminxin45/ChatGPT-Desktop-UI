// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ClientSidebarItem } from './index';

describe('ClientSidebarItem', () => {
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
});
