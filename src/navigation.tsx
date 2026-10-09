import { AddressBook, BookOpen, Bug, Buildings, ChatCircle, Cube, EnvelopeSimple, FolderSimple, ListChecks, Robot } from '@phosphor-icons/react';

const NAVIGATION_ICONS = { projects: FolderSimple, chat: ChatCircle, pending: ListChecks, mail: EnvelopeSimple,
  contacts: AddressBook, knowledge: BookOpen, office: Buildings, agents: Robot, bug: Bug };

/** Navigation alone has a semantic outline/fill pair; tool content keeps its existing icons. */
export function NavigationIcon({ name, selected = false }: { name: string; selected?: boolean }) {
  const Icon = NAVIGATION_ICONS[name.replace(/^desktop:/, '') as keyof typeof NAVIGATION_ICONS] || (name.includes('bug') ? Bug : Cube);
  return <Icon size={20} weight={selected ? 'fill' : 'regular'} aria-hidden="true" />;
}
