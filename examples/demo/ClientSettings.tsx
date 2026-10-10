import { useState, type ReactNode } from "react";
import { ClientUsage } from "./ClientUsage";
import {
  DesktopMenu,
  SettingsPage,
  SettingsGroup,
  SettingsField,
  SettingsDisclosure,
  Select,
  Switch,
  Button,
  Input,
  IconButton,
  useDesktopTheme,
} from "../../src";
import {
  DownloadSimple,
  Copy,
  CaretRight,
  Folder,
  Plus,
  Trash,
  ArrowSquareOut,
  Browser,
} from "@phosphor-icons/react";
import {
  generalFields,
  notificationFields,
  settingsCategories,
} from "./client-data";
const keyFor = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
export function ClientSettings({
  category,
  onDialog,
}: {
  category: string;
  onDialog: (title: string, body: string) => void;
}) {
  const { theme, setTheme } = useDesktopTheme();
  const [values, setValues] = useState<Record<string, string>>({});
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    permissions: true,
    full: true,
    panel: true,
    web: true,
    "connections.allow": true,
    "connections.awake": true,
    "computer.any": true,
    edge: true,
    excel: true,
    "appshot.sound": true,
    "plugin.database": true,
    "plugin.mail": true,
    "plugin.github": true,
  });

  const choose = (
    id: string,
    label: string,
    options: string[],
    initial = options[0],
  ) => (
    <Select
      aria-label={label}
      actionId={`client.settings.${id}`}
      value={values[id] ?? initial}
      onValueChange={(value) => setValues((old) => ({ ...old, [id]: value }))}
      options={options.map((value) => ({ value, label: value }))}
    />
  );
  const toggle = (id: string, label: string) => (
    <Switch
      aria-label={label}
      actionId={`client.settings.${id}`}
      checked={!!toggles[id]}
      onClick={() => setToggles((old) => ({ ...old, [id]: !old[id] }))}
    />
  );
  const action = (
    id: string,
    label: string,
    title = label,
    body = "This browser preview uses session-only sample data.",
  ) => (
    <Button
      size="sm"
      actionId={`client.settings.${id}`}
      onClick={() => onDialog(title, body)}
    >
      {label}
    </Button>
  );
  const title =
    settingsCategories.find((item) => item.id === category)?.label || "General";
  return (
    <SettingsPage title={category === "usage-and-billing" ? "Usage" : title}>
      <div hidden={category !== "general"}>
        <SettingsGroup title="Permissions">
          <SettingsField
            label="Default permissions"
            description="By default, ChatGPT can read and edit files in its workspace. It can ask for additional access when needed"
          >
            {toggle("permissions", "Default permissions")}
          </SettingsField>
          <SettingsField
            label="Full access"
            description={
              <>
                When ChatGPT runs with full access, it can edit any file on your
                computer and run commands with network, without your approval.
                This significantly increases the risk of data loss, leaks, or
                unexpected behavior.{" "}
                <button
                  className="client-text-link"
                  onClick={() =>
                    onDialog(
                      "Full access",
                      "Unavailable in this demo.",
                    )
                  }
                  data-desktop-action="client.settings.permissions.learn"
                >
                  Learn more
                </button>{" "}
                about elevated risks.
              </>
            }
          >
            {toggle("full", "Full access")}
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup title="General">
          <SettingsField
            label="Projectless task folder"
            description="The location where tasks started outside of projects store their data by default."
          >
            <code className="client-path">C:\Workspace\Projects\Codex</code>
            {action(
              "folder.change",
              "Change",
              "Projectless task folder",
              "Choose a sample folder in the preview.",
            )}
          </SettingsField>
          {generalFields.map((field, index) => (
            <SettingsField
              key={field.label}
              label={field.label}
              description={field.description}
            >
              {choose(
                [
                  "file-destination",
                  "environment",
                  "terminal-shell",
                  "language",
                  "close-warning",
                ][index],
                field.label,
                field.values,
              )}
            </SettingsField>
          ))}
          <SettingsField
            label="Full view by default"
            description="Start new tasks with Chat and content in a single tab strip"
          >
            {toggle("full-view", "Full view by default")}
          </SettingsField>
          <SettingsField
            label="Bottom panel"
            description="Show the bottom panel control in the app header"
          >
            {toggle("panel", "Bottom panel")}
          </SettingsField>
          <SettingsField
            label="Default terminal location"
            description="Choose where the terminal shortcut and environment actions open terminal tabs"
          >
            <div className="client-segments">
              {["Bottom", "Right"].map((value) => (
                <Button
                  key={value}
                  size="sm"
                  aria-pressed={(values.terminal ?? "Bottom") === value}
                  actionId={`client.settings.terminal.${value.toLowerCase()}`}
                  onClick={() =>
                    setValues((old) => ({ ...old, terminal: value }))
                  }
                >
                  {value}
                </Button>
              ))}
            </div>
          </SettingsField>
          <SettingsField
            label="Compress local chat history"
            description="Save disk space by compressing older local chat history. Restart ChatGPT to apply changes."
          >
            {toggle("compress", "Compress local chat history")}
          </SettingsField>
          <SettingsField label="Speed">
            {choose("speed", "Speed", ["Normal", "Fast"])}
          </SettingsField>
        </SettingsGroup>
      </div>
      <div className="client-appearance" hidden={category !== "appearance"}>
        <SettingsGroup title="Visual style">
          <SettingsField label="Mode">
            <div className="client-theme-previews">
              {(["system", "light", "dark"] as const).map((value) => (
                <button
                  key={value}
                  className={`client-theme-preview client-theme-preview--${value}`}
                  aria-label={`${value[0].toUpperCase() + value.slice(1)} mode`}
                  aria-pressed={theme === value}
                  data-desktop-action={`client.theme.${value}`}
                  onClick={() => setTheme(value)}
                >
                  <i />
                  <span>
                    <i />
                    <i />
                    <i />
                    <b />
                  </span>
                </button>
              ))}
            </div>
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup>
          <SettingsField label="Theme">
            <IconButton
              aria-label="Export theme"
              actionId="client.theme.export"
              onClick={() =>
                onDialog("Export theme", "ChatGPT · Blue · System font")
              }
            >
              <DownloadSimple size={16} />
            </IconButton>
            <IconButton
              aria-label="Copy theme"
              actionId="client.theme.copy"
              onClick={() => onDialog("Theme", "ChatGPT · Blue · System font")}
            >
              <Copy size={16} />
            </IconButton>
            {choose("theme", "Theme", ["ChatGPT"])}
          </SettingsField>
          <SettingsField label="Accent">
            {choose("accent", "Accent", ["Blue", "Green", "Orange", "Purple"])}
          </SettingsField>
          <SettingsField label="Background">
            <span className="client-color-value">
              <i />
              {theme === "light" ? "#FFFFFF" : "#181818"}
            </span>
          </SettingsField>
          <SettingsField label="Foreground">
            <span className="client-color-value client-color-value--foreground">
              <i />
              {theme === "light" ? "#111111" : "#FFFFFF"}
            </span>
          </SettingsField>
          <SettingsField label="Font">
            {choose("font", "Font", ["System", "Sans serif", "Monospace"])}
          </SettingsField>
        </SettingsGroup>
        <div className="client-settings-advanced">
          <SettingsDisclosure title="Advanced">
            <SettingsGroup>
              {[
                [
                  "ui-font-size",
                  "UI font size",
                  "Adjust the base size used for ChatGPT",
                  "14",
                ],
                [
                  "content-font-size",
                  "Content font size",
                  "Adjust the base size used for pages",
                  "14",
                ],
                [
                  "code-font-size",
                  "Code font size",
                  "Adjust the base size used for code across chats and diffs",
                  "12",
                ],
              ].map(([id, label, description, initial]) => (
                <SettingsField key={id} label={label} description={description}>
                  <Input
                    aria-label={label}
                    type="number"
                    min={11}
                    max={24}
                    value={values[id] ?? initial}
                    data-desktop-action={`client.theme.${id}`}
                    onChange={(e) =>
                      setValues((old) => ({ ...old, [id]: e.target.value }))
                    }
                  />
                  <span>px</span>
                </SettingsField>
              ))}
            </SettingsGroup>
            <SettingsGroup>
              <SettingsField
                label="Reduce motion"
                description="Reduce animations or match your system"
              >
                {choose("motion", "Reduce motion", ["System", "On", "Off"])}
              </SettingsField>
              <SettingsField
                label="Separate light and dark modes"
                description="Choose a theme, colors, and font for each"
              >
                {toggle("separate-theme", "Separate light and dark modes")}
              </SettingsField>
            </SettingsGroup>
            <SettingsGroup>
              <SettingsField label="UI font style">
                {choose("ui-style", "UI font style", ["Regular", "Medium"])}
              </SettingsField>
              <SettingsField label="Content font">
                {choose("content-font", "Content font", [
                  "Same as UI font",
                  "System",
                ])}
              </SettingsField>
            </SettingsGroup>
          </SettingsDisclosure>
          <Button
            actionId="client.theme.reset"
            onClick={() => {
              setTheme("system");
              setValues({});
            }}
          >
            Reset to default
          </Button>
        </div>
      </div>
      <div hidden={category !== "notifications"}>
        <SettingsGroup title="ChatGPT">
          {notificationFields.map(([label, description, initial]) => (
            <SettingsField key={label} label={label} description={description}>
              {choose(
                `notifications.${keyFor(label)}`,
                `${label} notifications`,
                ["Push", "Email", "Push, Email", "Off"],
                initial,
              )}
            </SettingsField>
          ))}
        </SettingsGroup>
      </div>
      <div hidden={category !== "import"}>
        <p className="client-settings-intro">
          Bring setup, projects, and chats from other AI apps into ChatGPT
        </p>
        <SettingsGroup title="Automatic sync">
          <SettingsField
            label="Keep imports in sync"
            description="Sync paused. Your content selections are saved"
          >
            {toggle("import-sync", "Keep imports in sync")}
          </SettingsField>
          <SettingsField
            label="Content to sync"
            description="Available after your first import"
          >
            <Button size="sm" disabled>
              Customize
            </Button>
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup title="Import from another AI app">
          <SettingsField
            label="Claude Code"
            description="Detected setup that can be added to ChatGPT"
          >
            {action("import", "Import")}
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup title="Import history">
          <SettingsField
            label="Import"
            description="Oct 8, 2026, 5:14 PM · 1 imported"
          >
            <DownloadSimple size={20} />
          </SettingsField>
          <SettingsField label="Instructions">
            <span className="client-import-success">● 1 imported</span>
          </SettingsField>
        </SettingsGroup>
      </div>{" "}
      <div hidden={category !== "account"}>
        <SettingsGroup title="Account">
          <SettingsField label="Status">
            <span>pro</span>
          </SettingsField>
          <SettingsField label="Name">
            <Input
              aria-label="Account name"
              value={values.accountName ?? "Alex Taylor"}
              onChange={(e) =>
                setValues((old) => ({ ...old, accountName: e.target.value }))
              }
            />
            {action("account-name.save", "Save")}
          </SettingsField>
          <SettingsField label="Username">
            <span>@alex.taylor</span>
          </SettingsField>
          <SettingsField label="Email" description="alex.taylor@example.com">
            {action("email.change", "Change")}
          </SettingsField>
          <SettingsField label="Age">
            <span>18 or older</span>
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup title="GPT builder profile">
          <SettingsField label="Alex Taylor" description="alex.taylor">
            <span />
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup>
          <SettingsField label="Delete account">
            <Button size="sm" disabled>
              Delete
            </Button>
          </SettingsField>
        </SettingsGroup>
      </div>
      <div hidden={category !== "profile"}>
        <SettingsGroup title="Profile">
          <SettingsField label="Name">
            <Input
              aria-label="Profile name"
              value={values.profile ?? "Alex Taylor"}
              onChange={(event) =>
                setValues((old) => ({ ...old, profile: event.target.value }))
              }
            />
          </SettingsField>
          <SettingsField label="Bio">
            <Input
              aria-label="Profile bio"
              value={values.bio ?? "Building thoughtful desktop experiences."}
              onChange={(event) =>
                setValues((old) => ({ ...old, bio: event.target.value }))
              }
            />
          </SettingsField>
        </SettingsGroup>
      </div>
      <div hidden={category !== "archived-chats"}>
        <div className="client-settings-toolbar">
          <Input
            aria-label="Search archived chats"
            placeholder="Search archived chats"
            value={values["archive-search"] ?? ""}
            onChange={(e) =>
              setValues((old) => ({ ...old, "archive-search": e.target.value }))
            }
          />
          {choose("archive-kind", "Archived chat type", ["All chats", "Codex"])}
          {choose("archive-project", "Archived project", [
            "All projects",
            "desktop-workspace",
          ])}
        </div>
        <SettingsGroup title="desktop-workspace">
          {[
            ["release", "Review the January release", "Oct 8, 2026, 5:22 PM"],
            [
              "welcome",
              "Explore a simpler welcome screen",
              "Oct 8, 2026, 4:27 PM",
            ],
            [
              "components",
              "Review component accessibility",
              "Oct 7, 2026, 10:30 AM",
            ],
          ]
            .filter(
              ([id, label]) =>
                !toggles["archive." + id] &&
                label
                  .toLowerCase()
                  .includes((values["archive-search"] ?? "").toLowerCase()),
            )
            .map(([id, label, date]) => (
              <SettingsField key={id} label={label} description={date}>
                <Button
                  size="sm"
                  actionId="client.archive.restore"
                  onClick={() =>
                    setToggles((old) => ({ ...old, ["archive." + id]: true }))
                  }
                >
                  Unarchive
                </Button>
              </SettingsField>
            ))}
        </SettingsGroup>
      </div>
      <div hidden={category !== "voice"}>
        <SettingsGroup title="General">
          <SettingsField
            label="Microphone"
            description="Used for voice chat and dictation"
          >
            {choose("microphone", "Microphone", ["System default"])}
          </SettingsField>
          <SettingsField label="Language">
            {choose("voice-language", "Voice language", [
              "Auto-detect",
              "English",
            ])}
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup title="Voice chat">
          <SettingsField
            label="Voice"
            description="Choose the voice Codex uses for new voice chats"
          >
            {choose("voice", "Voice", ["Cove", "Breeze", "Ember", "Juniper"])}
          </SettingsField>
          <SettingsField
            label="Voice chat hotkey"
            description="Start voice chat from anywhere on desktop"
          >
            {action("voice-hotkey", "Off")}
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup title="Dictation">
          <SettingsField
            label="Dictation shortcut"
            description="Hold to dictate, or double-tap for hands-free"
          >
            {action("dictation-hotkey", "Off")}
          </SettingsField>
          <SettingsField
            label="Recent recordings"
            description="Your last 20 recordings are saved on this device"
          >
            <span />
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup>
          <SettingsField
            label="Dictation dictionary"
            description="Words or phrases dictation should recognize"
          >
            {action("dictionary.add", "+ Add entry")}
          </SettingsField>
          <Input
            aria-label="Dictionary entry"
            placeholder="Jane Doe"
            value={values.dictionary ?? ""}
            onChange={(e) =>
              setValues((old) => ({ ...old, dictionary: e.target.value }))
            }
          />
        </SettingsGroup>
      </div>{" "}
      <div hidden={category !== "personalization"}>
        <div className="client-settings-toolbar">
          <strong>Codex memory</strong>
          {choose("memory-mode", "Codex memory", ["Local"])}
        </div>
        <p className="client-section-description">
          Configure how Codex uses memory on this machine.
        </p>
        <SettingsGroup>
          <SettingsField
            label="Enable Codex memories"
            description="Create memories from chats to help Codex work better over time. Local memories stay on this computer."
          >
            {toggle("memory", "Enable Codex memories")}
          </SettingsField>
          <SettingsField
            label="Allow memories from tool-assisted chats"
            description="Include chats that use MCP tools or web search"
          >
            <Switch
              aria-label="Allow memories from tool-assisted chats"
              checked
              disabled
            />
          </SettingsField>
          <SettingsField label="Delete Codex memories">
            {action("memory.delete", "Delete")}
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup title="Permissions">
          <SettingsField
            label="Custom rules"
            description="Choose which actions your dot can take without asking. Other actions require approval."
          >
            {action("rules", "›", "Custom rules")}
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup title="Custom instructions">
          <SettingsField
            label="Codex instructions"
            description="Edit AGENTS.md for the selected machine. Repository instructions may also apply."
          >
            {action("instructions", "›", "Codex instructions")}
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup title="Writing">
          <SettingsField
            label="Reference writing style"
            description="Learn your writing style from chats, Library, and connected apps"
          >
            {toggle("writing", "Reference writing style")}
          </SettingsField>
        </SettingsGroup>
      </div>
      <div hidden={category !== "keyboard-shortcuts"}>
        <Input
          aria-label="Search shortcuts"
          placeholder="Search shortcuts"
          value={values["shortcut-search"] ?? ""}
          onChange={(e) =>
            setValues((old) => ({ ...old, "shortcut-search": e.target.value }))
          }
        />
        <div className="client-top-gap">
          <SettingsGroup>
            <SettingsField
              label="Number shortcuts"
              description="Use Ctrl+1–9 to switch tabs and Alt+1–9 to switch chats"
            >
              {choose("number-shortcuts", "Number shortcuts", [
                "Ctrl+1–9 for Tabs",
                "Alt+1–9 for Tabs",
              ])}
            </SettingsField>
          </SettingsGroup>
        </div>
        <SettingsGroup>
          {[
            ["new", "New chat", "Start a new chat", "Ctrl+N"],
            [
              "temporary",
              "New Temporary Chat",
              "Start a chat that won’t appear in history",
              "Ctrl+Shift+N",
            ],
            [
              "quick",
              "Quick chat",
              "Start a lightweight chat in the quick composer",
              "Ctrl+Alt+N",
            ],
            [
              "archive",
              "Archive chat",
              "Archive the current chat",
              "Ctrl+Shift+A",
            ],
            [
              "standalone",
              "New standalone chat",
              "Start a new chat outside of any project",
              "Ctrl+Alt+O",
            ],
            [
              "side",
              "Open side chat",
              "Open the current chat in a side chat",
              "Ctrl+Alt+S",
            ],
            [
              "code",
              "Copy last code block",
              "Copy the last assistant code block in the current chat",
              "Ctrl+Shift+;",
            ],
            [
              "delete",
              "Delete chat",
              "Confirm deletion of the current chat",
              "Unassigned",
            ],
            [
              "unread",
              "Mark as unread",
              "Mark the current chat as unread",
              "Ctrl+Shift+U",
            ],
            [
              "window",
              "Open in new window",
              "Open the current chat in a new window",
              "Unassigned",
            ],
            [
              "pin",
              "Toggle pin",
              "Pin or unpin the current chat",
              "Ctrl+Alt+P",
            ],
          ]
            .filter(([, label]) =>
              label
                .toLowerCase()
                .includes((values["shortcut-search"] ?? "").toLowerCase()),
            )
            .map(([id, label, description, shortcut]) => (
              <SettingsField key={id} label={label} description={description}>
                <kbd>{shortcut}</kbd>
                <IconButton
                  aria-label={"Edit " + label + " shortcut"}
                  actionId={"client.shortcut.edit." + id}
                  onClick={() => onDialog(label, shortcut)}
                >
                  <Copy size={14} />
                </IconButton>
                <IconButton
                  aria-label={"Remove " + label + " shortcut"}
                  disabled
                >
                  <Trash size={14} />
                </IconButton>
              </SettingsField>
            ))}
        </SettingsGroup>
      </div>
      <div hidden={category !== "mini-and-pets"}>
        <p className="client-settings-intro">
          Show and focus your pet by pressing <kbd>Alt+Win+P</kbd>
        </p>
        <div className="client-mini-preview">
          <span>🤖</span>
          <div>✎　▥　⌄</div>
          <Button
            size="sm"
            actionId="client.pet.customize"
            onClick={() =>
              onDialog("Customize", "Choose a pet from the preview.")
            }
          >
            Customize
          </Button>
        </div>
        <div className="client-pets-heading">
          <h2>My pets</h2>
          <Button
            size="sm"
            actionId="client.pet.create"
            onClick={() =>
              onDialog(
                "Create pet",
                "Unavailable in this demo.",
              )
            }
          >
            Create pet
          </Button>
        </div>
        <div className="client-pets-grid">
          {[
            ["none", "None", "The lightweight Codex companion", "✎"],
            ["codex", "Codex", "The original Codex companion.", "🤖"],
            [
              "dewey",
              "Dewey",
              "A calm companion for focused workspace days",
              "💧",
            ],
            [
              "fireball",
              "Fireball",
              "Hot path energy for fast iteration.",
              "🔥",
            ],
            [
              "hoots",
              "Hoots",
              "A sharp-eyed owl for polished work in a blink.",
              "🦉",
            ],
          ].map(([id, name, description, art]) => (
            <button
              key={id}
              type="button"
              aria-label={name + " pet"}
              aria-pressed={values.pet === id}
              data-desktop-action={"client.pet.select." + id}
              onClick={() => setValues((old) => ({ ...old, pet: id }))}
            >
              <span>{art}</span>
              <strong>{name}</strong>
              <p>{description}</p>
            </button>
          ))}
        </div>
      </div>
      <div hidden={category !== "usage-and-billing"}>
        <ClientUsage onDialog={onDialog} />
      </div>
      <div hidden={category !== "data-controls"}>
        <SettingsGroup>
          <SettingsField label="Shared links">
            {action("shared-links", "Manage")}
          </SettingsField>
          <SettingsField
            label="Improve the model for everyone"
            description="Control whether your chats are used for model training"
          >
            {toggle("improve", "Improve the model for everyone")}
          </SettingsField>
          <SettingsField label="Work network access">
            {toggle("network", "Work network access")}
          </SettingsField>
          <SettingsField label="Reset ChatGPT Work">
            <Button size="sm" disabled>
              Reset
            </Button>
          </SettingsField>
          <SettingsField label="Information shared with apps">
            {action("apps.data", "Manage")}
          </SettingsField>
          <SettingsField label="Archived chats">
            {action("archived.manage", "Manage")}
          </SettingsField>
          <SettingsField label="Archive all chats">
            {action("archive-all", "Archive all")}
          </SettingsField>
          <SettingsField label="Delete all chats">
            <Button size="sm" disabled>
              Delete all
            </Button>
          </SettingsField>
          <SettingsField label="Export data">
            {action("export", "Export")}
          </SettingsField>
          <SettingsField label="Marketing privacy">
            {action("marketing", "Manage")}
          </SettingsField>
        </SettingsGroup>
      </div>
      <div hidden={category !== "browser"}>
        <p className="client-settings-intro">
          Manage your Browser Use preferences and site access.
        </p>
        <SettingsGroup>
          <SettingsField
            label="Browser"
            description="Let ChatGPT control the built-in browser"
          >
            {toggle("browser", "Browser")}
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup title="General">
          <SettingsField
            label="Web URL and link open destination"
            description="Manage Codex pull request links in Code Review settings"
          >
            {choose("url-destination", "Web URL and link open destination", [
              "Default browser",
              "ChatGPT",
            ])}
          </SettingsField>
          <SettingsField
            label="Local URL open destination"
            description="Where local development sites open by default"
          >
            {choose("local-url", "Local URL open destination", [
              "ChatGPT",
              "Default browser",
            ])}
          </SettingsField>
          <SettingsField
            label="Show full URL"
            description="Include the path, query, and fragment in the address bar"
          >
            {toggle("full-url", "Show full URL")}
          </SettingsField>
          <SettingsField
            label="Browsing data"
            description="Clear browsing history, site data, cache, and download history from the app browser"
          >
            {action("browser.clear", "Clear browsing data")}
          </SettingsField>
          <SettingsField
            label="Browsing history"
            description="View and manage pages visited in the built-in browser"
          >
            {action("browser.history", "Manage")}
          </SettingsField>
          <SettingsField
            label="Annotation screenshots"
            description="Screenshots help ChatGPT better understand and address comments, but increase plan usage"
          >
            {choose("annotation", "Annotation screenshots", [
              "Always include",
              "Never",
            ])}
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup title="Autofill and passwords">
          <SettingsField
            label="Password manager"
            description="Add, delete, and edit saved passwords"
          >
            {action("passwords", "Manage")}
          </SettingsField>
          <SettingsField
            label="Contact info"
            description="Add, delete, and edit saved addresses, phone numbers, and email addresses"
          >
            {action("contact-info", "Manage")}
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup title="Extensions">
          <SettingsField
            label="Extension manager"
            description="Install, remove, and configure browser extensions"
          >
            {action("extensions", "Manage")}
          </SettingsField>
        </SettingsGroup>
      </div>
      <div hidden={category !== "configuration"}>
        <p className="client-settings-intro">
          Choose how ChatGPT works on your tasks
        </p>
        <div className="client-settings-toolbar">
          {choose("configuration-profile", "Configuration profile", ["Codex"])}
          {action("configuration.open", "Open config.toml ↗")}
        </div>
        <SettingsGroup>
          {[
            [
              "approval",
              "Approval policy",
              "Choose when ChatGPT asks for approval",
              ["On request", "Never"],
            ],
            [
              "sandbox",
              "Sandbox settings",
              "Choose how much ChatGPT can do when running commands",
              ["Full access", "Workspace write", "Read only"],
            ],
            [
              "web-search",
              "Web search",
              "Choose how ChatGPT accesses the web",
              ["Live", "Cached", "Off"],
            ],
            [
              "output",
              "Output detail",
              "Choose how much detail ChatGPT includes in responses",
              ["Model default", "Low", "Medium", "High"],
            ],
            [
              "reasoning-summary",
              "Reasoning summary",
              "Choose how ChatGPT summarizes its reasoning",
              ["Auto", "Concise", "Detailed", "Off"],
            ],
          ].map(([id, label, description, options]) => (
            <SettingsField
              key={String(id)}
              label={String(label)}
              description={String(description)}
            >
              {choose(String(id), String(label), options as string[])}
            </SettingsField>
          ))}
        </SettingsGroup>
        <SettingsGroup title="Model features">
          <SettingsField
            label="Available reasoning efforts"
            description="Choose which reasoning effort levels appear in model controls. Availability varies by model"
          >
            {choose("reasoning-levels", "Available reasoning efforts", [
              "6 selected",
              "Low, Medium, High",
            ])}
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup title="Workspace Dependencies">
          <SettingsField
            label="Codex dependencies"
            description="Allow ChatGPT to install and expose bundled Node.js and Python tools"
          >
            {toggle("dependencies", "Codex dependencies")}
          </SettingsField>
          <SettingsField
            label="Diagnose issues in Codex Workspace"
            description="Checks the current bundle and records diagnostic logs"
          >
            {action("workspace.diagnose", "Diagnose")}
          </SettingsField>
          <SettingsField
            label="Reset and install Workspace"
            description="Downloads a fresh bundle, installs it, and reloads tools"
          >
            <Button size="sm" disabled>
              Reinstall
            </Button>
          </SettingsField>
        </SettingsGroup>
      </div>{" "}
      <div hidden={category !== "computer-use"}>
        <p className="client-settings-intro">
          Manage how ChatGPT uses other applications on your computer.
        </p>
        <SettingsGroup title="Control">
          <SettingsField
            label="Any app"
            description="Let ChatGPT control apps on your computer"
          >
            {toggle("computer.any", "Any app")}
          </SettingsField>
          <SettingsField
            label="Google Chrome"
            description="Browser extension not installed"
          >
            {action("chrome.install", "Install")}
          </SettingsField>
          <SettingsField
            label="Microsoft Edge"
            description="Browser extension installed"
          >
            {action("edge.manage", "Manage")}
            {toggle("edge", "Microsoft Edge")}
          </SettingsField>
          <SettingsField
            label="Microsoft Excel"
            description="The Excel add-in provides additional control"
          >
            {toggle("excel", "Microsoft Excel")}
          </SettingsField>
        </SettingsGroup>
        <SettingsGroup title="Always allowed apps">
          <p className="client-card-empty">None yet</p>
        </SettingsGroup>
      </div>
      <div hidden={category !== "parental-controls"}>
        <p className="client-reference-copy">
          Parents and teens can link accounts to help teens use ChatGPT safely.
          Parents can manage settings and receive notifications about serious
          safety concerns.
        </p>
        {action("family.add", "+ Add family member")}
      </div>
      <div hidden={category !== "trusted-contact"}>
        <p className="client-reference-copy">
          Having a trusted contact can make it easier to get support from
          someone who knows you well.
        </p>
        <p className="client-reference-copy">
          In the future, if you discuss suicide with ChatGPT in a way that
          indicates a serious safety concern, we may automatically notify your
          trusted contact so they can check in with you. They must be 18+ to
          participate.
        </p>
        {action("trusted.add", "+ Add contact")}
      </div>
      <div hidden={category !== "plugins"}>
        <p className="client-settings-intro">
          Manage plugins, skills, and MCPs
        </p>
        <div className="client-settings-toolbar">
          {action("plugins.directory", "Browse directory")}
          {action("plugins.add", "Add ⌄")}
        </div>
        <div className="client-plugin-toolbar">
          <div className="client-segments">
            {["Plugins", "Apps", "MCPs", "Skills", "Marketplace"].map(
              (label) => (
                <Button
                  key={label}
                  size="sm"
                  aria-pressed={(values["plugin-tab"] ?? "Plugins") === label}
                  actionId={"client.plugins.tab." + label.toLowerCase()}
                  onClick={() =>
                    setValues((old) => ({ ...old, "plugin-tab": label }))
                  }
                >
                  {label}
                </Button>
              ),
            )}
          </div>
          <Input
            aria-label="Search plugins"
            placeholder="Search plugins"
            value={values["plugin-search"] ?? ""}
            onChange={(e) =>
              setValues((old) => ({ ...old, "plugin-search": e.target.value }))
            }
          />
        </div>
        {(values["plugin-tab"] ?? "Plugins") === "Plugins" ? (
          [
            ["database", "Database tools", "Manage and query databases"],
            ["mail", "Mail", "Read and manage email"],
            ["github", "GitHub", "Triage PRs, issues, CI, and publish flows"],
          ]
            .filter(([, label]) =>
              label
                .toLowerCase()
                .includes((values["plugin-search"] ?? "").toLowerCase()),
            )
            .map(([id, label, description]) => (
              <div className="client-plugin-row" key={id}>
                <span aria-hidden="true">
                  {id === "github" ? "◉" : id === "mail" ? "✉" : "ϟ"}
                </span>
                <div>
                  <strong>{label}</strong>
                  <p>{description}</p>
                </div>
                {toggle("plugin." + id, label)}
              </div>
            ))
        ) : (
          <p className="client-section-description">
            No {values["plugin-tab"]?.toLowerCase()} installed
          </p>
        )}
      </div>
      <div hidden={category !== "passwords"}>
        <p className="client-settings-intro">
          Passwords you’ve saved for websites. Each use requires your
          confirmation.
        </p>
        <Input aria-label="Search passwords" placeholder="Search passwords" />
        <div className="client-settings-toolbar client-top-gap">
          <strong>Saved passwords (0)</strong>
          {action("passwords.refresh", "Refresh")}
        </div>
        <p className="client-section-description">No saved passwords</p>
      </div>
      <div hidden={category !== "appshots"}>
        <div className="client-appshot-banner">
          <strong>Take an appshot to show ChatGPT your frontmost window</strong>
          <p>
            Appshots include visual and text content, including text scrolled
            offscreen
          </p>
        </div>
        <div className="client-appshot-grid">
          <SettingsGroup>
            <SettingsField
              label="Hotkey"
              description="Press both Alt keys simultaneously"
            >
              {choose("appshot.hotkey", "Appshot hotkey", ["Alt + Alt", "Off"])}
            </SettingsField>
            <SettingsField
              label="Appshot destination"
              description="Choose where appshots go when you use the hotkey"
            >
              {choose("appshot.destination", "Appshot destination", [
                "Automatic",
                "Current chat",
              ])}
            </SettingsField>
            <SettingsField label="Play sound effect">
              {toggle("appshot.sound", "Play sound effect")}
            </SettingsField>
          </SettingsGroup>
          <div
            className="client-appshot-preview"
            aria-label="Appshot illustration"
          >
            <Browser size={40} />
            <strong>Appshots</strong>
            <p>Visual and text context</p>
          </div>
        </div>
      </div>
      <div hidden={category !== "cloud-computer"}>
        <p className="client-settings-intro">
          Manage cloud browsing settings and saved website cookies
        </p>
        <SettingsGroup title="General">
          <SettingsField
            label="ChatGPT Work cookies"
            description="Manage cookies used by ChatGPT Work"
          >
            {action("cookies.work", "›", "ChatGPT Work cookies")}
          </SettingsField>
          <SettingsField
            label="Your dot’s cookies"
            description="Manage cookies saved by your dot"
          >
            {action("cookies.dot", "›", "Your dot’s cookies")}
          </SettingsField>
          <SettingsField
            label="ChatGPT Work website approvals"
            description="Choose whether ChatGPT Work asks before opening websites. Applies only to ChatGPT Work."
          >
            {choose("website.approval", "ChatGPT Work website approvals", [
              "Always allow",
              "Ask every time",
            ])}
          </SettingsField>
        </SettingsGroup>
        <div className="client-settings-toolbar">
          <strong>Website permissions</strong>
          {action("website.add", "Add website")}
        </div>
        <p className="client-section-description">
          Add sites to override the default permission
        </p>
      </div>
      <div hidden={category !== "hooks"}>
        <p className="client-settings-intro">
          Manage lifecycle hooks from config and enabled plugins.
        </p>
        <SettingsGroup title="From Config">
          <SettingsField label="User config" description="5 hooks">
            {action("hooks.config", "›", "User config")}
          </SettingsField>
        </SettingsGroup>
      </div>
      <div hidden={category !== "connections"}>
        <div className="client-segments client-connections-tabs">
          {["Control this PC", "Control other devices", "SSH"].map((label) => (
            <Button
              size="sm"
              key={label}
              aria-pressed={
                (values.connectionTab ?? "Control this PC") === label
              }
              actionId={
                "client.connection.tab." +
                {
                  "Control this PC": "local",
                  "Control other devices": "remote",
                  SSH: "ssh",
                }[label]
              }
              onClick={() =>
                setValues((old) => ({ ...old, connectionTab: label }))
              }
            >
              {label}
            </Button>
          ))}
        </div>
        <SettingsGroup
          title={
            (values.connectionTab ?? "Control this PC") === "Control this PC"
              ? "Devices that can control this PC"
              : values.connectionTab === "SSH"
                ? "SSH connections"
                : "Devices you can control"
          }
        >
          <SettingsField label="Allow connections">
            {toggle("connections.allow", "Allow connections")}
          </SettingsField>
          <p className="client-card-empty">No devices connected</p>
        </SettingsGroup>
        <SettingsGroup title="Other settings">
          <SettingsField
            label="Keep this PC awake"
            description="Prevent sleep when computer is plugged in and remote access is enabled"
          >
            {toggle("connections.awake", "Keep this PC awake")}
          </SettingsField>
        </SettingsGroup>
      </div>
      <div hidden={category !== "codex-cloud"}>
        <p className="client-settings-intro">
          Set up cloud environments with the repositories, tools, and settings
          Codex needs to work on your projects
        </p>
        <div className="client-settings-toolbar">
          <div className="client-segments">
            {["Environments", "Personal vault"].map((label) => (
              <Button
                size="sm"
                key={label}
                aria-pressed={(values.cloudTab ?? "Environments") === label}
                actionId={
                  "client.cloud.tab." +
                  (label === "Environments" ? "environments" : "vault")
                }
                onClick={() =>
                  setValues((old) => ({ ...old, cloudTab: label }))
                }
              >
                {label}
              </Button>
            ))}
          </div>
          {action("cloud.create", "+ Create environment")}
        </div>
        <SettingsGroup>
          <p className="client-card-empty">
            {(values.cloudTab ?? "Environments") === "Environments"
              ? "No saved environments"
              : "No secrets saved"}
          </p>
        </SettingsGroup>
      </div>
      <div hidden={category !== "legacy-codex-cloud"}>
        <div className="client-cloud-notice">
          <strong>A new Codex Cloud experience is here</strong>
          <p>
            Legacy Cloud environments can be migrated to the new Cloud
            environments using the migration button.
          </p>
          <p>
            You can continue to create and manage legacy environments for Code
            Review and integrations such as Linear and GitHub. Your workspace’s
            existing cloud access settings apply to both legacy and new Cloud
            Environments.
          </p>
        </div>
        <div className="client-settings-toolbar">
          <div className="client-segments">
            <Button size="sm">Environments</Button>
            <Button size="sm" disabled>
              Preferences
            </Button>
          </div>
          {action("cloud.legacy.create", "+ Create environment")}
        </div>
        <SettingsGroup>
          <p className="client-card-empty">No cloud environments yet</p>
        </SettingsGroup>
      </div>
    </SettingsPage>
  );
}
