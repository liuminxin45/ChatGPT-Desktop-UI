import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DesktopRoot,
  DesktopClientSurface,
  UIStringsProvider,
  TemporalPicker,
  Button,
  Dialog,
  Input,
  ToolVisibilityContext,
} from '../src';
import { Calendar } from '../src/compat/calendar';
import { DatePicker } from '../src/compat/date-picker';
import '../src/styles.css';

const params = new URLSearchParams(location.search);
const locale = params.get('locale') || 'en';
const state = { changes: {} as Record<string, number>, values: {} as Record<string, string>, submits: 0 };
Object.assign(window, { temporalContract: state });
const words: Record<string, string> = {
  选择日期: '选择日期',
  清除日期: '清除日期',
  选择月份: '选择月份',
  选择日期时间: '选择日期时间',
  年份: '年份',
  月份: '月份',
  上一年: '上一年',
  下一年: '下一年',
  小时: '小时',
  分钟: '分钟',
  今天: '今天',
  本月: '本月',
  取消: '取消',
  确定: '确定',
  'Previous month': '上个月',
  'Next month': '下个月',
};
function Fixture() {
  const [month, setMonth] = useState('2026-10');
  const [date, setDate] = useState('2024-02-28');
  const [time, setTime] = useState('2026-10-14T08:30');
  const [dialog, setDialog] = useState(false);
  const [visible, setVisible] = useState(true);
  const change = (key: string, update: (next: string) => void) => (next: string) => {
    state.changes[key] = (state.changes[key] || 0) + 1;
    state.values[key] = next;
    update(next);
  };
  return (
    <main
      className="temporal-fixture"
      data-desktop-feature="example.temporal"
      data-desktop-surface="example.temporal"
    >
      <h1>Calendar selection</h1>
      <div className="temporal-fixture-fields">
        <label>
          Attendance month
          <TemporalPicker
            actionId="example.month"
            aria-label="Attendance month"
            mode="month"
            value={month}
            onValueChange={change('month', setMonth)}
            min="2025-01"
            max="2027-12"
          />
        </label>
        <label>
          Due date
          <TemporalPicker
            actionId="example.date"
            aria-label="Due date"
            value={date}
            onValueChange={change('date', setDate)}
            min="2024-02-01"
            max="2024-03-31"
          />
        </label>
        <label>
          Local time
          <TemporalPicker
            actionId="example.time"
            aria-label="Local time"
            mode="datetime-local"
            value={time}
            onValueChange={change('time', setTime)}
            min="2026-10-14T08:30"
            max="2026-10-15T18:00"
          />
        </label>
        <label>
          Compact date
          <DatePicker actionId="example.compat" value={new Date(2026, 9, 14)} onChange={() => {}} />
        </label>
        <label>
          Disabled
          <TemporalPicker
            actionId="example.disabled"
            aria-label="Disabled date"
            value=""
            disabled
            onValueChange={() => {
              throw Error('Disabled change');
            }}
          />
        </label>
        <label>
          Read only
          <TemporalPicker
            actionId="example.readonly"
            aria-label="Read only date"
            value="2026-10-14"
            readOnly
            onValueChange={() => {
              throw Error('Readonly change');
            }}
          />
        </label>
      </div>
      <Button actionId="example.editor" onClick={() => setDialog(true)}>
        Open editor
      </Button>
      <Button actionId="example.visibility" onClick={() => setVisible(!visible)}>
        Toggle visibility
      </Button>
      <ToolVisibilityContext.Provider value={visible}>
        <TemporalPicker
          actionId="example.retained"
          aria-label="Retained Tool date"
          value={date}
          onValueChange={setDate}
        />
      </ToolVisibilityContext.Provider>
      <Calendar
        actionId="example.range"
        mode="range"
        numberOfMonths={2}
        defaultMonth={new Date(2026, 9, 1)}
        selected={{ from: new Date(2026, 9, 14), to: new Date(2026, 9, 17) }}
      />
      <Dialog
        open={dialog}
        title="Editor"
        onClose={() => setDialog(false)}
        footer={
          <Button confirmOnEnter actionId="example.save" onClick={() => state.submits++}>
            Save editor
          </Button>
        }
      >
        <Input aria-label="Editor draft" defaultValue="Preserved draft" />
        <TemporalPicker
          actionId="example.dialog-time"
          aria-label="Editor date time"
          mode="datetime-local"
          value={time}
          onValueChange={change('dialogTime', setTime)}
        />
      </Dialog>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(
  <DesktopRoot defaultTheme={params.get('theme') === 'dark' ? 'dark' : 'light'}>
    <DesktopClientSurface>
      <UIStringsProvider
        locale={locale}
        {...(locale === 'zh-CN' ? { translate: (key: string) => words[key] || key } : {})}
      >
        <Fixture />
      </UIStringsProvider>
    </DesktopClientSurface>
  </DesktopRoot>,
);
