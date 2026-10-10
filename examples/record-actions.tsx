import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DesktopRoot,
  ListStack,
  RecordRow,
  RecordLink,
  RecordAction,
  Button,
  SettingsGroup,
  SettingsField,
} from '../src';
import '../src/styles.css';

function App() {
  const [runs, setRuns] = useState(0),
    [expanded, setExpanded] = useState(false),
    [selected, setSelected] = useState(false);
  return (
    <DesktopRoot>
      <style>{`.record-demo{max-width:900px;margin:48px auto;padding:24px}.record-demo h2{font-size:18px;font-weight:400}.demo-record{display:flex;align-items:center;gap:16px;padding:16px 8px;border-bottom:1px solid var(--desktop-color-border)}.demo-record>div{min-width:0;flex:1}.demo-record p{margin:4px 6px;color:var(--desktop-color-text-muted)}.demo-record nav{display:flex;align-items:center;gap:8px}.demo-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.demo-select{display:block;padding:12px;text-align:left;border:0;border-radius:8px;background:transparent;color:inherit;font:inherit}.demo-select:hover,.demo-select[aria-pressed=true]{background:var(--desktop-color-surface-hover)}.demo-selection{width:280px}`}</style>
      <main className="record-demo" data-desktop-feature="record-demo" data-desktop-surface="record-demo">
        <h2>Review records</h2>
        <ListStack>
          <RecordRow className="demo-record" data-testid="record">
            <div>
              <RecordLink actionId="demo.review.source" href="#source">
                <span className="demo-title">
                  CameraPreview: recover render failures and release on detach
                </span>
              </RecordLink>
              <p>apps/UtilityFoundation · Waiting for review</p>
            </div>
            <nav aria-label="Review actions">
              <RecordAction
                actionId="demo.review.details"
                aria-expanded={expanded}
                onClick={() => setExpanded(!expanded)}
              >
                Details
              </RecordAction>
              <Button actionId="demo.review.initiate" size="sm" onClick={() => setRuns(runs + 1)}>
                Initiate
              </Button>
              <Button actionId="demo.review.disabled" size="sm" disabled>
                Unavailable
              </Button>
            </nav>
          </RecordRow>
        </ListStack>
        {expanded && <p role="status">Review plan is available.</p>}
        <output aria-label="Initiations">{runs}</output>
        <h2>Settings fields remain static</h2>
        <SettingsGroup title="Downloads">
          <SettingsField label="Location" description="System Downloads folder">
            <Button actionId="demo.location.change" size="sm">
              Change
            </Button>
          </SettingsField>
        </SettingsGroup>
        <h2>One selection owns a whole target</h2>
        <ListStack className="demo-selection">
          <button className="demo-select" aria-pressed={selected} onClick={() => setSelected(!selected)}>
            Select conversation
          </button>
        </ListStack>
      </main>
    </DesktopRoot>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
