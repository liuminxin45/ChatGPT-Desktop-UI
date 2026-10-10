import { createRoot } from 'react-dom/client';
import { useMemo, useState } from 'react';
import {
  DesktopRoot,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  InlineNotice,
  Button,
  Select,
  Radio,
  VirtualList,
  RecordRow,
} from '../src';
import type { VirtualListScrollAnchor } from '../src/components/lists';
import '../src/styles.css';

function App() {
  const [value, setValue] = useState('long');
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reverse, setReverse] = useState(false);
  const [anchor, setAnchor] = useState<VirtualListScrollAnchor | null>(null);
  const records = useMemo(
    () =>
      Array.from({ length: 2000 }, (_, id) => ({ id })).sort((a, b) => (reverse ? b.id - a.id : a.id - b.id)),
    [reverse],
  );
  return (
    <DesktopRoot>
      <main style={{ padding: 24 }}>
        <Table density="compact" data-testid="table">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Bug</TableHeaderCell>
              <TableHeaderCell>Classification</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>1219473</TableCell>
              <TableCell>Long category with independent editing controls</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div style={{ width: 170, marginBlock: 24 }}>
          <Select
            size="sm"
            aria-label="Scope"
            value={value}
            onValueChange={setValue}
            options={[
              { value: 'long', label: 'Only effective development defects / 仅查看有效研发缺陷' },
              {
                value: 'other',
                label:
                  'A very long classification option that must stay readable at the edge of a small window',
              },
            ]}
          />
        </div>
        <InlineNotice
          tone="danger"
          title="58 Bugs need classification"
          description="Review the category and module before generating the report."
          actions={
            <Button actionId="reference.report.repair" onClick={() => setCount(count + 1)}>
              Review
            </Button>
          }
        />
        <label>
          <Radio name="review-mode" defaultChecked value="all" /> All Bugs
        </label>
        <output>{count}</output>
        <Button actionId="reference.list.visibility" onClick={() => setVisible(!visible)}>
          Toggle list
        </Button>
        <Button actionId="reference.list.sort" onClick={() => setReverse(!reverse)}>
          Reverse list
        </Button>
        {visible && (
          <VirtualList
            initialScrollAnchor={anchor}
            onScrollAnchorChange={setAnchor}
            header={
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 100px' }}>
                <span>Issue</span>
                <span>Action</span>
              </div>
            }
            ariaLabel="Records"
            style={{ height: 240 }}
            items={records}
            getItemKey={(item) => item.id}
            estimateSize={48}
            renderItem={(item) => (
              <RecordRow style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 100px' }}>
                <span>BUG-{item.id}</span>
                <Button actionId="reference.record.open" onClick={() => setCount(count + 1)}>
                  Open
                </Button>
              </RecordRow>
            )}
          />
        )}
      </main>
    </DesktopRoot>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
