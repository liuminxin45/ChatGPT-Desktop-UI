import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AppSurface,
  AppIcon,
  AppHeading,
  AppTile,
  DesktopProvider,
  Button,
  Input,
  Textarea,
  Checkbox,
  Select,
  Tabs,
  Dialog,
  SettingsField,
  Slider,
  ChatAppSurface,
  NavigationDrawer,
  SettingsDisclosure,
  MenuButton,
} from '../src';
import '../src/desktop.css';

function Example() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sheet, setSheet] = useState(false),
    [drawer, setDrawer] = useState(false),
    [value, setValue] = useState(40),
    [tab, setTab] = useState('draft');
  return (
    <DesktopProvider theme={theme}>
      <ChatAppSurface>
        <div className="example-outside">
          <Button>Portable button</Button>
          <Button size="sm" iconOnly aria-label="Portable small icon" icon={<AppIcon name="more" />} />
          <SettingsDisclosure title="Portable disclosure">Portable content</SettingsDisclosure>
        </div>
        <AppSurface>
          <NavigationDrawer
            open={drawer}
            onOpenChange={setDrawer}
            label="App navigation"
            closeLabel="Close app navigation"
            navigation={
              <>
                <Button layout="row" onClick={() => setDrawer(false)}>
                  Drawer destination
                </Button>
                <Button size="sm" iconOnly aria-label="Drawer icon" icon={<AppIcon name="more" />} />
                <SettingsDisclosure title="Drawer disclosure">Drawer content</SettingsDisclosure>
              </>
            }
          >
            <main className="example-app">
              <div>
                <Button iconOnly aria-label="App icon" icon={<AppIcon name="more" />} />
                <Button size="sm" iconOnly aria-label="App small icon" icon={<AppIcon name="more" />} />
                <MenuButton
                  label="App menu"
                  iconOnly
                  icon={<AppIcon name="more" />}
                  items={[{ label: 'Menu action' }]}
                />
                <Button layout="row">App row</Button>
                <Button size="sm" layout="row">
                  App small row
                </Button>
                <SettingsDisclosure title="App disclosure">Retained app content</SettingsDisclosure>
                <Button onClick={() => setDrawer(true)}>Open app drawer</Button>
              </div>
              <AppHeading
                size="hero"
                eyebrow="Workspace"
                title="Pick up where you left off"
                description="Capture a thought or continue your current work."
              />
              <div className="example-tiles">
                <AppTile
                  layout="tile"
                  icon={<AppIcon name="poster" />}
                  title="Create an image"
                  description="Start with your material"
                  tone="accent"
                  onClick={() => setSheet(true)}
                />
                <AppTile
                  layout="tile"
                  icon={<AppIcon name="capture" />}
                  title="Capture a thought"
                  description="Keep the original words"
                  onClick={() => setSheet(true)}
                />
              </div>
              <AppHeading title="Continue" />
              <AppTile
                icon={<AppIcon name="review" />}
                title="A draft waiting for review"
                description="Open the result and its decisions"
                onClick={() => setSheet(true)}
              />
              <Input aria-label="App title" placeholder="Title" />
              <Textarea aria-label="App draft" placeholder="Your words" rows={3} />
              <label>
                <Checkbox aria-label="Keep words" /> Keep my words
              </label>
              <Tabs
                value={tab}
                onValueChange={setTab}
                items={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'notes', label: 'Notes' },
                ]}
              />
              <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Change theme</Button>
              <Button onClick={() => setSheet(true)}>Open sheet</Button>
              <SettingsField label="Current direction" description="Inputs remain mounted on theme changes.">
                <Slider aria-label="Direction" value={value} onValueChange={setValue} />
              </SettingsField>
              <SettingsField label="App setting">
                <Select
                  aria-label="App setting choice"
                  value="a"
                  options={[{ value: 'a', label: 'Option' }]}
                />
              </SettingsField>
              <Dialog
                presentation="sheet"
                open={sheet}
                onClose={() => setSheet(false)}
                title="Adjust the direction"
                description="Only this operation changes."
              >
                <Input aria-label="Sheet draft" defaultValue="Keep this draft" />
                <Select
                  aria-label="Sheet choice"
                  value="clear"
                  options={[
                    { value: 'clear', label: 'Clear' },
                    { value: 'detailed', label: 'Detailed' },
                  ]}
                />
                <Button onClick={() => setSheet(false)}>Done</Button>
                <Button size="sm" iconOnly aria-label="Sheet small icon" icon={<AppIcon name="more" />} />
                <SettingsDisclosure title="Sheet disclosure">Sheet content</SettingsDisclosure>
              </Dialog>
            </main>
          </NavigationDrawer>
        </AppSurface>
      </ChatAppSurface>
    </DesktopProvider>
  );
}
createRoot(document.getElementById('root')!).render(<Example />);
