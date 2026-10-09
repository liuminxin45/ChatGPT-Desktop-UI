import {
  Gear,
  Bell,
  DownloadSimple,
  UserCircle,
  Sun,
  Archive,
  Shield,
  Microphone,
  ShieldCheck,
  Smiley,
  Keyboard,
  Gauge,
  Plugs,
  LockKey,
  Cursor,
  Scan,
  Browser,
  Cloud,
  Anchor,
  Globe,
  Folder,
  Images,
  MapPin,
  Cube,
  GitBranch,
  House,
  Clock,
  SquaresFour,
  Circle,
} from "@phosphor-icons/react";
export const CLIENT_VERSION = "26.1002.7124.0";
export const railItems = [
  { id: "home", label: "Home", icon: House },
  { id: "space", label: "Space", icon: Images },
  { id: "scheduled", label: "Scheduled", icon: Clock },
  { id: "plugins", label: "Plugins", icon: Plugs },
  { id: "projects", label: "Projects", icon: Folder },
  { id: "images", label: "Images", icon: Images },
  { id: "sites", label: "Sites", icon: SquaresFour },
  { id: "maps", label: "Maps", icon: Anchor },
  { id: "gpts", label: "GPTs", icon: Cube },
  { id: "review", label: "Code Review", icon: GitBranch },
];
export const settingsCategories = [
  ["General", Gear],
  ["Notifications", Bell],
  ["Import", DownloadSimple],
  ["Profile", UserCircle],
  ["Appearance", Sun],
  ["Account", UserCircle],
  ["Archived chats", Archive],
  ["Parental controls", Shield],
  ["Trusted contact", UserCircle],
  ["Voice", Microphone],
  ["Configuration", ShieldCheck],
  ["Personalization", Smiley],
  ["Mini & Pets", Smiley],
  ["Keyboard shortcuts", Keyboard],
  ["Usage & billing", Gauge],
  ["Data controls", Shield],
  ["Plugins", Plugs],
  ["Passwords", LockKey],
  ["Computer use", Cursor],
  ["Appshots", Scan],
  ["Browser", Browser],
  ["Cloud computer", Cloud],
  ["Hooks", Anchor],
  ["Connections", Globe],
  ["Codex Cloud", Cloud],
  ["Legacy Codex Cloud", Cloud],
].map(([label, icon], index) => ({
  id: [
    "general",
    "notifications",
    "import",
    "profile",
    "appearance",
    "account",
    "archived-chats",
    "parental-controls",
    "trusted-contact",
    "voice",
    "configuration",
    "personalization",
    "mini-and-pets",
    "keyboard-shortcuts",
    "usage-and-billing",
    "data-controls",
    "plugins",
    "passwords",
    "computer-use",
    "appshots",
    "browser",
    "cloud-computer",
    "hooks",
    "connections",
    "codex-cloud",
    "legacy-codex-cloud",
  ][index],
  label: String(label),
  icon: icon as typeof Gear,
  group: index < 16 ? "Personal" : index < 22 ? "Integrations" : "Coding",
}));
export interface DemoChat {
  id: string;
  title: string;
  project: string;
  pinned?: boolean;
  preview: string;
  working?: boolean;
}
export interface DemoProject {
  id: string;
  name: string;
  pinned?: boolean;
  chats: DemoChat[];
}
export const initialProjects: DemoProject[] = [
  {
    id: "desktop",
    name: "desktop-workspace",
    chats: [
      {
        id: "navigation",
        title: "Refine desktop navigation",
        project: "desktop",
        preview: "Keep the sidebar compact and preserve the selected chat.",
      },
      {
        id: "focus",
        title: "Fix keyboard focus in the command menu",
        project: "desktop",
        preview: "The focus returns to the trigger when the menu closes.",
        working: true,
      },
      {
        id: "settings",
        title: "Align settings with the Windows client",
        project: "desktop",
        preview:
          "Group permissions and preferences with clear section headings.",
      },
      {
        id: "drafts",
        title: "Preserve the draft when switching tabs",
        project: "desktop",
        preview: "The editor should keep its text and scroll position.",
      },
      {
        id: "release",
        title: "Review the release checklist",
        project: "desktop",
        preview: "Type checks and renderer checks are ready for review.",
      },
      {
        id: "search",
        title: "Improve search results in the sidebar",
        project: "desktop",
        preview: "Match project names and recent conversation titles.",
      },
      {
        id: "menus",
        title: "Add keyboard navigation to nested menus",
        project: "desktop",
        preview: "Arrow keys and Escape follow the current menu scope.",
      },
      {
        id: "long",
        title:
          "Investigate a long conversation title that should truncate gracefully",
        project: "desktop",
        preview: "Keep actions reachable when the title takes the full row.",
      },
    ],
  },
  {
    id: "studio",
    name: "design-studio",
    chats: [
      {
        id: "onboarding",
        title: "Simplify the first-run experience",
        project: "studio",
        preview: "Use the same controls throughout the setup flow.",
      },
      {
        id: "tokens",
        title: "Review the light and dark color tokens",
        project: "studio",
        preview: "Keep the main canvas darker than the sidebar.",
      },
      {
        id: "handoff",
        title: "Prepare the component handoff",
        project: "studio",
        preview: "Include focus, loading and disabled states.",
      },
    ],
  },
  {
    id: "notes",
    name: "research-notes",
    chats: [
      {
        id: "reading",
        title: "Summarize the usability study",
        project: "notes",
        preview:
          "Six participants found the project switcher without guidance.",
      },
    ],
  },
];
export const pinnedChats: DemoChat[] = [
  {
    id: "planning",
    title: "Plan the next release",
    project: "",
    pinned: true,
    preview: "A small set of changes for the next milestone.",
  },
  {
    id: "architecture",
    title: "Review the component architecture",
    project: "",
    pinned: true,
    preview: "One shared implementation for all desktop clients.",
  },
  {
    id: "week",
    title: "Write the weekly update",
    project: "",
    pinned: true,
    preview: "The navigation and settings changes are ready.",
  },
];
export const generalFields = [
  {
    label: "Default file open destination",
    description: "Where files and folders open by default",
    values: ["File Explorer", "Built-in editor"],
  },
  {
    label: "Agent environment",
    description: "Choose where the agent runs on Windows",
    values: ["Windows native", "WSL"],
  },
  {
    label: "Integrated terminal shell",
    description: "Choose which shell opens in the integrated terminal.",
    values: ["PowerShell", "Command Prompt", "Git Bash"],
  },
  {
    label: "Language",
    description: "Language for the app UI",
    values: ["Auto detect", "English", "简体中文"],
  },
  {
    label: "Confirm before closing a window",
    description: "Warn when a tab-close shortcut would close the window",
    values: ["Close shortcut only", "Always", "Never"],
  },
];
export const notificationFields = [
  ["Codex", "Get notified about Codex tasks.", "Push"],
  [
    "Group chats",
    "You’ll receive notifications for new messages from group chats.",
    "Push",
  ],
  ["Health", "Get notified when your health data is ready.", "Push"],
  [
    "Library",
    "Get notified about shared files, folders, and access requests in your Library.",
    "Email",
  ],
  [
    "Marketing",
    "Stay in the loop on new tools and features from ChatGPT.",
    "Push, Email",
  ],
  ["Messages", "Get notified when you receive new messages.", "Push"],
  [
    "Personalized tips",
    "Get helpful recommendations based on your conversations with ChatGPT.",
    "Push, Email",
  ],
  [
    "Projects",
    "Get notified when you receive an email invitation to a shared project.",
    "Email",
  ],
  [
    "Responses",
    "Get notified when ChatGPT responds to requests that take time, like research or image generation.",
    "Push",
  ],
  ["Tasks", "Get notified when tasks you’ve created have updates.", "Push"],
  [
    "Usage",
    "We’ll notify you when limits reset for features like image creation.",
    "Push, Email",
  ],
];
