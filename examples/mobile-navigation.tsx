import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AvatarMenu,
  Button,
  ChatAppSurface,
  ChatHeader,
  DesktopProvider,
  Input,
  NavigationDrawer,
  SidebarSimple,
  SettingsPage,
  SettingsGroup,
  SettingsField,
} from '../dist/index.js';
import '../dist/desktop.css';
import './mobile-navigation.css';
function App() {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(''),
    [selected, setSelected] = useState('Module 1');
  const modules = Array.from({ length: 20 }, (_, i) => 'Module ' + (i + 1));
  return (
    <DesktopProvider>
      <ChatAppSurface>
        <NavigationDrawer
          open={open}
          onOpenChange={setOpen}
          label="Modules"
          closeLabel="Close navigation"
          navigation={
            <>
              <ChatHeader
                presentation="bar"
                title="Modules"
                actions={
                  <Button
                    iconOnly
                    icon={<SidebarSimple />}
                    aria-label="Collapse navigation"
                    onClick={() => setOpen(false)}
                  />
                }
              />
              <Input aria-label="Search modules" value={query} onChange={(e) => setQuery(e.target.value)} />
              <nav className="example-modules">
                {modules
                  .filter((m) => m.toLowerCase().includes(query.toLowerCase()))
                  .map((m) => (
                    <Button
                      key={m}
                      layout="row"
                      variant="ghost"
                      aria-current={m === selected ? 'page' : undefined}
                      onClick={() => {
                        setSelected(m);
                        setOpen(false);
                      }}
                    >
                      {m}
                    </Button>
                  ))}
              </nav>
            </>
          }
          footer={<AvatarMenu onSettings={() => {}} />}
        >
          <ChatHeader
            presentation="bar"
            title={selected}
            leading={
              <Button
                iconOnly
                icon={<SidebarSimple />}
                aria-label="Open navigation"
                onClick={() => setOpen(true)}
              />
            }
          />
          <SettingsPage embedded title={selected}>
            <SettingsGroup title="Preferences">
              <SettingsField label="Retained draft">
                <Input aria-label="Draft" defaultValue="Keep this text" />
              </SettingsField>
            </SettingsGroup>
          </SettingsPage>
          <div className="example-account">
            <AvatarMenu name="Edge account" onSettings={() => {}} />
          </div>
        </NavigationDrawer>
      </ChatAppSurface>
    </DesktopProvider>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
