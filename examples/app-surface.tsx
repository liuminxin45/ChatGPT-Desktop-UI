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
} from '../src';
import '../src/desktop.css';

function Example() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sheet, setSheet] = useState(false),
    [value, setValue] = useState(40),
    [tab, setTab] = useState('draft');
  return (
    <DesktopProvider theme={theme}>
      <div className="example-outside">
        <Button>Portable button</Button>
      </div>
      <AppSurface>
        <main className="example-app">
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
          </Dialog>
        </main>
      </AppSurface>
    </DesktopProvider>
  );
}
createRoot(document.getElementById('root')!).render(<Example />);
