import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AvatarMenu,
  Button,
  DesktopClientSurface,
  DesktopDocumentAdapter,
  DesktopRoot,
  DesktopShell,
  NavigationRail,
  SettingsDisclosure,
  SettingsField,
  SettingsGroup,
  SettingsLayout,
  SettingsNavigation,
  SettingsPage,
  Select,
  Switch,
  Input,
  TitleBar,
  DocumentIcon,
} from '../src';
import '../src/desktop.css';

function Navigation() {
  return (
    <SettingsNavigation
      categories={[{ id: 'general', label: 'General' }]}
      selected="general"
      onSelect={() => {}}
    />
  );
}

function Fields() {
  return (
    <SettingsPage title="General">
      <section className="desktop-native-tool-surface">
        <SettingsGroup title="Permissions">
          <SettingsField
            label={<span style={{ fontWeight: 900, fontFamily: 'serif' }}>Default permissions</span>}
            description="Long readable descriptions preserve the label and right control alignment."
          >
            <Switch checked onCheckedChange={() => {}} aria-label="Permissions" />
          </SettingsField>
          <SettingsField label="Model">
            <Select
              value="model"
              options={[
                {
                  value: 'model',
                  label: 'A long model name with explanatory information and a current default preference',
                },
              ]}
              onValueChange={() => {}}
              aria-label="Model"
            />
          </SettingsField>
          <SettingsField label={'LongPath/'.repeat(12)}>
            <Input aria-label="Path" defaultValue="Long value" />
          </SettingsField>
        </SettingsGroup>
        <SettingsDisclosure title="Advanced" defaultOpen>
          <p data-testid="tool-body" style={{ fontFamily: 'serif', fontWeight: 900 }}>
            Body copy stays regular.
          </p>
          <Button style={{ fontFamily: 'serif', fontWeight: 900 }}>Regular command</Button>
        </SettingsDisclosure>
        <span className="desktop-chat-message__sender" data-testid="sender">
          Sender
        </span>
      </section>
    </SettingsPage>
  );
}

function Fixture() {
  const [settings, setSettings] = useState(true);
  const shell = new URLSearchParams(location.search).has('shell');
  return (
    <DesktopRoot>
      <DesktopClientSurface>
        {shell ? (
          <DesktopShell
            sidebarLayout={settings ? 'settings' : 'default'}
            sidebar={<Navigation />}
            titlebar={
              <TitleBar
                menus={[
                  {
                    id: 'file',
                    label: 'File',
                    actions: [{ id: 'file.open', label: 'Open', onSelect: () => {} }],
                  },
                ]}
              />
            }
            navigation={
              <NavigationRail
                items={[{ id: 'docs', label: 'Documents', icon: DocumentIcon }]}
                selected="docs"
                onSelect={() => {}}
                pinnedIds={[]}
                onPinnedChange={() => {}}
                footer={<AvatarMenu name="Test account" />}
              />
            }
          >
            <Button actionId="fixture.sidebar.toggle" onClick={() => setSettings(!settings)}>
              Toggle layout
            </Button>
            <Fields />
          </DesktopShell>
        ) : (
          <SettingsLayout sidebar={<Navigation />}>
            <Fields />
          </SettingsLayout>
        )}
      </DesktopClientSurface>
      <section className="desktop-native-tool-surface" id="portable">
        <h3 style={{ fontFamily: 'serif', fontWeight: 900 }}>Portable Host typography</h3>
      </section>
      <span className="desktop-chat-message__sender" id="portable-sender">
        Portable sender
      </span>
    </DesktopRoot>
  );
}
createRoot(document.getElementById('root')!).render(
  <DesktopDocumentAdapter>
    <Fixture />
  </DesktopDocumentAdapter>,
);
