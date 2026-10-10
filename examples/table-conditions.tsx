import { createRoot } from 'react-dom/client';
import { useState } from 'react';
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
import '../src/styles.css';

function App() {
  const [value, setValue] = useState('long');
  const [count, setCount] = useState(0);
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
        <VirtualList
          ariaLabel="Records"
          style={{ height: 240 }}
          items={Array.from({ length: 2000 }, (_, id) => ({ id }))}
          getItemKey={(item) => item.id}
          estimateSize={48}
          renderItem={(item) => (
            <RecordRow>
              <span>BUG-{item.id}</span>
              <Button actionId="reference.record.open" onClick={() => setCount(count + 1)}>
                Open
              </Button>
            </RecordRow>
          )}
        />
      </main>
    </DesktopRoot>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
