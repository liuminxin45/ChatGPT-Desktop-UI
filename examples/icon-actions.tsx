import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Settings, Plus, Loader2, Check, X } from 'lucide-react';
import { Button, DesktopRoot, Input, ToolVisibilityContext, Tooltip } from '../src';
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
      <HostButton actionId="fixture.fields.toggle" icon={<Settings size={16}/>} aria-pressed={false}>{chinese ? '显示字段' : 'Show fields'}</HostButton>
      <HostButton actionId="fixture.node.create" badge={3} icon={<Plus size={16}/>} onClick={() => setCount(n => n + 1)}>{chinese ? '新建节点' : 'Create new node'}</HostButton>
      <Button actionId="fixture.save" icon={busy ? <Loader2 size={16} className="spin"/> : <Check size={16}/>} disabled={busy} onClick={() => setBusy(true)}>{save}</Button>
      <Tooltip label="Outer label"><HostButton actionId="fixture.nested" size="icon" aria-label="Inner label"><Plus size={16}/></HostButton></Tooltip>
      <DropdownMenu><DropdownMenuTrigger asChild><HostButton size="icon" aria-label="Menu" actionId="fixture.menu"><Settings size={16}/></HostButton></DropdownMenuTrigger>
        <DropdownMenuContent><DropdownMenuItem actionId="fixture.menu.delete" icon={<X size={16}/>} onSelect={() => setCount(n => n + 1)}>Delete</DropdownMenuItem></DropdownMenuContent>
      </DropdownMenu>
      <ToolVisibilityContext.Provider value={visible}><Button icon={<Plus size={16}/>} actionId="fixture.surface">Surface action</Button></ToolVisibilityContext.Provider>
      <Button actionId="fixture.aria-only" aria-label="Send"><Plus size={16}/></Button>
    </div>
    <p role="status">{count}</p>
    <label>API Token<Input type="password"/><HostButton actionId="fixture.token.clear" icon={<X size={16}/>}>Clear token</HostButton></label>
    <Button actionId="fixture.locale" onClick={() => setChinese(v=>!v)}>Language</Button>
    <Button actionId="fixture.retry" onClick={() => setBusy(false)}>Reset</Button>
    <Button actionId="fixture.visibility" onClick={() => setVisible(v=>!v)}>Hide surface</Button>
    <HostButton asChild size="icon" title="Download" actionId="fixture.download"><a href="#download"><Plus size={16}/></a></HostButton>
  </main></DesktopRoot>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
