import { useEffect, useRef, useState } from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import {
  ArrowLeft,
  ArrowRight,
  SidebarSimple,
  Minus,
  SquaresFour,
  X,
  DotsThree,
  Plus,
  Folder,
  PushPin,
  NotePencil,
  Bell,
  MagnifyingGlass,
  Circle,
  CaretDown,
  Gear,
  List,
  Files,
  Globe,
  Terminal,
  ChatCircle,
  Microphone,
  Waveform,
  ArrowUp,
  ShieldWarning,
  Desktop,
  Paperclip,
} from "@phosphor-icons/react";
import {
  DesktopClientSurface,
  DesktopShell,
  DesktopMenu,
  ClientSidebar,
  SidebarSection,
  SettingsNavigation,
  IconButton,
  Button,
  Input,
  Textarea,
  InternalScrollArea,
  Tooltip,
  Dialog,
  useDesktopTheme,
  type DesktopMenuItem,
} from "../../src";
import {
  initialProjects,
  pinnedChats,
  railItems,
  settingsCategories,
  CLIENT_VERSION,
  type DemoChat,
  type DemoProject,
} from "./client-data";
import { ProjectDirectory, ScheduleLanding } from "./ClientDestinations";
import { ClientProfile } from "./ClientProfile";
import { ClientSettings } from "./ClientSettings";
import {
  projectMenu,
  chatMenu,
  helpMenu,
  profileMenu,
  type Actions,
} from "./client-menus";
interface Route {
  page: string;
  category: string;
  project: string;
  chat: string;
}
const start: Route = {
  page: "home",
  category: "general",
  project: "desktop",
  chat: "",
};
export function CodexMark() {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 52 52"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M17 8c2-6 15-6 18 1 8 0 13 9 9 16 5 8-1 17-9 17-6 8-18 5-21-2-9 0-13-11-7-17-3-8 2-15 10-15Z"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="m18 21 5 5-5 5m10 0h7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function ClientDemo() {
  const [renaming, setRenaming] = useState<DemoChat | null>(null),
    [renameTitle, setRenameTitle] = useState(""),
    [removing, setRemoving] = useState<DemoProject | null>(null);
  const { theme, setTheme } = useDesktopTheme();
  const [history, setHistory] = useState({ entries: [start], index: 0 });
  const route = history.entries[history.index];
  const navigate = (patch: Partial<Route>) =>
    setHistory((old) => {
      const next = { ...old.entries[old.index], ...patch };
      return JSON.stringify(next) === JSON.stringify(old.entries[old.index])
        ? old
        : {
            entries: [...old.entries.slice(0, old.index + 1), next],
            index: old.index + 1,
          };
    });
  const go = (offset: number) =>
    setHistory((old) => ({
      ...old,
      index: Math.max(0, Math.min(old.entries.length - 1, old.index + offset)),
    }));
  const [sidebar, setSidebar] = useState(true),
    [activity, setActivity] = useState(false),
    [mode, setMode] = useState("Codex"),
    [pins, setPins] = useState(["projects", "sites", "maps", "gpts", "review"]);
  const [moreChats, setMoreChats] = useState<string[]>([]);
  const [projects, setProjects] = useState(initialProjects),
    [pinned, setPinned] = useState(pinnedChats),
    [expanded, setExpanded] = useState(["desktop", "studio", "notes"]);
  const [search, setSearch] = useState(false),
    [query, setQuery] = useState(""),
    [create, setCreate] = useState(false),
    [name, setName] = useState(""),
    [folder, setFolder] = useState(""),
    [error, setError] = useState(""),
    [discard, setDiscard] = useState(false);
  const [panel, setPanel] = useState(false),
    [info, setInfo] = useState<{ title: string; body: string } | null>(null),
    [editing, setEditing] = useState<DemoProject | null>(null),
    [editName, setEditName] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({}),
    [messages, setMessages] = useState<
      Record<string, { own: boolean; text: string }[]>
    >({}),
    [model, setModel] = useState("GPT-6.1 Sol"),
    [effort, setEffort] = useState("High"),
    [access, setAccess] = useState("Full access");
  const composer = useRef<HTMLTextAreaElement>(null);
  const key = route.chat || `new:${route.project}`,
    draft = drafts[key] || "";
  const chats = [...pinned, ...projects.flatMap((item) => item.chats)].filter(
      (item, index, items) =>
        items.findIndex((other) => other.id === item.id) === index,
    ),
    chat = chats.find((item) => item.id === route.chat),
    project = projects.find((item) => item.id === route.project);
  const newChat = (projectId = route.project) => {
    navigate({ page: "home", project: projectId, chat: "" });
    setTimeout(() => composer.current?.focus(), 0);
  };
  const settings = (category = "general") =>
    navigate({ page: "settings", category });
  const showInfo = (title: string, body: string) => setInfo({ title, body });
  const select = (item: DemoChat) => {
    navigate({ page: "home", project: item.project, chat: item.id });
    setSearch(false);
    setQuery("");
  };
  const pin = (item: DemoChat) =>
    setPinned((old) =>
      old.some((chat) => chat.id === item.id)
        ? old.filter((chat) => chat.id !== item.id)
        : [...old, { ...item, pinned: true }],
    );
  const archive = (item: DemoChat) => {
    setProjects((old) =>
      old.map((project) => ({
        ...project,
        chats: project.chats.filter((chat) => chat.id !== item.id),
      })),
    );
    setPinned((old) => old.filter((chat) => chat.id !== item.id));
    if (route.chat === item.id) newChat();
  };
  const actions: Actions = {
    newChat,
    settings,
    create: () => setCreate(true),
    info: showInfo,
    panel: () => setPanel(true),
    pin,
    archive,
    rename: (item) => {
      setRenaming(item);
      setRenameTitle(item.title);
    },
    remove: (item) => setRemoving(item),
    edit: (item) => {
      setEditing(item);
      setEditName(item.name);
    },
    projectPin: (item) =>
      setProjects((old) =>
        old.map((project) =>
          project.id === item.id
            ? { ...project, pinned: !project.pinned }
            : project,
        ),
      ),
    projectArchive: (item) =>
      setProjects((old) =>
        old.map((project) =>
          project.id === item.id ? { ...project, chats: [] } : project,
        ),
      ),
  };
  const send = () => {
    if (!draft.trim()) return;
    const id = route.chat || `chat-${crypto.randomUUID()}`;
    if (!route.chat) {
      const item = {
        id,
        title: draft.trim().slice(0, 62),
        preview: draft.trim(),
        project: route.project,
      };
      if (route.project)
        setProjects((old) =>
          old.map((project) =>
            project.id === route.project
              ? { ...project, chats: [item, ...project.chats] }
              : project,
          ),
        );
      else setPinned((old) => [...old, item]);
      navigate({ chat: id });
    }
    setMessages((old) => ({
      ...old,
      [id]: [
        ...(old[id] || []),
        { own: true, text: draft.trim() },
        {
          own: false,
          text: "The draft is ready for review. I kept the navigation compact and checked the menu and keyboard behavior.",
        },
      ],
    }));
    setDrafts((old) => ({ ...old, [key]: "" }));
  };
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (["k", "n", ",", "b", "t"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        if (e.key === "k") setSearch(true);
        if (e.key === "n") newChat();
        if (e.key === ",") settings();
        if (e.key === "b") setSidebar((old) => !old);
        if (e.key === "t") setPanel(true);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [route.project]);
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (name || Object.values(drafts).some(Boolean)) e.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [drafts, name]);
  const closeCreate = () => {
    if (name || folder) setDiscard(true);
    else {
      setCreate(false);
      setError("");
    }
  };
  const createProject = () => {
    if (!name.trim()) {
      setError("Enter a project name.");
      return;
    }
    if (
      projects.some(
        (item) => item.name.toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      setError("A project with this name already exists.");
      return;
    }
    const id = `project-${crypto.randomUUID()}`;
    setProjects((old) => [...old, { id, name: name.trim(), chats: [] }]);
    setExpanded((old) => [...old, id]);
    setCreate(false);
    setName("");
    setFolder("");
    newChat(id);
  };
  const file: DesktopMenuItem[] = [
    { id: "client.file.window", label: "New Window", disabled: true },
    {
      id: "client.file.chat",
      label: "New Chat",
      shortcut: "Ctrl+N",
      onSelect: () => newChat(),
    },
    {
      id: "client.file.temporary",
      label: "New Temporary Chat",
      shortcut: "Ctrl+Shift+N",
      disabled: true,
    },
    {
      id: "client.file.folder",
      label: "Open Folder...",
      shortcut: "Ctrl+O",
      separator: true,
      onSelect: actions.create,
    },
    {
      id: "client.file.close",
      label: "Close",
      shortcut: "Ctrl+W",
      separator: true,
      onSelect: () => (panel ? setPanel(false) : newChat()),
    },
    {
      id: "client.file.logout",
      label: "Log Out",
      separator: true,
      disabled: true,
    },
    {
      id: "client.file.quit",
      label: "Quit ChatGPT",
      shortcut: "Ctrl+Q",
      disabled: true,
    },
  ];
  const edit: DesktopMenuItem[] = [
    {
      id: "client.edit.undo",
      label: "Undo",
      shortcut: "Ctrl+Z",
      disabled: true,
    },
    {
      id: "client.edit.redo",
      label: "Redo",
      shortcut: "Ctrl+Y",
      disabled: true,
    },
    {
      id: "client.edit.cut",
      label: "Cut",
      shortcut: "Ctrl+X",
      separator: true,
      disabled: true,
    },
    {
      id: "client.edit.copy",
      label: "Copy",
      shortcut: "Ctrl+C",
      disabled: true,
    },
    {
      id: "client.edit.paste",
      label: "Paste",
      shortcut: "Ctrl+V",
      disabled: true,
    },
    { id: "client.edit.delete", label: "Delete", disabled: true },
    {
      id: "client.edit.all",
      disabled: route.page !== "home",
      label: "Select All",
      shortcut: "Ctrl+A",
      separator: true,
      onSelect: () => {
        composer.current?.focus();
        composer.current?.select();
      },
    },
    {
      id: "client.edit.settings",
      label: "Settings...",
      shortcut: "Ctrl+,",
      separator: true,
      onSelect: () => settings(),
    },
  ];
  const view: DesktopMenuItem[] = [
    {
      id: "client.view.bottom",
      label: "Toggle Bottom Panel",
      shortcut: "Ctrl+J",
      onSelect: () => setPanel(!panel),
    },
    {
      id: "client.view.summary",
      label: "Toggle Pinned Summary",
      onSelect: () =>
        showInfo("Pinned summary", chat?.preview || "No summary pinned"),
    },
    {
      id: "client.view.terminal",
      label: "Open Terminal",
      shortcut: "Ctrl+`",
      onSelect: () => setPanel(true),
    },
    {
      id: "client.view.navigation",
      label: "Toggle navigation panel",
      shortcut: "Ctrl+Shift+E",
      onSelect: () => setSidebar(!sidebar),
    },
    {
      id: "client.view.tabs",
      label: "Switch between Chat and tabs",
      shortcut: "Alt+Ctrl+B",
      onSelect: () => setPanel(!panel),
    },
    {
      id: "client.view.browser",
      label: "Browser",
      separator: true,
      children: [
        {
          id: "client.browser.tab",
          label: "New Tab",
          shortcut: "Ctrl+T",
          onSelect: () => setPanel(true),
        },
        {
          id: "client.browser.close",
          label: "Close Tab",
          shortcut: "Ctrl+W",
          onSelect: () => setPanel(false),
        },
      ],
    },
    {
      id: "client.view.find",
      label: "Find",
      separator: true,
      shortcut: "Ctrl+F",
      onSelect: () => setSearch(true),
    },
    {
      id: "client.view.previous",
      label: "Previous Chat",
      separator: true,
      shortcut: "Ctrl+Shift+[",
      onSelect: () =>
        select(
          chats[
            Math.max(0, chats.findIndex((item) => item.id === route.chat) - 1)
          ],
        ),
    },
    {
      id: "client.view.next",
      label: "Next Chat",
      shortcut: "Ctrl+Shift+]",
      onSelect: () =>
        select(
          chats[
            Math.min(
              chats.length - 1,
              chats.findIndex((item) => item.id === route.chat) + 1,
            )
          ],
        ),
    },
    {
      id: "client.view.back",
      label: "Back",
      shortcut: "Ctrl+[",
      disabled: !history.index,
      onSelect: () => go(-1),
    },
    {
      id: "client.view.forward",
      label: "Forward",
      disabled: history.index === history.entries.length - 1,
      onSelect: () => go(1),
    },
    {
      id: "client.view.zoom-in",
      label: "Zoom In",
      shortcut: "Ctrl+Shift+=",
      separator: true,
      disabled: true,
    },
    {
      id: "client.view.zoom-out",
      label: "Zoom Out",
      shortcut: "Ctrl+-",
      disabled: true,
    },
    {
      id: "client.view.zoom-reset",
      label: "Actual Size",
      shortcut: "Ctrl+0",
      disabled: true,
    },
    {
      id: "client.view.fullscreen",
      label: "Toggle Full Screen",
      shortcut: "F11",
      separator: true,
      onSelect: () => {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen();
      },
    },
  ];
  const topbar = (
    <header className="kit-titlebar" data-desktop-surface="client.titlebar">
      <div className="kit-titlebar__actions">
        <IconButton
          aria-label="Back"
          actionId="client.history.back"
          disabled={!history.index}
          onClick={() => go(-1)}
        >
          <ArrowLeft size={16} />
        </IconButton>
        <IconButton
          aria-label="Forward"
          actionId="client.history.forward"
          disabled={history.index === history.entries.length - 1}
          onClick={() => go(1)}
        >
          <ArrowRight size={16} />
        </IconButton>
        <IconButton
          aria-label="Toggle sidebar"
          actionId="client.sidebar.toggle"
          onClick={() => setSidebar(!sidebar)}
        >
          <SidebarSimple size={16} />
        </IconButton>
        {[
          ["File", file],
          ["Edit", edit],
          ["View", view],
          ["Help", helpMenu(actions, CLIENT_VERSION)],
        ].map(([label, items]) => (
          <DesktopMenu
            key={String(label)}
            trigger={
              <button
                type="button"
                data-desktop-action="client.menu.open"
                className="kit-titlebar__menu"
              >
                {String(label)}
              </button>
            }
            items={items as DesktopMenuItem[]}
            className="client-native-menu"
          />
        ))}
      </div>
      <div className="client-window-actions">
        <IconButton aria-label="Minimize window" disabled>
          <Minus size={14} />
        </IconButton>
        <IconButton
          aria-label="Maximize preview"
          actionId="client.window.maximize"
          onClick={() => {
            if (document.fullscreenElement) void document.exitFullscreen();
            else void document.documentElement.requestFullscreen();
          }}
        >
          <SquaresFour size={13} />
        </IconButton>
        <IconButton aria-label="Close window" disabled>
          <X size={16} />
        </IconButton>
      </div>
    </header>
  );
  const profile = (
    <DesktopMenu
      side="right"
      align="end"
      heading={
        <div className="client-profile-heading">
          <span>🦊</span>
          <div>
            Alex Taylor<small>Pro</small>
          </div>
        </div>
      }
      trigger={
        <button
          type="button"
          className="client-avatar-button"
          aria-label="Open profile menu"
          data-desktop-action="client.profile.open"
        >
          🦊
        </button>
      }
      items={profileMenu(actions, CLIENT_VERSION)}
    />
  );
  const rail = (
    <nav className="kit-rail client-rail" aria-label="App navigation">
      <div className="kit-rail__items">
        {railItems.slice(0, 4).map((item) => (
          <Tooltip label={item.label} key={item.id}>
            <IconButton
              className="kit-rail__item"
              aria-label={item.label}
              aria-current={route.page === item.id ? "page" : undefined}
              actionId={`client.navigation.${item.id}`}
              onClick={() => navigate({ page: item.id })}
            >
              <item.icon
                size={20}
                weight={route.page === item.id ? "fill" : "regular"}
              />
            </IconButton>
          </Tooltip>
        ))}
        <Menu.Root>
          <Tooltip label="Explore">
            <Menu.Trigger asChild>
              <button
                type="button"
                className="desktop-icon-control kit-rail__item"
                aria-label="Explore"
              >
                <DotsThree size={20} />
              </button>
            </Menu.Trigger>
          </Tooltip>
          <Menu.Portal>
            <Menu.Content
              side="right"
              align="start"
              sideOffset={5}
              className="desktop-menu client-explore-menu"
              collisionPadding={8}
            >
              {railItems.slice(4).map((item) => (
                <div className="kit-navigation-menu__row" key={item.id}>
                  <Menu.Item
                    className="desktop-menu-item kit-navigation-menu__destination"
                    onSelect={() => navigate({ page: item.id })}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Menu.Item>
                  <Menu.CheckboxItem
                    checked={pins.includes(item.id)}
                    className="desktop-menu-item kit-navigation-menu__pin"
                    aria-label={`${pins.includes(item.id) ? "Unpin" : "Pin"} ${item.label}`}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={() =>
                      setPins((old) =>
                        old.includes(item.id)
                          ? old.filter((id) => id !== item.id)
                          : [...old, item.id],
                      )
                    }
                  >
                    <PushPin
                      size={15}
                      weight={pins.includes(item.id) ? "fill" : "regular"}
                    />
                  </Menu.CheckboxItem>
                </div>
              ))}
            </Menu.Content>
          </Menu.Portal>
        </Menu.Root>
        <div className="client-rail-divider" />
        {railItems
          .slice(4)
          .filter((item) => pins.includes(item.id))
          .reverse()
          .map((item) => (
            <Tooltip label={item.label} key={item.id}>
              <IconButton
                className="kit-rail__item"
                aria-label={item.label}
                actionId={`client.navigation.${item.id}`}
                onClick={() => navigate({ page: item.id })}
              >
                <item.icon size={20} />
              </IconButton>
            </Tooltip>
          ))}
      </div>
      <div className="kit-rail__footer">{profile}</div>
    </nav>
  );
  const chatRow = (item: DemoChat, detailed = false) => (
    <div
      key={item.id}
      className={`client-chat-row${route.chat === item.id ? " client-chat-row--selected" : ""}${detailed ? " client-chat-row--activity" : ""}`}
    >
      <button
        type="button"
        className="client-chat-select"
        data-desktop-action="client.chat.select"
        onClick={() => select(item)}
      >
        <span>
          {item.title}
          {detailed && item.project ? (
            <small>
              {" "}
              {projects.find((project) => project.id === item.project)?.name}
            </small>
          ) : null}
        </span>
        {detailed ? <p>{item.preview}</p> : null}
      </button>
      {item.working ? (
        <span className="client-working" aria-label="Working" />
      ) : null}
      <div className="client-row-actions">
        <IconButton
          aria-label={`${pinned.some((chat) => chat.id === item.id) ? "Unpin" : "Pin"} ${item.title}`}
          actionId="client.chat.pin"
          onClick={() => pin(item)}
        >
          <PushPin size={14} />
        </IconButton>
        <DesktopMenu
          trigger={
            <button
              type="button"
              className="desktop-icon-control"
              aria-label={`Actions for ${item.title}`}
            >
              <DotsThree size={16} />
            </button>
          }
          items={chatMenu(
            item,
            pinned.some((chat) => chat.id === item.id),
            actions,
          )}
        />
      </div>
    </div>
  );
  const side = (
    <ClientSidebar
      header={
        <>
          <DesktopMenu
            trigger={
              <button
                className="client-mode"
                type="button"
                aria-label="Switch mode"
              >
                {mode}
                <CaretDown size={12} />
              </button>
            }
            items={["ChatGPT", "Codex"].map((label) => ({
              id: `client.mode.${label.toLowerCase()}`,
              label,
              checked: mode === label,
              onSelect: () => setMode(label),
            }))}
          />
          <div className="client-sidebar-actions">
            <Tooltip
              label={
                activity ? "Turn off activity view" : "Turn on activity view"
              }
            >
              <IconButton
                aria-label="View activity"
                aria-pressed={activity}
                actionId="client.activity.toggle"
                onClick={() => setActivity(!activity)}
              >
                <Bell size={16} />
              </IconButton>
            </Tooltip>
            <IconButton
              aria-label="Search chats"
              actionId="client.search.open"
              onClick={() => setSearch(true)}
            >
              <MagnifyingGlass size={16} />
            </IconButton>
          </div>
        </>
      }
    >
      <Button
        className="client-sidebar-link"
        actionId="client.chat.new"
        onClick={() => newChat("")}
      >
        <NotePencil size={16} />
        New chat
      </Button>
      <Button
        className="client-sidebar-link"
        actionId="client.dot.open"
        onClick={() =>
          showInfo("Your dot", "A quiet place for your notes and ongoing work.")
        }
      >
        <Circle size={13} weight="fill" />
        Your dot
      </Button>
      {activity ? (
        <>
          <SidebarSection title="Priority">
            {chats.slice(0, 11).map((item) => chatRow(item, true))}
          </SidebarSection>
          <SidebarSection title="Today">
            {chats.slice(5).map((item) => chatRow(item, true))}
          </SidebarSection>
        </>
      ) : (
        <>
          <SidebarSection title="Pinned">
            {pinned.map((item) => chatRow(item))}
            {projects
              .filter((item) => item.pinned)
              .map((item) => (
                <Button
                  key={item.id}
                  className="client-sidebar-link"
                  actionId="client.project.open"
                  onClick={() => newChat(item.id)}
                >
                  <Folder size={16} />
                  {item.name}
                </Button>
              ))}
          </SidebarSection>
          <SidebarSection
            title="Projects"
            actions={
              <>
                <IconButton
                  className="client-hover-action"
                  aria-label="Project sidebar options"
                  actionId="client.projects.sort"
                  onClick={() => setProjects((old) => [...old].reverse())}
                >
                  <DotsThree size={16} />
                </IconButton>
                <IconButton
                  className="client-hover-action"
                  aria-label="Add new project"
                  actionId="client.project.create.open"
                  onClick={actions.create}
                >
                  <Plus size={16} />
                </IconButton>
              </>
            }
          >
            {projects.map((item) => (
              <div key={item.id} className="client-project-section">
                <div
                  className={`client-project-row${route.project === item.id && !route.chat ? " client-project-row--selected" : ""}`}
                >
                  <button
                    type="button"
                    className="client-project-select"
                    data-desktop-action="client.project.select"
                    onClick={() => {
                      newChat(item.id);
                      setExpanded((old) =>
                        old.includes(item.id) ? old : [...old, item.id],
                      );
                    }}
                  >
                    <Folder size={16} />
                    <span>{item.name}</span>
                  </button>
                  <div className="client-row-actions">
                    <DesktopMenu
                      trigger={
                        <button
                          className="desktop-icon-control"
                          type="button"
                          aria-label={`Project actions for ${item.name}`}
                        >
                          <DotsThree size={16} />
                        </button>
                      }
                      items={projectMenu(item, actions)}
                    />
                    <IconButton
                      aria-label={`Start new chat in ${item.name}`}
                      actionId="client.project.chat.new"
                      onClick={() => newChat(item.id)}
                    >
                      <NotePencil size={16} />
                    </IconButton>
                  </div>
                </div>
                {expanded.includes(item.id) ? (
                  <div className="client-project-chats">
                    {item.chats
                      .slice(0, moreChats.includes(item.id) ? undefined : 5)
                      .map((item) => chatRow(item))}
                    {item.chats.length > 5 ? (
                      <Button
                        className="client-show-more"
                        actionId="client.project.chats.expand"
                        onClick={() =>
                          setMoreChats((old) =>
                            old.includes(item.id)
                              ? old.filter((id) => id !== item.id)
                              : [...old, item.id],
                          )
                        }
                      >
                        {moreChats.includes(item.id)
                          ? "Show less"
                          : "Show more"}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </SidebarSection>
          <SidebarSection title="Recents">
            {chats.slice(3, 10).map((item) => chatRow(item))}
          </SidebarSection>
        </>
      )}
    </ClientSidebar>
  );
  const composerNode = (
    <div className="client-composer-wrap">
      {project ? (
        <div className="client-composer-context">
          <span>
            <Folder size={14} />
            {project.name}
          </span>
          <span>
            <Desktop size={14} />
            This computer
          </span>
          <IconButton
            aria-label="Project settings"
            actionId="client.project.settings"
            onClick={() => settings()}
          >
            <Gear size={14} />
          </IconButton>
        </div>
      ) : null}
      <form
        className="desktop-composer client-composer"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <Textarea
          ref={composer}
          aria-label="Message"
          placeholder={chat ? "Work with Codex" : "Do anything"}
          value={draft}
          data-desktop-action="client.message.edit"
          onChange={(e) =>
            setDrafts((old) => ({ ...old, [key]: e.target.value }))
          }
        />
        <div className="client-composer-actions">
          <DesktopMenu
            trigger={
              <button
                className="desktop-icon-control"
                type="button"
                aria-label="Add files and more"
              >
                <Plus size={18} />
              </button>
            }
            items={[
              {
                id: "client.composer.attach",
                label: "Add files",
                icon: <Paperclip />,
                disabled: true,
              },
              {
                id: "client.composer.project",
                label: "New project",
                icon: <Folder />,
                onSelect: actions.create,
              },
            ]}
          />
          <DesktopMenu
            trigger={
              <button
                type="button"
                className="client-access"
                aria-label="Change permissions"
              >
                <ShieldWarning size={14} />
                {access}
              </button>
            }
            items={["Full access", "Default permissions"].map((label) => ({
              id: `client.permissions.${label === "Full access" ? "full" : "default"}`,
              label,
              checked: label === access,
              onSelect: () => setAccess(label),
            }))}
          />
          <div className="client-spacer" />
          <DesktopMenu
            trigger={
              <button type="button" className="client-model">
                {model}
                <span>{effort}</span>
                <CaretDown size={12} />
              </button>
            }
            items={["GPT-6.1 Sol", "GPT-6 Sol", "GPT-6 Luna"].map((label) => ({
              id: `client.model.${label.toLowerCase().replaceAll(" ", "-")}`,
              label,
              children: ["Low", "Medium", "High"].map((value) => ({
                id: `client.model.effort.${value.toLowerCase()}`,
                label: value,
                checked: model === label && effort === value,
                onSelect: () => {
                  setModel(label);
                  setEffort(value);
                },
              })),
            }))}
          />
          <IconButton
            aria-label="Dictate"
            actionId="client.voice.preview"
            onClick={() =>
              showInfo(
                "Dictate",
                "Microphone access is not requested in this preview.",
              )
            }
          >
            <Microphone size={16} />
          </IconButton>
          <Button
            type={draft.trim() ? "submit" : "button"}
            className="desktop-send-control"
            aria-label={draft.trim() ? "Send message" : "Start voice mode"}
            actionId="client.message.send"
            onClick={
              !draft.trim()
                ? () =>
                    showInfo(
                      "Voice mode",
                      "Voice is simulated in this preview.",
                    )
                : undefined
            }
          >
            {draft.trim() ? <ArrowUp size={18} /> : <Waveform size={18} />}
          </Button>
        </div>
      </form>
    </div>
  );
  return (
    <DesktopClientSurface>
      <DesktopShell
        titlebar={topbar}
        navigation={rail}
        sidebar={
          <>
            <div
              className="client-retained-sidebar"
              hidden={route.page === "settings" || route.page === "scheduled"}
            >
              {side}
            </div>
            <div
              className="client-retained-sidebar"
              hidden={route.page !== "scheduled"}
            >
              <ClientSidebar
                header={
                  <>
                    <strong>Scheduled</strong>
                    <IconButton
                      aria-label="Search scheduled tasks"
                      actionId="client.schedule.search"
                      onClick={() =>
                        showInfo("Scheduled tasks", "No matching tasks.")
                      }
                    >
                      <MagnifyingGlass size={16} />
                    </IconButton>
                  </>
                }
              >
                <Button
                  className="client-sidebar-link"
                  actionId="client.schedule.new"
                  onClick={() =>
                    showInfo(
                      "New task",
                      "Scheduling is unavailable in this browser preview.",
                    )
                  }
                >
                  <Plus size={16} />
                  New task
                </Button>
                <SidebarSection title="Upcoming">
                  <button
                    className="client-chat-select"
                    data-desktop-action="client.schedule.inspect"
                    onClick={() =>
                      showInfo(
                        "Monthly workspace review",
                        "Nov 1 · Custom schedule",
                      )
                    }
                  >
                    Monthly workspace review
                  </button>
                  <p className="client-schedule-caption">
                    Nov 1 · Custom schedule
                  </p>
                </SidebarSection>
              </ClientSidebar>
            </div>
            <div
              className="client-retained-sidebar"
              hidden={route.page !== "settings"}
            >
              <SettingsNavigation
                categories={settingsCategories}
                selected={route.category}
                onSelect={(id) =>
                  id === "profile"
                    ? navigate({ page: "profile" })
                    : settings(id)
                }
                searchLabel="Search"
              />
            </div>
          </>
        }
        sidebarVisible={
          sidebar && !["profile", "projects"].includes(route.page)
        }
      >
        <div
          className="client-content"
          data-desktop-feature="demo.client"
          data-desktop-surface="demo.client.workspace"
        >
          <section className="client-chat-page" hidden={route.page !== "home"}>
            {chat ? (
              <div className="client-chat-toolbar">
                <Folder size={16} />
                <strong>{chat.title}</strong>
                <div className="client-spacer" />
                <DesktopMenu
                  trigger={
                    <button
                      className="desktop-icon-control"
                      aria-label="Chat actions"
                    >
                      <DotsThree size={18} />
                    </button>
                  }
                  items={chatMenu(
                    chat,
                    pinned.some((item) => item.id === chat.id),
                    actions,
                  )}
                />
                <IconButton
                  aria-label="Toggle pinned summary"
                  actionId="client.summary.toggle"
                  onClick={() => showInfo("Pinned summary", chat.preview)}
                >
                  <List size={17} />
                </IconButton>
                <IconButton
                  aria-label="New tab"
                  actionId="client.tab.new"
                  onClick={() => setPanel(true)}
                >
                  <Plus size={17} />
                </IconButton>
              </div>
            ) : null}
            {chat ? (
              <InternalScrollArea className="client-thread-scroll">
                <div className="client-thread">
                  <div className="client-user-message">
                    Can you help refine the desktop navigation and settings?
                  </div>
                  <article className="client-assistant-message">
                    <p>
                      I’ll keep the familiar sidebar and focus on the
                      interaction details.
                    </p>
                    <p>
                      The project list keeps chats in context. Menus support
                      keyboard navigation, and settings use clear sections with
                      compact controls.
                    </p>
                    <div className="client-tool-line">
                      <NotePencil size={15} />
                      Edited files, ran commands
                    </div>
                    <div className="client-change-summary">
                      <Files size={24} />
                      <div>
                        <strong>Updated 3 files</strong>
                        <span>
                          +42 <small>−16</small>
                        </span>
                      </div>
                      <Button
                        size="sm"
                        actionId="client.changes.open"
                        onClick={() => setPanel(true)}
                      >
                        View changes
                      </Button>
                    </div>
                    <p>
                      The navigation, search, pin controls and theme switch are
                      ready for review.
                    </p>
                  </article>
                  {(messages[route.chat] || []).map((item, index) => (
                    <div
                      key={index}
                      className={
                        item.own
                          ? "client-user-message"
                          : "client-assistant-message"
                      }
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              </InternalScrollArea>
            ) : (
              <div className="client-empty-project">
                <CodexMark />
                <h1>
                  {project ? (
                    <>
                      What should we build in{" "}
                      <button
                        type="button"
                        data-desktop-action="client.project.rename"
                        onClick={() => actions.edit(project)}
                      >
                        {project.name}
                      </button>
                      ?
                    </>
                  ) : (
                    "What should we build?"
                  )}
                </h1>
              </div>
            )}
            {composerNode}
          </section>
          <section
            className="client-settings-page"
            hidden={route.page !== "settings"}
          >
            <ClientSettings category={route.category} onDialog={showInfo} />
          </section>
          {route.page === "profile" ? (
            <ClientProfile onDialog={showInfo} />
          ) : null}
          {route.page === "projects" ? (
            <ProjectDirectory
              projects={projects}
              actions={actions}
              onOpen={(id) => newChat(id)}
            />
          ) : null}
          {route.page === "scheduled" ? (
            <ScheduleLanding onDialog={showInfo} />
          ) : null}
          <section
            className="client-secondary-page"
            hidden={[
              "home",
              "projects",
              "settings",
              "profile",
              "scheduled",
            ].includes(route.page)}
          >
            <h1>{railItems.find((item) => item.id === route.page)?.label}</h1>
            <div className="client-secondary-inner">
              <CodexMark />
              <h2>
                {route.page === "scheduled"
                  ? "No tasks scheduled"
                  : railItems.find((item) => item.id === route.page)?.label}
              </h2>
              <Button
                actionId="client.home.return"
                onClick={() => navigate({ page: "home" })}
              >
                Back to chats
              </Button>
            </div>
          </section>
          {panel ? (
            <aside className="client-right-panel">
              <div className="client-tabbar">
                <span>
                  <Globe size={14} />
                  New tab
                  <IconButton
                    aria-label="Close tab"
                    actionId="client.tab.close"
                    onClick={() => setPanel(false)}
                  >
                    <X size={13} />
                  </IconButton>
                </span>
                <IconButton
                  aria-label="Add tab"
                  actionId="client.tab.add"
                  onClick={() =>
                    showInfo("New tab", "Choose a tool from the preview.")
                  }
                >
                  <Plus size={16} />
                </IconButton>
              </div>
              <div className="client-browserbar">
                <ArrowLeft size={16} />
                <ArrowRight size={16} />
                <Input
                  aria-label="Search or enter a URL"
                  placeholder="Search or enter a URL"
                />
              </div>
              <InternalScrollArea>
                <div className="client-new-tab">
                  <h2>Tools</h2>
                  <div className="client-tools-grid">
                    {[
                      ["Changes", Files],
                      ["Terminal", Terminal],
                      ["Files", Folder],
                      ["Side chat", ChatCircle],
                      ["New page", NotePencil],
                    ].map(([label, Icon]) => {
                      const I = Icon as typeof Files;
                      return (
                        <Button
                          key={String(label)}
                          actionId={`client.tab.tool.${String(label).toLowerCase().replaceAll(" ", "-")}`}
                          onClick={() =>
                            showInfo(
                              String(label),
                              "Native tool content is simulated in this browser preview.",
                            )
                          }
                        >
                          <I size={15} />
                          {String(label)}
                        </Button>
                      );
                    })}
                  </div>
                  <h2>Suggested</h2>
                  <div className="client-suggested">
                    <span>
                      🌐<small>Design review</small>
                    </span>
                    <span>
                      📁<small>Workspace files</small>
                    </span>
                    <span>
                      ⌘<small>Release checklist</small>
                    </span>
                  </div>
                  <h2>Recents</h2>
                  <Button
                    actionId="client.tab.recent"
                    onClick={() =>
                      showInfo(
                        "Desktop UI",
                        "Reference client " + CLIENT_VERSION,
                      )
                    }
                  >
                    <Globe size={20} />
                    <span>
                      ChatGPT Desktop UI<small>Website</small>
                    </span>
                    <span>4:25 PM</span>
                  </Button>
                </div>
              </InternalScrollArea>
            </aside>
          ) : null}
        </div>
      </DesktopShell>
      <Dialog
        open={search}
        title="Search chats"
        className="client-search-dialog"
        actionId="client.search.dialog"
        onClose={() => setSearch(false)}
      >
        <Input
          aria-label="Search chats"
          placeholder="Search chats"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <h2>Chats</h2>
        <InternalScrollArea>
          {chats
            .filter((item) =>
              `${item.title} ${item.project}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .slice(0, 9)
            .map((item, index) => (
              <Button
                key={item.id}
                className="client-search-result"
                actionId="client.search.select"
                onClick={() => select(item)}
              >
                <span>{item.title}</span>
                <small>
                  {
                    projects.find((project) => project.id === item.project)
                      ?.name
                  }
                </small>
                <kbd>Alt+{index + 1}</kbd>
              </Button>
            ))}
        </InternalScrollArea>
        <h2>Recent Pages</h2>
        <Button
          className="client-search-result"
          actionId="client.search.page"
          onClick={() => {
            setSearch(false);
            showInfo("Your notes", "Sample ideas and decisions.");
          }}
        >
          ✨ Your notes
        </Button>
        <h2>Quick actions</h2>
        <Button
          className="client-search-result"
          actionId="client.search.new"
          onClick={() => {
            setSearch(false);
            newChat("");
          }}
        >
          <NotePencil size={16} />
          New chat<kbd>Ctrl+N</kbd>
        </Button>
      </Dialog>
      <Dialog
        open={create}
        title={discard ? "Discard this project?" : "Create project"}
        className="client-create-dialog"
        actionId="client.project.dialog"
        onClose={() => (discard ? setDiscard(false) : closeCreate())}
        footer={
          discard ? (
            <>
              <Button
                actionId="client.project.keep"
                onClick={() => setDiscard(false)}
              >
                Keep editing
              </Button>
              <Button
                actionId="client.project.discard"
                onClick={() => {
                  setDiscard(false);
                  setCreate(false);
                  setName("");
                  setFolder("");
                }}
              >
                Discard
              </Button>
            </>
          ) : (
            <>
              <Button actionId="client.project.cancel" onClick={closeCreate}>
                Cancel
              </Button>
              <Button
                className="client-create-primary"
                confirmOnEnter
                actionId="client.project.create"
                onClick={createProject}
              >
                Create project
              </Button>
            </>
          )
        }
      >
        {discard ? (
          <p>Your unsaved project details will be lost.</p>
        ) : (
          <>
            <div className="client-project-name">
              <Folder size={16} />
              <Input
                aria-label="Project name"
                autoFocus
                placeholder="Project name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
              />
            </div>
            <h2>Source folders</h2>
            <div className="client-source-folders">
              <DesktopMenu
                trigger={
                  <button type="button">
                    {folder || "Add a folder on this computer"}
                    <CaretDown size={14} />
                  </button>
                }
                items={[
                  {
                    id: "client.project.folder.sample",
                    label: "~/Projects/desktop-workspace",
                    icon: <Folder />,
                    onSelect: () => setFolder("~/Projects/desktop-workspace"),
                  },
                  {
                    id: "client.project.folder.choose",
                    label: "Choose a folder...",
                    disabled: true,
                  },
                ]}
              />
              <Button
                size="sm"
                actionId="client.project.folder.add"
                onClick={() => setFolder("~/Projects/desktop-workspace")}
              >
                <Folder size={14} />
                <Plus size={12} />
                Add
              </Button>
            </div>
            {error ? <p role="alert">{error}</p> : null}
          </>
        )}
      </Dialog>
      <Dialog
        open={!!editing}
        title="Edit project"
        actionId="client.project.edit.dialog"
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button
              actionId="client.project.edit.cancel"
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button
              confirmOnEnter
              actionId="client.project.edit.save"
              onClick={() => {
                if (!editName.trim()) return;
                setProjects((old) =>
                  old.map((item) =>
                    item.id === editing?.id
                      ? { ...item, name: editName.trim() }
                      : item,
                  ),
                );
                setEditing(null);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <label>
          Project name
          <Input
            aria-label="Edit project name"
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
        </label>
      </Dialog>
      <Dialog
        open={!!renaming}
        title="Rename chat"
        actionId="client.chat.rename.dialog"
        onClose={() => setRenaming(null)}
        footer={
          <>
            <Button
              actionId="client.chat.rename.cancel"
              onClick={() => setRenaming(null)}
            >
              Cancel
            </Button>
            <Button
              confirmOnEnter
              actionId="client.chat.rename.save"
              onClick={() => {
                if (!renameTitle.trim()) return;
                const update = (item: DemoChat) =>
                  item.id === renaming?.id
                    ? { ...item, title: renameTitle.trim() }
                    : item;
                setPinned((old) => old.map(update));
                setProjects((old) =>
                  old.map((item) => ({
                    ...item,
                    chats: item.chats.map(update),
                  })),
                );
                setRenaming(null);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <Input
          aria-label="Chat name"
          autoFocus
          value={renameTitle}
          onChange={(e) => setRenameTitle(e.target.value)}
        />
      </Dialog>
      <Dialog
        open={!!removing}
        title="Remove project?"
        actionId="client.project.remove.dialog"
        onClose={() => setRemoving(null)}
        footer={
          <>
            <Button
              actionId="client.project.remove.cancel"
              onClick={() => setRemoving(null)}
            >
              Cancel
            </Button>
            <Button
              actionId="client.project.remove.confirm"
              onClick={() => {
                setProjects((old) =>
                  old.filter((item) => item.id !== removing?.id),
                );
                setPinned((old) =>
                  old.filter((item) => item.project !== removing?.id),
                );
                if (route.project === removing?.id) newChat("");
                setRemoving(null);
              }}
            >
              Remove project
            </Button>
          </>
        }
      >
        <p>
          Remove {removing?.name} from the sidebar? Files on your computer will
          stay in place.
        </p>
      </Dialog>
      <Dialog
        open={!!info}
        title={info?.title}
        actionId="client.info.dialog"
        onClose={() => setInfo(null)}
        footer={
          <Button actionId="client.info.close" onClick={() => setInfo(null)}>
            Done
          </Button>
        }
      >
        <p className="client-info-copy">{info?.body}</p>
      </Dialog>
    </DesktopClientSurface>
  );
}
