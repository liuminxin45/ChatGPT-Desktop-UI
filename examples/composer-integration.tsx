import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DesktopProvider,
  DesktopDocumentAdapter,
  UIStringsProvider,
  Tabs,
  Button,
  AttachmentIcon,
  ArrowLeft,
  Textarea,
  Select,
  DatePicker,
  ComposerSurface,
  ComposerActionButton,
  ConversationViewport,
  ScrollToBottomButton,
  ScrollEdgeFade,
  InternalScrollArea,
  ComposerDock,
  SettingsPage,
  SettingsGroup,
  SettingsField,
  RecordLink,
  AIActivity,
} from '../src';
import '../src/desktop.css';
import './composer-integration.css';

function Example() {
  const [view, setView] = useState('conversation'),
    [draft, setDraft] = useState(''),
    [model, setModel] = useState('model-a'),
    [permission, setPermission] = useState('read'),
    [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 16, 12)),
    [following, setFollowing] = useState(false),
    [sent, setSent] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  const theme = new URLSearchParams(location.search).get('theme') === 'dark' ? 'dark' : 'light';
  return (
    <UIStringsProvider
      locale="zh-CN"
      labels={{ 'Scroll to bottom': '滚动到底部', 'Previous month': '上个月', 'Next month': '下个月' }}
    >
      <DesktopDocumentAdapter>
        <DesktopProvider theme={theme} className="integration-example">
          <Tabs
            value={view}
            items={[
              { value: 'conversation', label: '会话' },
              { value: 'settings', label: '设置' },
              { value: 'date', label: '日期' },
            ]}
            onValueChange={setView}
          />
          {view === 'conversation' ? (
            <>
              <ConversationViewport>
                <ScrollEdgeFade>
                  <InternalScrollArea
                    ref={viewport}
                    aria-label="消息"
                    className="integration-messages"
                    onScroll={() => {
                      const v = viewport.current!;
                      setFollowing(v.scrollHeight - v.scrollTop - v.clientHeight < 40);
                    }}
                  >
                    <AIActivity active>正在执行任务</AIActivity>
                    {Array.from({ length: 45 }, (_, i) => (
                      <p key={i}>组件库独立会话示例 · {i + 1}</p>
                    ))}
                  </InternalScrollArea>
                </ScrollEdgeFade>
                <ScrollToBottomButton
                  visible={!following}
                  onClick={() => {
                    const v = viewport.current!;
                    v.scrollTop = v.scrollHeight;
                    setFollowing(true);
                  }}
                />
              </ConversationViewport>
              <ComposerDock inset="responsive">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent((v) => v + 1);
                  }}
                >
                  <ComposerSurface
                    input={
                      <Textarea
                        autoSize
                        rows={1}
                        aria-label="消息草稿"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                      />
                    }
                    leading={<Button iconOnly aria-label="添加附件" icon={<AttachmentIcon />} />}
                    controls={
                      <>
                        <Select
                          size="sm"
                          aria-label="模型"
                          value={model}
                          options={[
                            { value: 'model-a', label: '模型 A' },
                            { value: 'model-b', label: '模型 B' },
                          ]}
                          onValueChange={setModel}
                        />
                        <Select
                          size="sm"
                          aria-label="权限"
                          value={permission}
                          options={[
                            { value: 'read', label: '只读' },
                            { value: 'write', label: '项目内操作' },
                          ]}
                          onValueChange={setPermission}
                        />
                      </>
                    }
                    action={
                      <ComposerActionButton
                        state="ready"
                        actionId="example.send"
                        sendDisabled={!draft.trim()}
                        onSend={() => setSent((v) => v + 1)}
                        sendLabel="发送"
                      />
                    }
                  />
                </form>
                <span role="status">发送次数：{sent}</span>
              </ComposerDock>
            </>
          ) : view === 'settings' ? (
            <SettingsPage
              title="设置"
              leading={
                <Button
                  iconOnly
                  aria-label="返回"
                  icon={<ArrowLeft />}
                  onClick={() => setView('conversation')}
                />
              }
            >
              <SettingsGroup title="通用">
                <SettingsField label="模型">
                  <Select
                    value={model}
                    options={[
                      { value: 'model-a', label: '模型 A' },
                      { value: 'model-b', label: '模型 B' },
                    ]}
                    onValueChange={setModel}
                  />
                </SettingsField>
                <SettingsField label="账号与登录">
                  <RecordLink actionId="example.account" href="#account">
                    管理账号
                  </RecordLink>
                </SettingsField>
              </SettingsGroup>
            </SettingsPage>
          ) : (
            <SettingsPage title="日期">
              <SettingsGroup title="日历">
                <SettingsField label="日期">
                  <DatePicker
                    id="example-date"
                    aria-label="资讯日期"
                    clearable={false}
                    value={date}
                    onChange={setDate}
                  />
                </SettingsField>
                <SettingsField label="禁用日期">
                  <DatePicker aria-label="禁用日期" disabled value={date} onChange={setDate} />
                </SettingsField>
              </SettingsGroup>
            </SettingsPage>
          )}
        </DesktopProvider>
      </DesktopDocumentAdapter>
    </UIStringsProvider>
  );
}
createRoot(document.getElementById('root')!).render(<Example />);
