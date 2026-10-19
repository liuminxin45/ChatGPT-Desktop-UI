import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import {
  DesktopRoot,
  DesktopDocumentAdapter,
  ComposerModelPicker,
  ComposerAddMenu,
  ComposerGoal,
  ComposerStack,
  ComposerSurface,
  ComposerActionButton,
  Textarea,
  PlanReview,
  Markdown,
  Input,
  Dialog,
  Button,
} from '../src';
import '../src/desktop.css';
import './composer-model-modes.css';

const models = [
  'GPT-6.1 Sol',
  'GPT-6 Astra',
  'GPT-6 Sol',
  'GPT-6 Luna',
  'GPT-5.6 Sol',
  'GPT-5.6 Terra',
  'GPT-5.6 Luna',
].map((value) => ({
  value,
  label: value,
  description: value === 'GPT-6 Luna' ? 'Fast, affordable model for simpler tasks' : 'Model description',
}));
const values = ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'];
function App() {
  const [model, setModel] = useState('GPT-6 Sol'),
    [effort, setEffort] = useState('high'),
    [draft, setDraft] = useState('Preserve this draft'),
    [plan, setPlan] = useState(false),
    [goal, setGoal] = useState(true),
    [paused, setPaused] = useState(false),
    [viewGoal, setViewGoal] = useState(false),
    [writes, setWrites] = useState<string[]>([]);
  const change = (name: string, value: string) => {
    setWrites((old) => [...old, name + ':' + value]);
    if (name === 'model') setModel(value);
    else setEffort(value);
  };
  return (
    <DesktopDocumentAdapter>
      <DesktopRoot
        defaultTheme={new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark'}
      >
        <main className="model-modes-demo">
          <div className="model-modes-demo__plan">
            <PlanReview
              title="Proposed plan"
              onExecute={() => setWrites((old) => [...old, 'execute'])}
              onContinue={() => setPlan(true)}
            >
              <Markdown>
                {
                  '# Complete Markdown plan\n\n1. Ask clarifying questions.\n2. Review the evidence.\n3. Implement after approval.\n\n```js\nconst draft = "retained";\n```'
                }
              </Markdown>
            </PlanReview>
          </div>
          <ComposerStack>
            {goal && (
              <ComposerGoal
                objective="这是一个目标，你需要完整地分阶段执行功能，保留全部业务能力"
                statusLabel={paused ? 'Goal paused' : 'Pursuing goal'}
                elapsed="3m 30s"
                paused={paused}
                onPause={() => setPaused(true)}
                onResume={() => setPaused(false)}
                onRemove={() => setGoal(false)}
                onEdit={() => setWrites((old) => [...old, 'edit-goal'])}
                onExpand={() => {
                  setWrites((old) => [...old, 'view-goal']);
                  setViewGoal(true);
                }}
              />
            )}
            <ComposerSurface
              layout="work"
              input={
                <Textarea
                  aria-label="Draft"
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
              }
              leading={
                <ComposerAddMenu
                  sections={[
                    {
                      id: 'add',
                      label: 'Add',
                      items: [
                        {
                          id: 'files',
                          kind: 'files',
                          label: 'Files and folders',
                          description: 'Add attachments',
                          onSelect: () => setWrites((old) => [...old, 'files']),
                        },
                        {
                          id: 'goal',
                          kind: 'goal',
                          label: 'Goal',
                          description: 'Set a goal to keep pursuing',
                          onSelect: () => setGoal(true),
                        },
                        {
                          id: 'plan',
                          kind: 'plan',
                          label: 'Plan mode',
                          description: 'Turn plan mode on',
                          checked: plan,
                          onSelect: () => setPlan(!plan),
                        },
                      ],
                    },
                    {
                      id: 'skills',
                      label: 'Skills',
                      items: [
                        {
                          id: 'skill',
                          kind: 'skills',
                          label: 'Select skills',
                          description: 'Choose an installed skill',
                          onSelect: () => setWrites((old) => [...old, 'skills']),
                        },
                      ],
                    },
                  ]}
                />
              }
              controls={
                <ComposerModelPicker
                  id="model"
                  model={model}
                  effort={effort}
                  models={models}
                  efforts={values.map((value) => ({
                    value,
                    label:
                      {
                        low: 'Low',
                        medium: 'Medium',
                        high: 'High',
                        xhigh: 'Extra High',
                        max: 'Max',
                        ultra: 'Ultra',
                      }[value] || value,
                  }))}
                  defaultEffort="medium"
                  onModelChange={(value) => change('model', value)}
                  onEffortChange={(value) => change('effort', value)}
                />
              }
              action={
                <ComposerActionButton state="ready" onSend={() => setWrites((old) => [...old, 'send'])} />
              }
            />
          </ComposerStack>
          <Input aria-label="Outcome" readOnly value={writes.join(',')} />
          <Dialog open={viewGoal} title="Goal details" onClose={() => setViewGoal(false)}>
            <p>Full goal objective</p>
            <Button>Edit goal</Button>
          </Dialog>
          <span data-plan={plan} />
        </main>
      </DesktopRoot>
    </DesktopDocumentAdapter>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
