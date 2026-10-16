import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, X } from 'lucide-react';
import {
  Button,
  ClientSidebarItem,
  DesktopRoot,
  IconButton,
  RecordAction,
  Tooltip,
  TaskStateIcon,
} from '../src';
import { Button as CompatButton } from '../src/compat/button';
import '../src/styles.css';

function Fixture() {
  const [wide, setWide] = useState(false);
  const [count, setCount] = useState(0);
  const [chinese, setChinese] = useState(false);
  const caption = chinese ? '保存' : 'Save';
  const file = 'A very long attachment filename that has additional details.txt';
  return (
    <DesktopRoot>
      <main style={{ padding: 24 }}>
        <div
          data-testid="ordinary"
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}
        >
          <Button aria-label={caption} onClick={() => setCount((value) => value + 1)}>
            {caption}
          </Button>
          <CompatButton size="icon" aria-label="Close">
            <X />
          </CompatButton>
          <Button iconOnly icon={<Plus />}>
            Add
          </Button>
          <IconButton aria-label="Copy">Copy</IconButton>
          <RecordAction aria-label="Open this record">Record</RecordAction>
          <Button
            layout="tile"
            style={{ width: 48, height: 48, flex: '0 0 48px' }}
            aria-label="View large image"
          >
            <img
              width="40"
              height="40"
              alt="Preview"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='gray'/%3E%3C/svg%3E"
            />
          </Button>
        </div>
        <div style={{ width: wide ? 900 : 180 }} data-testid="file-container">
          <Button layout="row" style={{ width: '100%' }} tooltip={file} tooltipWhenTruncated>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
              {file}
            </span>
          </Button>
          <Tooltip label={file} overflowOnly>
            <span
              data-testid="filename"
              style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {file}
            </span>
          </Tooltip>
          <ClientSidebarItem label={file} tooltip={file} tooltipWhenTruncated />
        </div>
        <Button onClick={() => setWide((value) => !value)}>Resize filename</Button>
        <Button disabled tooltip="Account is unavailable" aria-label="Connect">
          Connect
        </Button>
        <Button
          iconOnly
          icon={<TaskStateIcon state="in-progress" />}
          aria-label="Current task status"
          tooltip="In progress"
        />
        <Button title="Legacy additional information" aria-label="Legacy">
          Legacy
        </Button>
        <Button onClick={() => setChinese((value) => !value)}>Language</Button>
        <output>{count}</output>
      </main>
    </DesktopRoot>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
