import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DesktopRoot,
  FixedVirtualList,
  ListStack,
  MenuButton,
  Select,
  Tabs,
  ToolPageBar,
  VirtualList,
  type FixedVirtualListHandle,
} from '../src';
import '../src/styles.css';

function App() {
  const [tab, setTab] = useState('people'),
    [selected, setSelected] = useState(0),
    [value, setValue] = useState('a');
  const [items, setItems] = useState(Array.from({ length: 1000 }, (_, id) => id));
  const fixed = useRef<FixedVirtualListHandle>(null);
  (window as any).listSpacing = {
    scroll: (index: number) => fixed.current?.scrollToIndex(index),
    prepend: () => setItems((rows) => [-1, ...rows]),
    empty: () => setItems([]),
  };
  const row = (id: number, dynamic = false) => (
    <button
      className="spacing-row"
      style={{ height: dynamic ? 38 + (id % 3) * 8 : 38 }}
      aria-pressed={selected === id}
      onClick={() => setSelected(id)}
      onKeyDown={(event) => {
        if (event.key === 'End') {
          event.preventDefault();
          fixed.current?.scrollToIndex(items.length - 1);
        }
      }}
    >
      Record {id}
    </button>
  );
  return (
    <DesktopRoot>
      <style>{`.spacing-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;padding:24px;height:500px}.spacing-grid>section{display:flex;min-height:0;flex-direction:column}.spacing-row{width:100%;border:0;border-radius:8px;background:transparent;color:var(--desktop-color-text);font:inherit;text-align:left;padding:0 12px}.spacing-row:hover,.spacing-row[aria-pressed=true]{background:var(--desktop-color-surface-hover)}.spacing-row:focus-visible{outline:2px solid var(--desktop-color-focus);outline-offset:-2px}.spacing-grid h2{font-size:16px;font-weight:400}.spacing-grid .desktop-virtual-list{flex:1;min-height:0}`}</style>
      <ToolPageBar
        navigation={
          <Tabs
            actionId="spacing.tabs"
            value={tab}
            onValueChange={setTab}
            items={[
              { value: 'people', label: 'People' },
              { value: 'organize', label: 'Organize' },
              { value: 'disabled', label: 'Disabled', disabled: true },
              { value: 'change', label: 'Change' },
            ]}
          />
        }
        actions={
          <>
            <MenuButton
              actionId="spacing.menu"
              label="Menu"
              items={['First', 'Second'].map((label) => ({
                label,
                actionId: `spacing.menu.${label}`,
                onSelect() {},
              }))}
            />
            <Select
              aria-label="Choice"
              value={value}
              onValueChange={setValue}
              options={[
                { value: 'a', label: 'Alpha' },
                { value: 'b', label: 'Beta' },
              ]}
            />
          </>
        }
      />
      <div className="spacing-grid">
        <section>
          <h2>Fixed</h2>
          <FixedVirtualList
            apiRef={fixed}
            items={items}
            rowHeight={38}
            getItemKey={(id) => id}
            renderItem={(id) => row(id)}
            ariaLabel="Fixed records"
          />
        </section>
        <section>
          <h2>Dynamic</h2>
          <VirtualList
            items={items}
            estimateSize={46}
            getItemKey={(id) => id}
            renderItem={(id) => row(id, true)}
            ariaLabel="Dynamic records"
          />
        </section>
        <section>
          <h2>Short list</h2>
          <ListStack>
            {items.slice(0, 6).map((id) => (
              <div key={id}>{row(id)}</div>
            ))}
          </ListStack>
        </section>
      </div>
    </DesktopRoot>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
