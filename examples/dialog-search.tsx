import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DesktopRoot, DesktopDocumentAdapter, ChatAppSurface, Dialog, SearchDialog, Button, Input, Select, AvatarMenu } from '../dist/index';
import '../dist/desktop.css';

function Fixture() {
  const [search, setSearch] = useState(false), [form, setForm] = useState(false), [query, setQuery] = useState(''), [chosen, setChosen] = useState(''), [draft, setDraft] = useState('kept');
  return <DesktopRoot><DesktopDocumentAdapter><ChatAppSurface>
    <Button onClick={() => setSearch(true)}>Search</Button><Button onClick={() => setForm(true)}>Edit</Button>
    <output>{chosen}</output><AvatarMenu name="Account" onSettings={() => setChosen('settings')}/>
    <SearchDialog open={search} title="Search chats" query={query} onQueryChange={setQuery} onClose={() => setSearch(false)} emptyLabel="No results" loadingLabel="Searching"
      sections={[{id:'chats', label:'Chats', items:['First conversation', 'Second conversation'].filter(label => label.toLowerCase().includes(query.toLowerCase())).map(label => ({id:label, label, metadata:'Project', onSelect:() => {setChosen(label);setSearch(false)}}))}]}/>
    <Dialog open={form} title="Edit connection" onClose={() => setForm(false)} presentation="sheet">
      <h2>Connection</h2><p>Short supporting details.</p><small>Secondary information</small>
      <label>Name<Input aria-label="Name" value={draft} onChange={event => setDraft(event.target.value)}/></label>
      <Select aria-label="Client" value="a" options={[{value:'a',label:'Client A'},{value:'b',label:'Client B'}]} onValueChange={() => {}}/>
    </Dialog>
  </ChatAppSurface></DesktopDocumentAdapter></DesktopRoot>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
