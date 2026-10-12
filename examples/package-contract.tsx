import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DesktopProvider,
  DesktopDocumentAdapter,
  Button,
  IconButton,
  Checkbox,
  Switch,
  Input,
  EditableCombobox,
  Dialog,
  Select,
  MenuButton,
  UIStringsProvider,
  useDesktopTheme,
  type Theme,
  type DesktopTokenStyle,
} from 'chatgpt-desktop-kit';
import { Popover, PopoverTrigger, PopoverContent } from 'chatgpt-desktop-kit/compat/popover';
import {
  AppDialog,
  AppDialogTrigger,
  AppDialogContent,
  AppDialogTitle,
  AppDialogDescription,
} from 'chatgpt-desktop-kit/compat/app-dialog';
import { Calendar } from 'chatgpt-desktop-kit/compat/calendar';

const counts: Record<string, number> = {};
const record = (id: string) => {
  counts[id] = (counts[id] ?? 0) + 1;
};
Object.assign(window, { packageContract: counts });
function ThemeToggle({ id }: { id: string }) {
  const { theme, setTheme } = useDesktopTheme();
  return (
    <Button actionId={`${id}.theme`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle {id}
    </Button>
  );
}
function Surface({ id, initialTheme }: { id: string; initialTheme: Theme }) {
  const [value, setValue] = useState('');
  const [outer, setOuter] = useState(false);
  const [inner, setInner] = useState(false);
  const [options, setOptions] = useState([{ value: 'one' }, { value: 'two' }]);
  const icon = useRef<HTMLButtonElement>(null);
  const check = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (icon.current instanceof HTMLButtonElement && check.current instanceof HTMLInputElement)
      record(`${id}.refs`);
  }, [id]);
  return (
    <UIStringsProvider locale={id === 'light' ? 'en' : 'zh'}>
      <DesktopProvider
        defaultTheme={initialTheme}
        data-testid={id}
        style={{ '--desktop-radius-overlay': '19px' } as DesktopTokenStyle}
      >
        <ThemeToggle id={id} />
        <Input aria-label={`${id} draft`} defaultValue="Retained draft" />
        <Checkbox ref={check} aria-label={`${id} checkbox`} />
        <IconButton ref={icon} aria-label={`${id} icon`} actionId={`${id}.icon`}>
          ×
        </IconButton>
        <Switch aria-label={`${id} switch`} defaultChecked onCheckedChange={() => record(`${id}.switch`)} />
        <EditableCombobox
          aria-label={`${id} combo`}
          actionId={`${id}.combo`}
          value={value}
          options={options}
          onValueChange={setValue}
          onCommit={() => record(`${id}.commit`)}
        />
        <Button actionId={`${id}.after`} data-testid={`${id}-after`}>
          After combo
        </Button>
        <Button actionId={`${id}.options`} onClick={() => setOptions([])}>
          Clear {id} options
        </Button>
        <Select
          aria-label={`${id} select`}
          actionId={`${id}.select`}
          options={[
            { value: 'one', label: 'One' },
            { value: 'two', label: 'A long option that remains readable in English and 简体中文' },
          ]}
        />
        <MenuButton
          label={`${id} menu`}
          actionId={`${id}.menu`}
          items={[{ label: 'Command', actionId: `${id}.command`, onSelect: () => record(`${id}.command`) }]}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button actionId={`${id}.popover`}>{id} popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <Input aria-label={`${id} popup draft`} defaultValue="Popup draft" />
          </PopoverContent>
        </Popover>
        <AppDialog>
          <AppDialogTrigger asChild>
            <Button actionId={`${id}.compound`}>{id} compound</Button>
          </AppDialogTrigger>
          <AppDialogContent>
            <AppDialogTitle>{id} compound title</AppDialogTitle>
            <AppDialogDescription>Accessible description</AppDialogDescription>
            <Input aria-label={`${id} compound draft`} />
          </AppDialogContent>
        </AppDialog>
        <Button actionId={`${id}.outer`} onClick={() => setOuter(true)}>
          Open {id} dialog
        </Button>
        <Dialog
          open={outer}
          title={`${id} outer`}
          actionId={`${id}.outer`}
          onClose={() => {
            record(`${id}.outer.close`);
            setOuter(false);
          }}
        >
          <Input aria-label={`${id} outer draft`} defaultValue="Outer draft" />
          <AppDialog>
            <AppDialogTrigger asChild>
              <Button actionId={`${id}.mixed`}>Open {id} compound nested</Button>
            </AppDialogTrigger>
            <AppDialogContent>
              <AppDialogTitle>{id} mixed title</AppDialogTitle>
              <AppDialogDescription>Accessible description</AppDialogDescription>
              <Input aria-label={`${id} mixed draft`} />
            </AppDialogContent>
          </AppDialog>
          <Button actionId={`${id}.inner`} onClick={() => setInner(true)}>
            Open {id} nested
          </Button>
          <Dialog
            open={inner}
            title={`${id} inner`}
            actionId={`${id}.inner`}
            onClose={() => {
              record(`${id}.inner.close`);
              setInner(false);
            }}
          >
            <Input aria-label={`${id} inner draft`} />
          </Dialog>
        </Dialog>
      </DesktopProvider>
    </UIStringsProvider>
  );
}
function Example() {
  const [mounted, setMounted] = useState(true);
  const documentMode = new URLSearchParams(location.search).has('document');
  const calendarTheme = new URLSearchParams(location.search).get('calendar');
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 12));
  if (calendarTheme)
    return (
      <UIStringsProvider locale={calendarTheme === 'dark' ? 'zh-CN' : 'en'}>
        <DesktopProvider theme={calendarTheme as Theme}>
          <Calendar
            mode="single"
            defaultMonth={new Date(2026, 9, 1)}
            today={new Date(2026, 9, 12)}
            selected={date}
            onSelect={(next) => {
              setDate(next);
              record('calendar.select');
            }}
          />
        </DesktopProvider>
      </UIStringsProvider>
    );
  return (
    <>
      {documentMode && <DesktopDocumentAdapter />}
      <button id="unmount" onClick={() => setMounted(false)}>
        Unmount library
      </button>
      {mounted && (
        <>
          <Surface id="light" initialTheme="light" />
          <Surface id="dark" initialTheme="dark" />
        </>
      )}
    </>
  );
}
createRoot(document.getElementById('root')!).render(<Example />);
