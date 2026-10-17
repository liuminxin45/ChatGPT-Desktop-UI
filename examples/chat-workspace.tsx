import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Button,
  ChatAppSurface,
  ChatHeader,
  ChatWorkspace,
  ComposerActionButton,
  ComposerDock,
  ComposerSurface,
  ConversationMessage,
  ConversationViewport,
  DesktopProvider,
  DismissalLayerProvider,
  Input,
  InternalScrollArea,
  Markdown,
  ScrollEdgeFade,
  ScrollToBottomButton,
  Textarea,
  DesktopMenu,
  Dialog,
  ImageViewer,
  Select,
  SidebarSimple,
  ChatMenuIcon,
  NewConversationIcon,
  DotsThree,
  Gear,
  Moon,
  AttachmentIcon,
  ChevronDownIcon,
} from '../dist/index.js';
import '../dist/components.css';

const dismissals: Array<() => void> = [];
const catalog = new URLSearchParams(location.search).has('catalog');
(window as unknown as { __dismissals: Array<() => void> }).__dismissals = dismissals;
const registerLayer = (dismiss: () => void) => {
  dismissals.push(dismiss);
  return () => {
    const index = dismissals.indexOf(dismiss);
    if (index >= 0) dismissals.splice(index, 1);
  };
};
function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [preview, setPreview] = useState(false);
  const [open, setOpen] = useState(catalog || !matchMedia('(max-width:767px)').matches);
  const [draft, setDraft] = useState(''),
    [dialog, setDialog] = useState(false),
    [above, setAbove] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null),
    scroll = useRef<HTMLDivElement>(null);
  const more = (
    <DesktopMenu
      trigger={<Button iconOnly aria-label="More" icon={<DotsThree />} />}
      items={[
        { id: 'settings', label: 'Settings', icon: <Gear />, onSelect: () => setDialog(true) },
        {
          id: 'theme',
          label: 'Change theme',
          icon: <Moon />,
          onSelect: () => setTheme(theme === 'light' ? 'dark' : 'light'),
        },
      ]}
    />
  );
  return (
    <DismissalLayerProvider registerLayer={registerLayer}>
      <DesktopProvider
        className="fixture-root"
        theme={theme}
        onThemeChange={(value) => setTheme(value === 'dark' ? 'dark' : 'light')}
      >
        <ChatAppSurface>
          <ChatWorkspace
            sidebarPresentation={catalog ? 'catalog' : 'drawer'}
            sidebarOpen={open}
            onSidebarOpenChange={setOpen}
            sidebarLabel="Conversations"
            closeSidebarLabel="Close conversations"
            sidebar={
              <>
                <ChatHeader
                  title="Conversations"
                  actions={
                    <Button
                      iconOnly
                      aria-label="Close conversations"
                      icon={<SidebarSimple />}
                      onClick={() => setOpen(false)}
                    />
                  }
                />
                <div className="fixture-search">
                  <Input aria-label="Search conversations" placeholder="Search conversations" />
                </div>
                <InternalScrollArea>
                  {['Plan a quiet weekend', 'Understand the night sky', 'A shared reading list'].map(
                    (title) => (
                      <Button
                        key={title}
                        layout="row"
                        variant="ghost"
                        onClick={() => {
                          if (matchMedia('(max-width:767px)').matches) setOpen(false);
                        }}
                      >
                        {title}
                      </Button>
                    ),
                  )}
                </InternalScrollArea>
              </>
            }
            header={
              <ChatHeader
                hideMobileTitle
                title="Plan a quiet weekend"
                subtitle="Personal project"
                mobileTitle={
                  <Button variant="ghost" onClick={() => setDialog(true)}>
                    ChatGPT <ChevronDownIcon />
                  </Button>
                }
                leading={
                  <Button
                    iconOnly
                    aria-label="Toggle conversations"
                    aria-expanded={open}
                    icon={<ChatMenuIcon />}
                    onClick={() => setOpen(!open)}
                  />
                }
                actions={
                  <>
                    <Button
                      iconOnly
                      aria-label="New conversation"
                      icon={<NewConversationIcon />}
                      onClick={() => setDialog(true)}
                    />
                    {more}
                  </>
                }
              />
            }
          >
            <ConversationViewport>
              <ScrollEdgeFade>
                <InternalScrollArea
                  ref={scroll}
                  aria-label="Messages"
                  onScroll={(event) => {
                    const e = event.currentTarget;
                    setAbove(e.scrollHeight - e.scrollTop - e.clientHeight > 40);
                  }}
                >
                  <div className="fixture-column">
                    {Array.from({ length: 4 }, (_, n) => (
                      <div key={n}>
                        <ConversationMessage role="user" label="You">
                          Help me plan a quiet weekend near the coast.
                        </ConversationMessage>
                        <ConversationMessage
                          role="assistant"
                          label="ChatGPT"
                          actions={
                            <Button variant="ghost" size="sm" onClick={() => setDraft('Continue the plan')}>
                              Continue
                            </Button>
                          }
                        >
                          <Markdown variant="ai">
                            {'## Leave a little room\n\nStart with a slow morning walk, choose one small place to explore, and leave the rest of the day open.\n\n- Take the coastal path\n- Stop for lunch in the village\n- Read beside the water\n\n' +
                              'Keep the plan flexible and enjoy the changing light.\n\n'.repeat(3)}
                          </Markdown>
                        </ConversationMessage>
                      </div>
                    ))}
                  </div>
                </InternalScrollArea>
              </ScrollEdgeFade>
              <ScrollToBottomButton
                visible={above}
                actionId="fixture.bottom"
                onClick={() =>
                  scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: 'smooth' })
                }
              />
            </ConversationViewport>
            <ComposerDock>
              <div className="fixture-column">
                <ComposerSurface
                  layout="chat"
                  input={
                    <Textarea
                      ref={input}
                      autoSize
                      aria-label="Message"
                      placeholder="Ask anything"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                  }
                  leading={
                    <Button
                      iconOnly
                      aria-label="Add attachment"
                      icon={<AttachmentIcon />}
                      onClick={() => setDialog(true)}
                    />
                  }
                  controls={
                    <Select
                      aria-label="Model"
                      value="standard"
                      onValueChange={() => {}}
                      options={[
                        { value: 'standard', label: 'Standard' },
                        { value: 'extended', label: 'Extended thinking' },
                      ]}
                    />
                  }
                  action={
                    <ComposerActionButton
                      state="ready"
                      actionId="fixture.send"
                      onSend={() => setDraft('')}
                      sendDisabled={!draft.trim()}
                    />
                  }
                />
              </div>
            </ComposerDock>
          </ChatWorkspace>
          <Dialog
            open={dialog}
            title="Conversation options"
            presentation="sheet"
            onClose={() => setDialog(false)}
          >
            <Button onClick={() => setPreview(true)}>Inspect image</Button>
            <Select
              aria-label="Reasoning"
              value="standard"
              onValueChange={() => {}}
              options={[
                { value: 'standard', label: 'Standard' },
                { value: 'extended', label: 'Extended' },
              ]}
            />
          </Dialog>
          <ImageViewer
            open={preview}
            title="Image preview"
            alt="Coastal drawing"
            onClose={() => setPreview(false)}
            src="/fixture-image.svg"
          />
        </ChatAppSurface>
      </DesktopProvider>
    </DismissalLayerProvider>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
