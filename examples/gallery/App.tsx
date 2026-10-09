import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DesktopRoot, DesktopShell, TitleBar, NavigationRail, AvatarMenu, SettingsNavigation, SettingsPage, SettingsSection, SettingRow,
  Button, Input, Textarea, Select, Switch, Checkbox, Tabs, PageBar, WorkbenchPage, InternalScrollArea, Dialog, EmptyState, ErrorState,
  MenuButton, Tooltip, IconButton, VirtualList, useDesktopTheme, House, ChatCircle, Gear, Sliders, FolderSimple, ArrowUp, Plus, MagnifyingGlass,
} from '../../src';
import '../../src/styles.css';
import './gallery.css';

const navigation = [{ id: 'workspace', label: 'Workspace', icon: House, unread: true }, { id: 'chat', label: 'Chat', icon: ChatCircle }, { id: 'settings', label: 'Settings', icon: Gear }, { id: 'components', label: 'Components', icon: Sliders }];
const categories = [{ id: 'appearance', label: 'Appearance', keywords: ['theme', 'language'], icon: Sliders }, { id: 'notifications', label: 'Notifications', keywords: ['alert'], icon: ChatCircle }];
const tasks = Array.from({ length: 100 }, (_, id) => ({ id: String(id), label: ['Review release notes', 'Prepare the integration checklist', 'Update camera configuration'][id % 3], state: id % 5 ? 'In progress' : 'Ready for review' }));

export function Gallery() {
  const [page, setPage] = useState('workspace'); const [sidebar, setSidebar] = useState(true); const [category, setCategory] = useState('appearance');
  const [tab, setTab] = useState('projects'); const [filter, setFilter] = useState(''); const [dialog, setDialog] = useState(false); const [draft, setDraft] = useState(''); const [discard, setDiscard] = useState(false); const [saveError, setSaveError] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState(true); const [chatDraft, setChatDraft] = useState(''); const [messages, setMessages] = useState(['The release checklist is ready for review.']);
  const { theme, setTheme } = useDesktopTheme();
  const closeDialog = () => { if (draft) setDiscard(true); else { setDialog(false); setSaveError(false); } };
  const menus = [
    { id: 'file', label: 'File', actions: [{ id: 'settings.open', label: 'Settings', onSelect: () => setPage('settings') }, { id: 'application.exit', label: 'Exit application', disabled: true }] },
    { id: 'edit', label: 'Edit', actions: [{ id: 'editor.undo', label: 'Undo', disabled: true }, { id: 'editor.copy', label: 'Copy', disabled: true }] },
    { id: 'view', label: 'View', actions: [{ id: 'navigation.sidebar.toggle', label: 'Toggle page sidebar', disabled: !['chat','settings'].includes(page), onSelect: () => setSidebar(value => !value) }] },
    { id: 'help', label: 'Help', actions: [{ id: 'gallery.components', label: 'Component gallery', onSelect: () => setPage('components') }] },
  ];
  const contextualSidebar = page === 'settings' ? <SettingsNavigation categories={categories} selected={category} onSelect={setCategory}/> : page === 'chat' ? <div className="gallery-conversations"><h2>Conversations</h2><InternalScrollArea><button className="kit-category" aria-current="page">Release planning</button><p className="kit-muted">Synthetic conversation</p></InternalScrollArea></div> : undefined;
  return <DesktopShell titlebar={<TitleBar menus={menus} canToggleSidebar={['chat','settings'].includes(page)} onToggleSidebar={() => setSidebar(value => !value)} trailing={<Tooltip label="Search" side="bottom"><IconButton aria-label="Search" actionId="workspace.search" onClick={() => setPage('workspace')}><MagnifyingGlass size={16}/></IconButton></Tooltip>}/>}
    navigation={<NavigationRail items={navigation} selected={page} onSelect={setPage} footer={<AvatarMenu name="Example account" status="Component demonstration" onAccount={() => setDialog(true)} onSettings={() => setPage('settings')}/>}/>}
    sidebar={contextualSidebar} sidebarVisible={sidebar}>
    <section className="gallery-panel" hidden={page !== 'workspace'}>
      <WorkbenchPage><PageBar className="desktop-workbench__bar" navigation={<Tabs actionId="workspace.tab" value={tab} items={[{ value: 'projects', label: 'Projects' }, { value: 'tasks', label: 'My tasks' }]} onValueChange={setTab}/>} actions={<Button actionId="project.create" onClick={() => setDialog(true)}><Plus size={16}/>New project</Button>}/>
        <div className="gallery-filter"><Input aria-label="Filter tasks" placeholder="Search" value={filter} onChange={event => setFilter(event.target.value)}/><MenuButton actionId="workspace.sort" label="Sort" items={[{ actionId: 'workspace.sort.name', label: 'Name', onSelect: () => {} }]}/></div>
        <VirtualList className="gallery-list" ariaLabel="Work items" items={tasks.filter(item => item.label.toLowerCase().includes(filter.toLowerCase()))} getItemKey={item => item.id} estimateSize={64} renderItem={item => <div className="gallery-list-row"><FolderSimple size={20}/><div>{item.label}<small>{item.state}</small></div><Button actionId="workspace.item.open" size="sm" onClick={() => setDialog(true)}>Open</Button></div>}/>
      </WorkbenchPage>
    </section>
    <section className="gallery-panel gallery-chat" hidden={page !== 'chat'}><PageBar className="desktop-workbench__bar" navigation={<span>Release planning</span>}/><InternalScrollArea className="gallery-chat__scroll"><div className="gallery-reading">{messages.map((message, index) => <article key={index}><p className="kit-muted">Example colleague</p><p>{message}</p></article>)}</div></InternalScrollArea>
      <form className="desktop-composer gallery-composer" onSubmit={event => { event.preventDefault(); if (chatDraft.trim()) { setMessages(old => [...old, chatDraft]); setChatDraft(''); } }}><Textarea aria-label="Message" placeholder="Write a message" value={chatDraft} onChange={event => setChatDraft(event.target.value)}/><div><span className="kit-muted">Local demonstration</span><Button className="desktop-send-control" type="submit" actionId="chat.send" aria-label="Send message" disabled={!chatDraft.trim()}><ArrowUp size={18}/></Button></div></form>
    </section>
    <section className="gallery-panel" hidden={page !== 'settings'}><SettingsPage title={categories.find(item => item.id === category)?.label}>
      <div hidden={category !== 'appearance'}><SettingsSection title="Display"><SettingRow label="Theme"><Select actionId="appearance.theme" aria-label="Theme" value={theme} onValueChange={value => setTheme(value as typeof theme)} options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}/></SettingRow><SettingRow label="Interface language"><Select actionId="appearance.language" aria-label="Interface language" defaultValue="en" options={[{ value: 'en', label: 'English' }, { value: 'zh-CN', label: '简体中文', disabled: true }]}/></SettingRow></SettingsSection><SettingsSection title="Workspace"><SettingRow label="Desktop notifications" description="Show alerts when work needs your attention."><Switch actionId="notifications.toggle" aria-label="Desktop notifications" checked={systemAlerts} onClick={() => setSystemAlerts(value => !value)}/></SettingRow><SettingRow label="Default workspace"><Input aria-label="Default workspace" placeholder="Choose a folder"/></SettingRow></SettingsSection></div>
      <div hidden={category !== 'notifications'}><SettingsSection title="Alerts"><SettingRow label="Desktop notifications"><Switch aria-label="Allow notifications" actionId="notifications.toggle" checked={systemAlerts} onClick={() => setSystemAlerts(value => !value)}/></SettingRow></SettingsSection></div>
    </SettingsPage></section>
    <section className="gallery-panel" hidden={page !== 'components'}><WorkbenchPage><PageBar className="desktop-workbench__bar" navigation={<span>Component gallery</span>}/><InternalScrollArea className="desktop-workbench__content"><div className="gallery-components">
      <section><h2>Actions</h2><div className="gallery-controls"><Button actionId="example.secondary">Secondary</Button><Button actionId="example.primary" variant="primary">Primary</Button><Button actionId="example.danger" variant="danger">Remove</Button><Button actionId="example.disabled" disabled>Unavailable</Button><Tooltip label="Add item"><IconButton actionId="example.add" aria-label="Add item"><Plus size={20}/></IconButton></Tooltip></div></section>
      <section><h2>Inputs and selection</h2><div className="gallery-controls"><Input aria-label="Example input" placeholder="Workspace name"/><Select aria-label="Example select" actionId="example.select" defaultValue="balanced" options={[{ value: 'balanced', label: 'Balanced' }, { value: 'fast', label: 'Fast' }, { value: 'offline', label: 'Offline', disabled: true }]}/><Checkbox aria-label="Example checkbox"/><Switch aria-label="Example switch" checked actionId="example.switch"/></div></section>
      <section><h2>States</h2><EmptyState title="No projects yet" action={<Button actionId="example.create" onClick={() => setDialog(true)}>Create project</Button>}/><ErrorState description="The connection is unavailable." action={<Button actionId="example.retry">Retry</Button>}/></section>
    </div></InternalScrollArea></WorkbenchPage></section>
    <Dialog open={dialog} title={discard ? 'Discard changes?' : 'Project details'} actionId="project.dialog" onClose={() => { if (discard) setDiscard(false); else closeDialog(); }} footer={discard ? <><Button actionId="project.draft.keep" onClick={() => setDiscard(false)}>Keep editing</Button><Button actionId="project.draft.discard" variant="danger" onClick={() => { setDraft(''); setSaveError(false); setDiscard(false); setDialog(false); }}>Discard</Button></> : <><Button actionId="project.cancel" onClick={closeDialog}>Cancel</Button><Button confirmOnEnter actionId="project.save" variant="primary" onClick={() => setSaveError(true)}>Save</Button></>}>
      {discard ? <p>The unsaved project name will be lost.</p> : <><label className="gallery-field">Project name<Input autoComplete="off" value={draft} onChange={event => setDraft(event.target.value)}/></label>{saveError ? <p role="alert">Demonstration: the save failed. Your draft is preserved.</p> : null}</>}
    </Dialog>
  </DesktopShell>;
}
createRoot(document.getElementById('root')!).render(<DesktopRoot storageKey="desktop-kit.gallery.theme"><Gallery/></DesktopRoot>);
