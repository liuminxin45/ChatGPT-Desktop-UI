import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { Button, ClientComposer, DesktopRoot, Input, InputGroup, Textarea } from '../src';
import { Input as HostInput } from '../src/compat/input';
import { Textarea as HostTextarea } from '../src/compat/textarea';
import '../src/styles.css';
import './input-contract.css';

const counts: Record<string, number> = {};
Object.assign(window, { inputContract: counts });
function record(id: string) { counts[id] = (counts[id] || 0) + 1; }
function Example() {
  const [draft, setDraft] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [sharedDraft, setSharedDraft] = useState('');
  const [busy, setBusy] = useState(false);
  return <main style={{ padding: 24, maxWidth: 760, margin: 'auto' }}>
    <form onSubmit={event => { event.preventDefault(); record('form'); }}>
      <Input aria-label="Form field" required />
      <Textarea aria-label="Form notes" />
      <Button type="submit" actionId="example.form.confirm">Confirm form</Button>
    </form>
    <section data-desktop-input-scope style={{ marginBlock: 24 }}>
      <Input aria-label="Scoped name" />
      <HostInput aria-label="Host name" />
      <HostTextarea aria-label="Host notes" />
      <textarea aria-label="Native notes" />
      <input aria-label="Unmanaged native field" style={{ border: 0, outline: "none" }} />
      <div role="textbox" aria-label="Rich notes" contentEditable suppressContentEditableWarning style={{ minHeight: 60 }} />
      <Button confirmOnEnter actionId="example.scope.confirm" disabled={disabled} onClick={() => record('scope')}>Confirm changes</Button>
      <Button actionId="example.scope.disable" onClick={() => setDisabled(value => !value)}>Toggle disabled</Button>
      <div data-desktop-input-scope><Input aria-label="Nested filter" /><Button actionId="example.filter.clear">Clear filter</Button></div>
    </section>
    <div className="desktop-composer" style={{ padding: 12 }}>
      <Textarea aria-label="Message" value={draft} onChange={event => setDraft(event.target.value)} />
      <Button confirmOnEnter actionId="example.message.send" disabled={!draft.trim()} onClick={() => { record('send'); setDraft(''); }}>Send</Button>
    </div>
    <div className="desktop-toolbar-search"><Input aria-label="Live filter" /></div>
    <InputGroup data-testid="compound"><span aria-hidden="true">⌕</span><Input aria-label="Compound filter" value={draft} onChange={event => setDraft(event.target.value)} /><Button actionId="example.compound.clear" onClick={() => setDraft('')}>Clear</Button></InputGroup>
    <InputGroup><span aria-hidden="true">⌕</span><HostInput aria-label="Invalid compound" aria-invalid="true" /></InputGroup>
    <InputGroup><span aria-hidden="true">⌕</span><Input aria-label="Disabled compound" disabled value="Disabled" readOnly /></InputGroup>
    <InputGroup><span aria-hidden="true">⌕</span><Input aria-label="Read only compound" readOnly value="Retained value" /></InputGroup>
    <ClientComposer label="Shared composer" variant="chat" actionId="example.shared.message"
      value={sharedDraft} onValueChange={setSharedDraft} busy={busy}
      sendLabel="Send sample" stopLabel="Stop sample"
      onSubmit={() => { record('clientSend'); setBusy(true); }}
      onStop={() => { record('clientStop'); setBusy(false); }}
      leading={<Button aria-label="Sample attachments" disabled>+</Button>} />
    <InputGroup className="legacy-search"><Input aria-label="Legacy filter" /></InputGroup>
    <Textarea aria-label="Read only" readOnly value="Read only content" />
    <div data-desktop-input-scope><Input aria-label="Ambiguous field" /><Button confirmOnEnter onClick={() => record('first')}>First</Button><Button confirmOnEnter onClick={() => record('second')}>Second</Button></div>
    <div data-desktop-input-scope><Input aria-label="Hidden action field" /><Button confirmOnEnter hidden onClick={() => record('hidden')}>Hidden</Button></div>
    {createPortal(<section role="dialog" aria-label="Portal form"><Input aria-label="Portal field" /><Button confirmOnEnter actionId="example.portal.confirm" onClick={() => record('portal')}>Confirm portal</Button></section>, document.body)}
  </main>;
}
createRoot(document.getElementById('root')!).render(<DesktopRoot><Example /></DesktopRoot>);
