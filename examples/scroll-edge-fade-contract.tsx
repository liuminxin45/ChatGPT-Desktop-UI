import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import {
  InternalScrollArea,
  ScrollEdgeFade,
  ComposerDock,
  Button,
  Textarea,
  VirtualList,
  FixedVirtualList,
} from '../src';
import { VirtualList as CompatVirtualList } from '../src/compat/virtual-list';
import '../src/styles.css';

const host = window as any;
function App() {
  const ref = useRef<HTMLDivElement>(null);
  const compatApi = useRef<any>(null);
  const fixedApi = useRef<any>(null);
  host.compatApi = compatApi;
  host.fixedApi = fixedApi;
  const [enabled, setEnabled] = useState(true);
  const [short, setShort] = useState(false);
  const [draft, setDraft] = useState('');
  const [portal, setPortal] = useState(false);
  host.scrollRef = ref;
  host.setEnabled = setEnabled;
  host.setShort = setShort;
  const rows = Array.from({ length: 100 }, (_, i) => ({ id: `row-${i}`, text: `Message ${i + 1}` }));
  return (
    <main
      style={{
        height: '100%',
        padding: 20,
        display: 'grid',
        gridTemplateColumns: 'repeat(4,minmax(0,1fr))',
        gap: 20,
      }}
    >
      <section id="plain" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <ScrollEdgeFade enabled={enabled}>
          <InternalScrollArea ref={ref} aria-label="Conversation" style={{ flex: 1, minHeight: 0 }}>
            <div className="probe" style={{ height: short ? 40 : 2200, background: 'rgb(0,120,240)' }}>
              <p>Text, link, image and code stay selectable.</p>
              <a
                href="#safe"
                onClick={(event) => {
                  event.preventDefault();
                  host.clicks = (host.clicks || 0) + 1;
                }}
              >
                Read source
              </a>
              <pre>const message = 'synthetic';</pre>
              <img
                alt="Synthetic"
                width="64"
                height="40"
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='40'%3E%3Crect width='64' height='40' fill='orange'/%3E%3C/svg%3E"
              />
              <InternalScrollArea id="nested" style={{ height: 30 }}>
                Nested scroll is not faded
              </InternalScrollArea>
            </div>
            {!short && (
              <Button actionId="fixture.last" onClick={() => setPortal(true)}>
                Last message action
              </Button>
            )}
          </InternalScrollArea>
        </ScrollEdgeFade>
        <ComposerDock>
          <Textarea
            aria-label="Draft"
            autoSize
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </ComposerDock>
        <Button actionId="fixture.portal" onClick={() => setPortal(true)}>
          Open floating menu
        </Button>
      </section>
      <section id="virtual" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <ScrollEdgeFade>
          <CompatVirtualList
            apiRef={compatApi}
            items={rows}
            getItemKey={(item) => item.id}
            estimateSize={48}
            ariaLabel="Virtual conversation"
            style={{ flex: 1, minHeight: 0 }}
            renderItem={(item) => <Button actionId="fixture.row">{item.text}</Button>}
          />
        </ScrollEdgeFade>
        <ComposerDock>
          <Textarea aria-label="Virtual draft" />
        </ComposerDock>
      </section>
      <section id="fixed" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <ScrollEdgeFade>
          <FixedVirtualList
            apiRef={fixedApi}
            items={rows}
            getItemKey={(item) => item.id}
            rowHeight={48}
            ariaLabel="Fixed conversation"
            className="fixed-list"
            renderItem={(item) => <Button actionId="fixture.fixed-row">{item.text}</Button>}
          />
        </ScrollEdgeFade>
        <ComposerDock>
          <Textarea aria-label="Fixed draft" />
        </ComposerDock>
      </section>
      <section id="native" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <ScrollEdgeFade>
          <VirtualList
            items={rows}
            getItemKey={(item) => item.id}
            estimateSize={48}
            ariaLabel="Native conversation"
            style={{ flex: 1, minHeight: 0 }}
            renderItem={(item) => <Button actionId="fixture.native-row">{item.text}</Button>}
          />
        </ScrollEdgeFade>
        <ComposerDock>
          <Textarea aria-label="Native draft" />
        </ComposerDock>
      </section>
      {portal &&
        createPortal(
          <div
            role="dialog"
            style={{
              position: 'fixed',
              right: 30,
              bottom: 15,
              background: 'var(--desktop-color-surface)',
              padding: 20,
            }}
          >
            <Button actionId="fixture.close" onClick={() => setPortal(false)}>
              Close floating menu
            </Button>
          </div>,
          document.body,
        )}
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
