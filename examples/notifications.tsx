import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Button,
  DesktopRoot,
  ToastNotice,
  Toaster,
  toast,
  UIStringsProvider,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
} from '../src';
import '../src/styles.css';
function Fixture() {
  const [notice, setNotice] = useState(false),
    [count, setCount] = useState(0);
  return (
    <DesktopRoot>
      <UIStringsProvider labels={{ 关闭: 'Dismiss notification', 通知: 'Notifications' }}>
        <main style={{ padding: 24 }}>
          <Toaster duration={60000} />
          <Button actionId="fixture.notice.show" onClick={() => setNotice(true)}>
            Host notice
          </Button>
          {notice ? (
            <ToastNotice
              title="Dinner subsidy confirmed"
              description={'A long, readable result. '.repeat(15)}
              tone="success"
              closeLabel="Close host notice"
              actionId="fixture.notice.close"
              onClose={() => setNotice(false)}
            />
          ) : null}
          {(['success', 'error', 'warning', 'info'] as const).map((kind) => (
            <Button
              key={kind}
              actionId={'fixture.toast.' + kind}
              onClick={() =>
                toast[kind](kind + ' result', {
                  description: 'A shared notification with readable supporting text.',
                  action: { label: 'Undo', onClick: () => setCount((n) => n + 1) },
                  ...(kind === 'warning'
                    ? { cancel: { label: 'Cancel notification', onClick: () => setCount((n) => n + 1) } }
                    : {}),
                })
              }
            >
              {kind}
            </Button>
          ))}
          <Button actionId="fixture.toast.timed" onClick={() => toast('Temporary result', { duration: 400 })}>
            Timed
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button actionId="fixture.popup.open">Search people</Button>
            </PopoverTrigger>
            <PopoverContent align="start">
              <Input autoFocus aria-label="People search" />
            </PopoverContent>
          </Popover>
          <output>{count}</output>
        </main>
      </UIStringsProvider>
    </DesktopRoot>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
