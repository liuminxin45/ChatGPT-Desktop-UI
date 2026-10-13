import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DesktopClientSurface,
  DesktopDocumentAdapter,
  SettingsLayout,
  SidebarPanel,
  type SidebarResizeOptions,
} from '../src';

declare global {
  interface Window {
    sidebarContract: {
      events: (string | number | boolean)[][];
      mounts: number;
      unmounts: number;
      transitions: string[];
    };
  }
}
const params = new URLSearchParams(location.search);
window.sidebarContract = { events: [], mounts: 0, unmounts: 0, transitions: [] };
function Child() {
  useEffect(() => {
    window.sidebarContract.mounts++;
    return () => {
      window.sidebarContract.unmounts++;
    };
  }, []);
  return (
    <>
      <input aria-label="Draft" defaultValue="Original draft" />
      <div aria-label="Sidebar scroll" style={{ height: 120, overflow: 'auto' }}>
        <div style={{ height: 800 }}>Navigation</div>
      </div>
    </>
  );
}
function Host() {
  const [width, setWidth] = useState(320),
    [hidden, setHidden] = useState(false),
    [frozen, setFrozen] = useState(false);
  const resize: SidebarResizeOptions = {
    width,
    minWidth: 240,
    maxWidth: 460,
    label: 'Resize sidebar',
    actionId: 'sidebar.resize',
    onStart: () => window.sidebarContract.events.push(['start']),
    onEnd: (cancelled) => window.sidebarContract.events.push(['end', cancelled]),
    onChange: (value, collapsed) => {
      window.sidebarContract.events.push(['change', value, collapsed]);
      if (!frozen) {
        setWidth(value);
        setHidden(collapsed);
      }
    },
  };
  const main = <div style={{ height: 300 }}>Main content</div>;
  const content = (
    <>
      <button onClick={() => setHidden((value) => !value)}>Toggle sidebar</button>
      <button onClick={() => setWidth(180)}>Restore narrow</button>
      <button onClick={() => setWidth(700)}>Restore wide</button>
      <button onClick={() => setWidth(320)}>Restore default</button>
      <button onClick={() => setFrozen((value) => !value)}>Freeze Host</button>
      <output id="host-state">{JSON.stringify({ width, hidden, frozen })}</output>
      <div
        style={{ transform: 'scale(' + (params.get('transform') || 1) + ')', transformOrigin: 'top left' }}
      >
        {params.get('profile') === 'client' ? (
          <SettingsLayout
            sidebarId="sidebar"
            sidebarVisible={!hidden}
            sidebarResize={resize}
            sidebar={<Child />}
          >
            {main}
          </SettingsLayout>
        ) : (
          <div className="kit-settings-layout">
            <SidebarPanel id="sidebar" hidden={hidden} resize={resize}>
              <Child />
            </SidebarPanel>
            {main}
          </div>
        )}
      </div>
    </>
  );
  return (
    <DesktopDocumentAdapter>
      {params.get('profile') === 'client' ? <DesktopClientSurface>{content}</DesktopClientSurface> : content}
    </DesktopDocumentAdapter>
  );
}
createRoot(document.getElementById('root')!).render(<Host />);
document.addEventListener('transitionend', (event) => {
  if (event.target instanceof HTMLElement && event.target.id === 'sidebar') {
    window.sidebarContract.transitions.push(event.propertyName);
  }
});
