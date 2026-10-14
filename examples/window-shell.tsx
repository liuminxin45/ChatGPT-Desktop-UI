import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DesktopRoot,
  DesktopDocumentAdapter,
  DesktopClientSurface,
  DesktopShell,
  TitleBar,
  WindowControls,
  NavigationRail,
  NavigationRailItem,
  ClientSidebar,
  ClientSidebarHeading,
  ClientSidebarItem,
  SettingsLayout,
  Button,
  IconButton,
  Input,
  VirtualList,
  Dialog,
  DesktopMenu,
  House,
  FolderSimple,
  Gear,
  SidebarSimple,
} from 'chatgpt-desktop-kit';

function Fixture() {
  const [sidebar, setSidebar] = useState(true),
    [navigation, setNavigation] = useState(true);
  const [nested, setNested] = useState(false),
    [dialog, setDialog] = useState(false);
  const [maximized, setMaximized] = useState(false),
    [calls, setCalls] = useState(0);
  Object.assign(window, { shellFixture: { setSidebar, setNavigation, setNested } });
  const side = (
    <ClientSidebar header={<ClientSidebarHeading>Projects</ClientSidebarHeading>}>
      <Input aria-label="Sidebar draft" defaultValue="Retained sidebar query" />
      <ClientSidebarItem
        label="Project with a long descriptive name"
        actionId="fixture.project.open"
        selected
      />
    </ClientSidebar>
  );
  const editor = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{ padding: 24 }}>
        <Input aria-label="Editor draft" defaultValue="Retained editor draft" />
        <Button actionId="fixture.dialog.open" onClick={() => setDialog(true)}>
          Open dialog
        </Button>
        <span data-fixture-calls={calls} />
      </div>
      <VirtualList
        ariaLabel="Long records"
        style={{ flex: 1, minHeight: 0 }}
        items={Array.from({ length: 100 }, (_, id) => ({ id }))}
        getItemKey={(item) => item.id}
        estimateSize={36}
        renderItem={(item) => (
          <ClientSidebarItem actionId="fixture.record.open" label={`Record ${item.id + 1}`} />
        )}
      />
    </div>
  );
  return (
    <DesktopShell
      navigationVisible={navigation}
      sidebar={!nested ? side : undefined}
      sidebarVisible={sidebar}
      titlebar={
        <TitleBar
          actions={
            <>
              <IconButton
                className="kit-titlebar__icon"
                aria-label="Toggle sidebar"
                actionId="fixture.sidebar.toggle"
                onClick={() => setSidebar(!sidebar)}
              >
                <SidebarSimple />
              </IconButton>
              <DesktopMenu
                trigger={
                  <Button className="kit-titlebar__menu" actionId="fixture.menu.open">
                    File
                  </Button>
                }
                items={[{ id: 'fixture.menu.dialog', label: 'Open dialog', onSelect: () => setDialog(true) }]}
              />
            </>
          }
          windowControls={
            <WindowControls
              maximized={maximized}
              onMinimize={() => setCalls(calls + 1)}
              onMaximize={() => {
                setMaximized(!maximized);
                setCalls(calls + 1);
              }}
              onClose={() => setCalls(calls + 1)}
            />
          }
        />
      }
      navigation={
        <NavigationRail
          footer={
            <IconButton aria-label="Account" actionId="fixture.account.open">
              <Gear />
            </IconButton>
          }
        >
          <NavigationRailItem label="Home" actionId="fixture.home.open" selected unread>
            <House />
          </NavigationRailItem>
          <NavigationRailItem label="Projects" actionId="fixture.projects.open" asChild>
            <a href="#projects">
              <FolderSimple />
            </a>
          </NavigationRailItem>
        </NavigationRail>
      }
    >
      {nested ? (
        <SettingsLayout sidebar={side} sidebarVisible={sidebar}>
          {editor}
        </SettingsLayout>
      ) : (
        editor
      )}
      <Dialog actionId="fixture.dialog" open={dialog} title="Draft editor" onClose={() => setDialog(false)}>
        <Input aria-label="Dialog draft" defaultValue="Retained dialog draft" />
      </Dialog>
    </DesktopShell>
  );
}

const theme = new URLSearchParams(location.search).get('theme') === 'dark' ? 'dark' : 'light';
createRoot(document.getElementById('root')!).render(
  <DesktopDocumentAdapter>
    <DesktopRoot defaultTheme={theme}>
      <DesktopClientSurface>
        <Fixture />
      </DesktopClientSurface>
    </DesktopRoot>
  </DesktopDocumentAdapter>,
);
