import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DesktopRoot,
  DesktopDocumentAdapter,
  ComposerStack,
  ComposerSurface,
  ComposerQueue,
  ComposerAttachmentButton,
  ComposerModelControl,
  ComposerPermissionSelect,
  ComposerActionButton,
  Textarea,
  AIActivity,
  Button,
  type ComposerActionState,
} from '../src';
import '../src/desktop.css';
import './composer-reference.css';

function Example() {
  const [draft, setDraft] = useState(''),
    [model, setModel] = useState('sol'),
    [effort, setEffort] = useState('xhigh'),
    [permission, setPermission] = useState('full'),
    [queued, setQueued] = useState(true),
    [paused, setPaused] = useState(false),
    [outcome, setOutcome] = useState('none');
  const params = new URLSearchParams(location.search),
    theme = params.get('theme') === 'dark' ? 'dark' : 'light';
  const [action, setAction] = useState<ComposerActionState>(
    (params.get('state') as ComposerActionState) || 'stoppable',
  );
  return (
    <DesktopDocumentAdapter>
      <DesktopRoot defaultTheme={theme}>
        <main className="reference-page">
          <div className="reference-controls">
            <Button onClick={() => setAction('ready')}>Ready</Button>
            <Button onClick={() => setAction('stoppable')}>Running</Button>
            <output aria-label="Outcome">{outcome}</output>
          </div>
          <form className="reference-composer" onSubmit={(event) => event.preventDefault()}>
            <ComposerStack>
              <ComposerQueue
                label="Queued messages"
                paused={paused}
                onPause={() => {
                  setPaused(true);
                  setOutcome('paused');
                }}
                onResume={() => {
                  setPaused(false);
                  setOutcome('resumed');
                }}
                activity={
                  <AIActivity active={action === 'stoppable'}>
                    Pursuing goal <span>我需要你自己盯着最终的结果</span>
                  </AIActivity>
                }
                items={
                  queued
                    ? [
                        {
                          id: 'q1',
                          text: '干得不错，继续加油',
                          onEdit: () => {
                            setQueued(false);
                            setDraft('干得不错，继续加油');
                            setOutcome('edited');
                          },
                          onRemove: () => {
                            setQueued(false);
                            setOutcome('removed');
                          },
                          onSteer: () => setOutcome('steered'),
                        },
                      ]
                    : []
                }
              />
              <ComposerSurface
                layout="work"
                input={
                  <Textarea
                    autoSize
                    rows={1}
                    aria-label="Draft"
                    placeholder="Work with ChatGPT"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                }
                leading={
                  <>
                    <ComposerAttachmentButton onClick={() => setOutcome('attach')} />
                    <ComposerPermissionSelect
                      id="permission"
                      aria-label="Permissions"
                      title="Permissions"
                      risk={permission === 'full' ? 'elevated' : 'default'}
                      value={permission}
                      options={[
                        { value: 'read', label: 'Read only' },
                        { value: 'full', label: 'Full access' },
                      ]}
                      onValueChange={setPermission}
                    />
                  </>
                }
                controls={
                  <ComposerModelControl
                    model={{
                      id: 'model',
                      'aria-label': 'Model',
                      value: model,
                      options: [
                        { value: 'sol', label: 'GPT-6.1 Sol' },
                        { value: 'astra', label: 'GPT-6 Astra' },
                      ],
                      onValueChange: setModel,
                    }}
                    effort={{
                      id: 'effort',
                      'aria-label': 'Reasoning',
                      value: effort,
                      options: [
                        { value: 'high', label: 'High' },
                        { value: 'xhigh', label: 'Extra High' },
                      ],
                      onValueChange: setEffort,
                    }}
                  />
                }
                action={
                  <ComposerActionButton
                    state={action}
                    actionId="reference.send"
                    sendDisabled={!draft.trim()}
                    onSend={() => setOutcome('sent')}
                    onStop={() => {
                      setAction('ready');
                      setOutcome('stopped');
                    }}
                  />
                }
              />
            </ComposerStack>
          </form>
        </main>
      </DesktopRoot>
    </DesktopDocumentAdapter>
  );
}
createRoot(document.getElementById('root')!).render(<Example />);
