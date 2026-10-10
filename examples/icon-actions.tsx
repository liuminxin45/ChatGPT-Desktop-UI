import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Settings, Plus, Loader2, Check, X, UserRound, LogOut, Forward, ListTodo, Sparkles } from 'lucide-react';
import { Button, DesktopRoot, Input, Textarea, MenuButton, SaveIcon, DeleteIcon, AttachmentIcon, CompleteIcon, ToolVisibilityContext, Tooltip } from '../src';
import { Button as HostButton } from '../src/compat/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../src/compat/dropdown-menu';
import '../src/styles.css';

function Fixture() {
  const [busy, setBusy] = useState(false);
  const [chinese, setChinese] = useState(false);
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(0);
  const save = chinese ? (busy ? '正在保存' : '保存') : (busy ? 'Saving' : 'Save');
  return <DesktopRoot><main style={{padding:24}}>
    <h1>Icon actions</h1>
    <div style={{display:'flex',gap:8,alignItems:'center'}}>
      <HostButton actionId="fixture.fields.toggle" iconOnly icon={<Settings size={16}/>} aria-pressed={false}>{chinese ? '显示字段' : 'Show fields'}</HostButton>
      <HostButton actionId="fixture.node.create" iconOnly badge={3} icon={<Plus size={16}/>} onClick={() => setCount(n => n + 1)}>{chinese ? '新建节点' : 'Create new node'}</HostButton>
      <Button actionId="fixture.save" iconOnly icon={busy ? <Loader2 size={16} className="spin"/> : <SaveIcon size={16}/>} disabled={busy} onClick={() => setBusy(true)}>{save}</Button>
      <Tooltip label="Outer label"><HostButton actionId="fixture.nested" size="icon" aria-label="Inner label"><Plus size={16}/></HostButton></Tooltip>
      <DropdownMenu><DropdownMenuTrigger asChild><HostButton size="icon" aria-label="Menu" actionId="fixture.menu"><Settings size={16}/></HostButton></DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem actionId="fixture.menu.account" icon={<UserRound size={16}/>}>Manage account</DropdownMenuItem>
          <DropdownMenuItem actionId="fixture.menu.settings" icon={<Settings size={16}/>}>Settings <span style={{marginLeft:'auto'}}>Ctrl+,</span></DropdownMenuItem>
          <DropdownMenuItem actionId="fixture.menu.quit" icon={<LogOut size={16}/>}>Quit</DropdownMenuItem>
          <DropdownMenuItem actionId="fixture.menu.delete" icon={<DeleteIcon size={16}/>} onSelect={() => setCount(n => n + 1)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ToolVisibilityContext.Provider value={visible}><Button iconOnly icon={<Plus size={16}/>} actionId="fixture.surface">Surface action</Button></ToolVisibilityContext.Provider>
      <Button actionId="fixture.aria-only" aria-label="Send"><Plus size={16}/></Button>
    </div>
    <p role="status">{count}</p>
    <Button actionId="fixture.attachment" iconOnly icon={<AttachmentIcon size={16}/>}>Attach file</Button>
    <Button actionId="fixture.complete" icon={<CompleteIcon size={16}/>}>Mark complete</Button>
    <Textarea aria-label="Growing note" autoSize rows={2} />
    <MenuButton label="Collection actions" actionId="fixture.collection.more" onOpenChange={open => { document.body.dataset.collectionOpen = String(open); }} items={[{label:'Full collection',actionId:'fixture.collection.full',onSelect:() => setCount(n => n + 1)}]} />
    <div style={{display:'flex',gap:8,marginTop:16}}>
      <Button actionId="fixture.submit" icon={<Check size={16}/>}>Confirm and submit</Button>
      <HostButton actionId="fixture.review" icon={<Sparkles size={16}/>}>AI review</HostButton>
      <HostButton actionId="fixture.reply" badge={3} icon={<Forward size={16}/>}>3 replies</HostButton>
      <HostButton actionId="fixture.view" icon={<ListTodo size={16}/>}>Tasks</HostButton>
    </div>
    <HostButton actionId="fixture.forward" className="w-full justify-start" icon={<Forward size={16}/>}>Forward</HostButton>
    <label>API Token<Input type="password"/><HostButton actionId="fixture.token.clear" iconOnly icon={<X size={16}/>}>Clear token</HostButton></label>
    <Button actionId="fixture.locale" onClick={() => setChinese(v=>!v)}>Language</Button>
    <Button actionId="fixture.retry" onClick={() => setBusy(false)}>Reset</Button>
    <Button actionId="fixture.visibility" onClick={() => setVisible(v=>!v)}>Hide surface</Button>
    <HostButton asChild size="icon" title="Download" actionId="fixture.download"><a href="#download"><Plus size={16}/></a></HostButton>
  </main></DesktopRoot>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
