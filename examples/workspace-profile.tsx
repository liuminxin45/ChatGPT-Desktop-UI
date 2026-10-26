import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AppHeading,
  AppActionBar,
  AppIcon,
  AppSurface,
  AppTile,
  Button,
  ChatHeader,
  DesktopProvider,
  Dialog,
  DismissalLayerProvider,
  Input,
  NavigationDrawer,
  Select,
  SettingsDisclosure,
  Surface,
  Tabs,
  Textarea,
} from '../src';
import '../src/desktop.css';

function Workspace() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [drawer, setDrawer] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [choice, setChoice] = useState('reader');
  const [draft, setDraft] = useState('保留我的原文');
  const [tab, setTab] = useState('preview');
  const [disabled, setDisabled] = useState(false);
  const layers = useRef<Array<() => void>>([]);
  const register = useCallback((dismiss: () => void) => {
    layers.current.push(dismiss);
    return () => {
      layers.current = layers.current.filter((item) => item !== dismiss);
    };
  }, []);
  useEffect(() => {
    const back = () => layers.current.at(-1)?.();
    const disable = () => setDisabled((value) => !value);
    document.addEventListener('fixture-back', back);
    document.addEventListener('fixture-disable', disable);
    return () => {
      document.removeEventListener('fixture-back', back);
      document.removeEventListener('fixture-disable', disable);
    };
  }, []);
  const options = [
    { value: 'reader', label: '读者价值' },
    { value: 'voice', label: '个人风格' },
    { value: 'detail', label: '更完整的事实说明与长期使用案例，保留完整选项文字' },
  ];
  return (
    <DesktopProvider theme={theme}>
      <AppSurface profile="workspace" className="workspace-fixture">
        <DismissalLayerProvider registerLayer={register}>
          <NavigationDrawer
            open={drawer}
            onOpenChange={setDrawer}
            label="工作台导航"
            closeLabel="关闭导航"
            navigation={
              <div className="workspace-nav">
                <Button layout="row" aria-current="page" icon={<AppIcon name="home" selected />}>
                  工作总览
                </Button>
                <Button layout="row" icon={<AppIcon name="layers" />}>
                  内容空间
                </Button>
                <Button layout="row" icon={<AppIcon name="tune" />}>
                  创作基座
                </Button>
              </div>
            }
          >
            <ChatHeader
              presentation="bar"
              title="工作总览"
              leading={
                <Button
                  iconOnly
                  aria-label="打开导航"
                  icon={<AppIcon name="layers" />}
                  onClick={() => setDrawer(true)}
                />
              }
              actions={
                <Button
                  iconOnly
                  aria-label="切换主题"
                  icon={<AppIcon name="style" />}
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                />
              }
            />
            <main className="workspace-scroll">
              <div className="workspace-reading">
                <AppHeading size="hero" title="今天的工作" />
                <AppTile
                  icon={<AppIcon name="review" />}
                  title="需要评审的内容"
                  description="示例版本 v02"
                  onClick={() => setSheet(true)}
                />
                <Tabs
                  value={tab}
                  onValueChange={setTab}
                  items={[
                    { value: 'preview', label: '看稿' },
                    { value: 'discussion', label: '讨论' },
                    { value: 'history', label: '过程' },
                  ]}
                />
                <Surface variant="outlined" role="region" aria-label="原文">
                  此处是可选中的普通文本。保留上下文与原始表达。
                </Surface>
                <label htmlFor="workspace-draft">本轮修改</label>
                <Textarea
                  id="workspace-draft"
                  aria-label="本轮修改"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={3}
                />
                <SettingsDisclosure title="本次设置">
                  <Input aria-label="补充要求" defaultValue="只调整这一版" />
                </SettingsDisclosure>
                <div className="workspace-long-content" aria-hidden="true" />
                <AppHeading title="表达重点" />
                <Select
                  aria-label="表达重点"
                  value={choice}
                  onValueChange={setChoice}
                  options={options}
                  disabled={disabled}
                />
                <Button variant="primary" onClick={() => setSheet(true)}>
                  调整设置
                </Button>
                <Dialog presentation="sheet" open={sheet} onClose={() => setSheet(false)} title="本轮设置">
                  <Select
                    aria-label="弹层表达重点"
                    value={choice}
                    onValueChange={setChoice}
                    options={options}
                  />
                  <Input aria-label="弹层草稿" defaultValue="保留本轮输入" />
                  <Button onClick={() => setSheet(false)}>完成</Button>
                </Dialog>
              </div>
            </main>
            <AppActionBar aria-label="本轮操作">
              <Button variant="primary" onClick={() => setSheet(true)}>
                确认修改
              </Button>
            </AppActionBar>
          </NavigationDrawer>
        </DismissalLayerProvider>
      </AppSurface>
    </DesktopProvider>
  );
}

createRoot(document.getElementById('root')!).render(<Workspace />);
