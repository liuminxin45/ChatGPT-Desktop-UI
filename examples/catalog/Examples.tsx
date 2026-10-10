import { useState } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  InlineNotice,
  Button,
  IconButton,
  Input,
  InputGroup,
  Textarea,
  Checkbox,
  Switch,
  Select,
  EditableCombobox,
  Tabs,
  MenuButton,
  Dialog,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  Markdown,
  Surface,
  PageHeader,
  PageBar,
  PageToolbar,
  WorkbenchPage,
  FloatingLauncher,
  FloatingPanel,
  InternalScrollArea,
  FixedVirtualList,
  UIStringsProvider,
  InputBehaviorRoot,
  DesktopShell,
  TitleBar,
  NavigationRail,
  SettingsNavigation,
  SettingsPage,
  SettingsSection,
  SettingRow,
  DesktopClientSurface,
  ClientSidebar,
  SidebarSection,
  DesktopMenu,
  SettingsGroup,
  SettingsField,
  SettingsDisclosure,
  ClientComposer,
  ConversationMessage,
  Plus,
  House,
  Gear,
} from '../../src';

export function Examples({ family }: { family: string }) {
  const [value, setValue] = useState('Release notes');
  const [selected, setSelected] = useState('design');
  const [checked, setChecked] = useState(true);
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState(true);
  const [submitted, setSubmitted] = useState('');
  const field = (
    <Input aria-label="Project name" value={value} onChange={(event) => setValue(event.target.value)} />
  );
  const select = (
    <Select
      actionId="reference.project.select"
      aria-label="Project"
      value={selected}
      onValueChange={setSelected}
      options={[
        { value: 'design', label: 'Design system' },
        { value: 'release', label: 'Release planning' },
        { value: 'archive', label: 'Archived', disabled: true },
      ]}
    />
  );
  if (family === 'tables')
    return (
      <>
        <Table density="compact">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Issue</TableHeaderCell>
              <TableHeaderCell>Classification</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>BUG-1024</TableCell>
              <TableCell>{select}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <InlineNotice
          tone="warning"
          title="Classification needs confirmation"
          description="Review the module before generating a report."
          actions={<Button actionId="reference.condition.review">Review</Button>}
        />
      </>
    );
  if (family === 'actions')
    return (
      <>
        <Button actionId="reference.action" icon={<Plus />} onClick={() => setSubmitted('Project created')}>
          New project
        </Button>
        <Button disabled>Unavailable</Button>
        <IconButton actionId="reference.add" aria-label="Add" onClick={() => setSubmitted('Item added')}>
          <Plus />
        </IconButton>
        <FloatingLauncher
          actionId="reference.launcher"
          aria-label="Open assistant"
          onClick={() => setOpen(!open)}
          icon={<Plus />}
          iconOnly
        />
        {open && <FloatingPanel>Assistant panel</FloatingPanel>}
        <span role="status">{submitted}</span>
      </>
    );
  if (family === 'forms')
    return (
      <div className="reference-fields">
        {field}
        <InputGroup>
          <span aria-hidden="true">⌕</span>
          <Input aria-label="Search projects" placeholder="Search projects" />
          <Button actionId="reference.search.clear">Clear</Button>
        </InputGroup>
        <Textarea aria-label="Notes" placeholder="Add a note" />
        <EditableCombobox
          actionId="reference.project.edit"
          aria-label="Editable project"
          value={value}
          onValueChange={setValue}
          options={[{ value: 'Release notes' }, { value: 'Integration checklist' }]}
        />
        {select}
        <label>
          <Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} /> Include
          completed work
        </label>
        <Switch
          actionId="reference.notifications"
          aria-label="Notifications"
          checked={checked}
          onClick={() => setChecked(!checked)}
        />
        <Input aria-label="Unavailable field" disabled placeholder="Unavailable" />
        <Input aria-label="Invalid field" aria-invalid="true" defaultValue="Missing owner" />
      </div>
    );
  if (family === 'navigation')
    return (
      <Tabs
        actionId="reference.tabs"
        ariaLabel="Project views"
        value={selected}
        onValueChange={setSelected}
        items={[
          { value: 'design', label: 'Design' },
          { value: 'release', label: 'Release' },
          { value: 'archive', label: 'Archived', disabled: true },
        ]}
      />
    );
  if (family === 'overlays')
    return (
      <>
        <MenuButton
          label="Actions"
          actionId="reference.menu"
          items={[
            {
              label: 'Rename',
              actionId: 'reference.rename',
              onSelect: () => setSubmitted('Rename selected'),
            },
            { label: 'Archive', actionId: 'reference.archive', disabled: true, onSelect: () => {} },
          ]}
        />
        <Button actionId="reference.dialog.open" onClick={() => setOpen(true)}>
          Edit project
        </Button>
        <Dialog
          actionId="reference.dialog"
          open={open}
          onClose={() => setOpen(false)}
          title="Edit project"
          footer={
            <Button
              actionId="reference.dialog.save"
              onClick={() => {
                setSubmitted('Saved');
                setOpen(false);
              }}
            >
              Save
            </Button>
          }
        >
          {field}
        </Dialog>
        <span role="status">{submitted}</span>
      </>
    );
  if (family === 'feedback')
    return (
      <>
        <EmptyState
          title="No archived conversations"
          action={
            <Button onClick={() => setSubmitted('Conversation restored')} actionId="reference.restore">
              Restore
            </Button>
          }
        />
        <ErrorState
          description="The connection was interrupted."
          action={
            <Button actionId="reference.retry" onClick={() => setSubmitted('Connection restored')}>
              Try again
            </Button>
          }
        />
        <LoadingSkeleton />
        <Markdown>{'**Release checklist**\n\n- Review changes\n- Verify the build'}</Markdown>
        <span role="status">{submitted}</span>
      </>
    );
  if (family === 'layout')
    return (
      <Surface>
        <WorkbenchPage>
          <PageBar
            navigation={<span>Release planning</span>}
            actions={<Button actionId="reference.layout.add">New task</Button>}
          />
          <PageToolbar>{select}</PageToolbar>
          <PageHeader title="Milestones" />
          <InternalScrollArea>Project content fills the available workspace.</InternalScrollArea>
        </WorkbenchPage>
      </Surface>
    );
  if (family === 'lists' || family === 'runtime')
    return (
      <UIStringsProvider>
        <InputBehaviorRoot>
          <div className="reference-fields">
            {field}
            <div className="reference-list">
              <FixedVirtualList
                items={Array.from({ length: 500 }, (_, index) => ({
                  id: index,
                  label: `Review item ${index + 1}`,
                }))}
                getItemKey={(item) => item.id}
                rowHeight={36}
                ariaLabel="Review items"
                renderItem={(item) => <div>{item.label}</div>}
              />
            </div>
          </div>
        </InputBehaviorRoot>
      </UIStringsProvider>
    );
  if (family === 'conversation')
    return (
      <div className="reference-chat">
        <ConversationMessage role="assistant" label="Assistant">
          The integration checklist is ready for review.
        </ConversationMessage>
        <ClientComposer
          actionId="reference.message"
          label="Message"
          value={value}
          onValueChange={setValue}
          onSubmit={() => {
            setSubmitted(value);
            setValue('');
          }}
          context={<span>This computer</span>}
        />
        <span role="status">{submitted}</span>
      </div>
    );
  if (family === 'client')
    return (
      <DesktopClientSurface>
        <div className="reference-client">
          <ClientSidebar header={<span>Codex</span>}>
            <SidebarSection
              title="Projects"
              open={section}
              onOpenChange={setSection}
              actionId="reference.projects.toggle"
            >
              <Button actionId="reference.project.open">Design system</Button>
            </SidebarSection>
          </ClientSidebar>
          <SettingsGroup title="General">
            <SettingsField label="Project name">{field}</SettingsField>
            <SettingsDisclosure title="Advanced">
              <SettingsField label="Project">{select}</SettingsField>
            </SettingsDisclosure>
            <DesktopMenu
              trigger={<Button actionId="reference.client.menu">Project actions</Button>}
              items={[
                {
                  id: 'reference.client.rename',
                  label: 'Rename',
                  onSelect: () => setSubmitted('Rename selected'),
                },
              ]}
            />
          </SettingsGroup>
        </div>
      </DesktopClientSurface>
    );
  return (
    <div className="reference-shell">
      <DesktopShell
        titlebar={<TitleBar />}
        navigation={
          <NavigationRail
            items={[
              { id: 'design', label: 'Home', icon: House },
              { id: 'release', label: 'Settings', icon: Gear },
            ]}
            selected={selected}
            onSelect={setSelected}
          />
        }
        sidebar={
          <SettingsNavigation
            title="Settings"
            categories={[
              { id: 'design', label: 'Appearance' },
              { id: 'release', label: 'Preferences' },
            ]}
            selected={selected}
            onSelect={setSelected}
          />
        }
      >
        <SettingsPage title="Appearance">
          <SettingsSection title="Display">
            <SettingRow label="Project">{select}</SettingRow>
          </SettingsSection>
        </SettingsPage>
      </DesktopShell>
    </div>
  );
}
