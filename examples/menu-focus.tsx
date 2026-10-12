import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { InputBehaviorRoot } from '../src/input-behavior';
import { Dialog, MenuButton } from '../src/components/overlays';
import { Button } from '../src/components/actions';
import { Input, Select } from '../src/components/forms';
import { Popover, PopoverTrigger, PopoverContent } from '../src/compat/popover';
import { DesktopMenu } from '../src/components/client';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '../src/compat/dropdown-menu';

declare global {
  interface Window {
    menuInvocations: number;
  }
}
window.menuInvocations = 0;
const invoke = () => {
  window.menuInvocations++;
};
document.documentElement.classList.toggle(
  'dark',
  new URLSearchParams(location.search).get('theme') === 'dark',
);

function MenuFixture() {
  const [checked, setChecked] = useState(false);
  const [choice, setChoice] = useState('first');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [childOpen, setChildOpen] = useState(false);
  return (
    <InputBehaviorRoot>
      <main>
        <h1>Menu interaction contract</h1>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="desktop-button" data-desktop-action="fixture.account.open">
            Account menu
          </DropdownMenuTrigger>
          <DropdownMenuContent className="fixture-menu" side="bottom" align="start">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger data-desktop-action="fixture.appearance.open">
                Appearance
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem actionId="fixture.theme" onSelect={invoke}>
                  System theme
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem actionId="fixture.account.manage" onSelect={invoke}>
              Manage account
            </DropdownMenuItem>
            <DropdownMenuItem actionId="fixture.settings" onSelect={invoke}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuCheckboxItem
              checked={checked}
              onCheckedChange={setChecked}
              data-desktop-action="fixture.notifications"
            >
              Notifications
            </DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup value={choice} onValueChange={setChoice}>
              <DropdownMenuRadioItem value="first" data-desktop-action="fixture.first">
                First option
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="second" data-desktop-action="fixture.second">
                Second option
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuItem variant="destructive" actionId="fixture.delete" onSelect={invoke}>
              Delete record
            </DropdownMenuItem>
            <DropdownMenuItem disabled actionId="fixture.disabled">
              Unavailable action
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <MenuButton
          label="Portable menu"
          actionId="fixture.portable.open"
          items={[{ label: 'Portable action', actionId: 'fixture.portable.action', onSelect: invoke }]}
        />
        <DesktopMenu
          trigger={<button className="desktop-button">Client menu</button>}
          items={[{ id: 'fixture.client.action', label: 'Client action', onSelect: invoke }]}
        />
        <Button actionId="fixture.dialog.open" onClick={() => setDialogOpen(true)}>
          Open editor
        </Button>
        <Dialog open={dialogOpen} title="Editor" onClose={() => setDialogOpen(false)}>
          <Input aria-label="Draft" defaultValue="Retained draft" />
          <Select
            aria-label="Editor choice"
            value={choice}
            onValueChange={setChoice}
            options={[
              { value: 'first', label: 'First option' },
              { value: 'second', label: 'Second option' },
            ]}
          />
          <MenuButton
            label="Editor menu"
            actionId="fixture.editor.menu"
            items={[{ label: 'Editor command', actionId: 'fixture.editor.command', onSelect: invoke }]}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button actionId="fixture.editor.popup">Editor popup</Button>
            </PopoverTrigger>
            <PopoverContent>
              <Input aria-label="Popup draft" defaultValue="Popup retained" />
            </PopoverContent>
          </Popover>
          <Button actionId="fixture.child.open" onClick={() => setChildOpen(true)}>
            Open child editor
          </Button>
          <Dialog open={childOpen} title="Child editor" onClose={() => setChildOpen(false)}>
            <Input aria-label="Child draft" defaultValue="Child retained" />
          </Dialog>
        </Dialog>
      </main>
    </InputBehaviorRoot>
  );
}
createRoot(document.getElementById('root')!).render(<MenuFixture />);
