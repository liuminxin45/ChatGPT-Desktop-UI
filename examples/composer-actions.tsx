import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ComposerActionButton,
  ClientComposer,
  DesktopRoot,
  DesktopClientSurface,
  InputBehaviorRoot,
  Button,
  type ComposerActionState,
} from '../src';
import '../src/styles.css';
const events = { send: 0, stop: 0 };
Object.assign(window, { composerEvents: events });
function Example() {
  const [state, setState] = useState<ComposerActionState>('ready');
  const [draft, setDraft] = useState('Draft stays editable');
  return (
    <main style={{ padding: 32 }}>
      <h1>Composer action contract</h1>
      <section style={{ display: 'flex', gap: 24, alignItems: 'center', marginBlock: 24 }}>
        {(['ready', 'sending', 'stoppable', 'stopping'] as const).map((state) => (
          <div key={state}>
            <p>{state}</p>
            <ComposerActionButton
              state={state}
              actionId={`fixture.${state}`}
              sendLabel="Ready"
              sendingLabel="Sending"
              stopLabel="Stop"
              stoppingLabel="Stopping"
              onSend={() => events.send++}
              onStop={() => events.stop++}
            />
          </div>
        ))}
        <div>
          <p>empty</p>
          <ComposerActionButton
            state="ready"
            sendDisabled
            actionId="fixture.empty"
            sendLabel="Empty"
            onSend={() => events.send++}
          />
        </div>
        <div>
          <p>unsupported stop</p>
          <ComposerActionButton
            state="stoppable"
            actionId="fixture.unsupported"
            stopLabel="Unsupported stop"
            onSend={() => events.send++}
          />
        </div>
      </section>
      <section style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ width: 460 }}>
          <h2>Work</h2>
          <ClientComposer
            value={draft}
            onValueChange={setDraft}
            onSubmit={() => {
              events.send++;
              setState('stoppable');
            }}
            label="Work draft"
            actionId="fixture.work"
            actionState={state}
            onStop={() => {
              events.stop++;
              setState('stopping');
            }}
          />
          <Button actionId="fixture.complete" onClick={() => setState('ready')}>
            Finish
          </Button>
        </div>
        <div style={{ width: 460 }}>
          <h2>Chat profile</h2>
          <DesktopClientSurface>
            <ClientComposer
              variant="chat"
              value="Chat draft"
              onValueChange={() => {}}
              onSubmit={() => events.send++}
              label="Chat draft"
              actionId="fixture.chat"
            />
          </DesktopClientSurface>
        </div>
      </section>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(
  <DesktopRoot>
    <InputBehaviorRoot>
      <Example />
    </InputBehaviorRoot>
  </DesktopRoot>,
);
