import {
  PushPin,
  PencilSimple,
  Gear,
  List,
  Folder,
  Archive,
  X,
  ChatCircle,
  GitBranch,
  Clock,
  ArrowSquareOut,
  Copy,
  ArrowRight,
  SquaresFour,
  Gauge,
  Smiley,
  PaperPlaneTilt,
  Lifebuoy,
  SignOut,
  Globe,
  Desktop,
  Keyboard,
  BookOpen,
  Shield,
  GithubLogo,
  UploadSimple,
  Browsers,
} from "@phosphor-icons/react";
import type { DesktopMenuItem } from "../../src";
import type { DemoChat, DemoProject } from "./client-data";
export interface Actions {
  newChat(project?: string): void;
  settings(category?: string): void;
  create(): void;
  info(title: string, body: string): void;
  panel(): void;
  pin(chat: DemoChat): void;
  archive(chat: DemoChat): void;
  rename(chat: DemoChat): void;
  remove(project: DemoProject): void;
  edit(project: DemoProject): void;
  projectPin(project: DemoProject): void;
  projectArchive(project: DemoProject): void;
}
export function projectMenu(
  project: DemoProject,
  a: Actions,
): DesktopMenuItem[] {
  return [
    {
      id: "client.project.pin",
      label: project.pinned ? "Unpin" : "Pin",
      icon: <PushPin />,
      onSelect: () => a.projectPin(project),
    },
    {
      id: "client.project.edit",
      label: "Edit",
      icon: <Gear />,
      onSelect: () => a.edit(project),
    },
    {
      id: "client.project.section",
      label: "Section",
      icon: <List />,
      separator: true,
      children: [
        {
          id: "client.project.section.projects",
          label: "Projects",
          onSelect: () => a.projectPin(project),
        },
        {
          id: "client.project.section.pinned",
          label: "Pinned",
          onSelect: () => a.projectPin(project),
        },
      ],
    },
    {
      id: "client.project.explorer",
      label: "Open in Explorer",
      icon: <Folder />,
      onSelect: () => a.info(project.name, "~/Projects/" + project.name),
    },
    {
      id: "client.project.archive",
      label: "Archive chats",
      icon: <Archive />,
      separator: true,
      onSelect: () => a.projectArchive(project),
    },
    {
      id: "client.project.remove",
      label: "Remove project",
      icon: <X />,
      separator: true,
      onSelect: () => a.remove(project),
    },
  ];
}
export function chatMenu(
  chat: DemoChat,
  pinned: boolean,
  a: Actions,
): DesktopMenuItem[] {
  return [
    {
      id: "client.chat.rename",
      label: "Rename",
      icon: <PencilSimple />,
      shortcut: "Ctrl+Alt+R",
      onSelect: () => a.rename(chat),
    },
    {
      id: "client.chat.pin",
      label: pinned ? "Unpin" : "Pin",
      icon: <PushPin />,
      shortcut: "Ctrl+Alt+P",
      onSelect: () => a.pin(chat),
    },
    {
      id: "client.chat.side",
      label: "New side chat",
      icon: <ChatCircle />,
      shortcut: "Ctrl+Alt+S",
      separator: true,
      onSelect: a.panel,
    },
    {
      id: "client.chat.fork",
      label: "Fork",
      icon: <GitBranch />,
      children: [
        {
          id: "client.chat.fork.here",
          label: "This project",
          onSelect: () => a.newChat(chat.project),
        },
        {
          id: "client.chat.fork.new",
          label: "New project",
          onSelect: a.create,
        },
      ],
    },
    {
      id: "client.chat.schedule",
      label: "Add scheduled task...",
      icon: <Clock />,
      disabled: true,
    },
    {
      id: "client.chat.share",
      label: "Share",
      icon: <UploadSimple />,
      separator: true,
      onSelect: () =>
        a.info(
          "Share chat",
          "Unavailable in this demo.",
        ),
    },
    {
      id: "client.chat.copy",
      label: "Copy",
      icon: <Copy />,
      children: [
        {
          id: "client.chat.copy.title",
          label: "Chat title",
          onSelect: () => a.info("Chat title", chat.title),
        },
        {
          id: "client.chat.copy.link",
          label: "Chat link",
          onSelect: () => a.info("Chat link", "Session-only sample chat"),
        },
      ],
    },
    {
      id: "client.chat.window",
      label: "Open in new window",
      icon: <Browsers />,
      separator: true,
      onSelect: a.panel,
    },
    {
      id: "client.chat.open",
      label: "Open in",
      icon: <ArrowSquareOut />,
      children: [
        { id: "client.chat.open.tab", label: "New tab", onSelect: a.panel },
      ],
    },
    {
      id: "client.chat.archive",
      label: "Archive",
      icon: <Archive />,
      shortcut: "Ctrl+Shift+A",
      separator: true,
      onSelect: () => a.archive(chat),
    },
  ];
}
export function helpMenu(a: Actions, version: string): DesktopMenuItem[] {
  return [
    { id: "client.help.news", label: "What’s new", heading: true },
    {
      id: "client.help.news.security",
      label: "macOS security update",
      hint: "25 Sep",
      onSelect: () => a.info("macOS security update", "25 Sep"),
    },
    {
      id: "client.help.news.pets",
      label: "Quick chats with Pets and Appshots on Windows",
      hint: "11 Sep",
      onSelect: () =>
        a.info("Quick chats with Pets and Appshots on Windows", "11 Sep"),
    },
    {
      id: "client.help.news.browser",
      label: "Browser extensions, site tools, and cloud sign-in",
      hint: "25 Aug",
      onSelect: () =>
        a.info("Browser extensions, site tools, and cloud sign-in", "25 Aug"),
    },
    {
      id: "client.help.changelog",
      label: "Full changelog",
      icon: <ArrowSquareOut />,
      onSelect: () =>
        a.info(
          "What’s new",
          "macOS security update · 25 Sep\nQuick chats with Pets and Appshots on Windows · 11 Sep\nBrowser extensions, site tools, and cloud sign-in · 25 Aug",
        ),
    },
    {
      id: "client.help.extension",
      label: "Set up Chrome extension",
      icon: <Globe />,
      separator: true,
      disabled: true,
    },
    {
      id: "client.help.remote",
      label: "Set up remote",
      icon: <Desktop />,
      disabled: true,
    },
    {
      id: "client.help.shortcuts",
      label: "Keyboard shortcuts",
      icon: <Keyboard />,
      onSelect: () => a.settings("keyboard-shortcuts"),
    },
    {
      id: "client.help.guide",
      label: "User guide",
      icon: <BookOpen />,
      onSelect: () =>
        a.info(
          "User guide",
          "Ctrl+K opens search. Ctrl+, opens Settings. Ctrl+B toggles the sidebar.",
        ),
    },
    {
      id: "client.help.privacy",
      label: "Privacy center",
      icon: <Shield />,
      onSelect: () =>
        a.info(
          "Privacy center",
          "Only your theme preference is stored in the browser. Sample chats and edits stay in memory.",
        ),
    },
    {
      id: "client.help.source",
      label: "View source",
      icon: <GithubLogo weight="fill" />,
      separator: true,
      onSelect: () =>
        window.open(
          "https://github.com/liuminxin45/ChatGPT-Desktop-UI",
          "_blank",
          "noopener,noreferrer",
        ),
    },
    {
      id: "client.help.about",
      label: "About ChatGPT",
      onSelect: () =>
        a.info(
          "ChatGPT Desktop UI",
          `Reference client ${version}\nUnofficial component demonstration. Projects, chats and people are fictional. Native services and AI are simulated.`,
        ),
    },
  ];
}
export function profileMenu(a: Actions, version: string): DesktopMenuItem[] {
  return [
    {
      id: "client.profile.usage",
      label: "Usage",
      icon: <Gauge />,
      hint: "79% left",
      separator: true,
      onSelect: () => a.settings("usage-and-billing"),
    },
    {
      id: "client.profile.pet",
      label: "Show Pet",
      icon: <Smiley />,
      shortcut: "Alt+Win+P",
      onSelect: () => a.settings("mini-and-pets"),
    },
    {
      id: "client.profile.invite",
      label: "Invite a friend",
      icon: <PaperPlaneTilt />,
      disabled: true,
    },
    {
      id: "client.profile.settings",
      label: "Settings",
      icon: <Gear />,
      shortcut: "Ctrl+,",
      onSelect: () => a.settings(),
    },
    {
      id: "client.profile.help",
      label: "Help",
      icon: <Lifebuoy />,
      separator: true,
      children: helpMenu(a, version),
    },
    {
      id: "client.profile.logout",
      label: "Log out",
      icon: <SignOut />,
      disabled: true,
    },
  ];
}
