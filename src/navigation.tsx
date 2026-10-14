import { AddressBook, ArrowsLeftRight, Bell, BookOpen, Bug, Buildings, CalendarCheck, ChartLine, ChatCircle, Code, Cube, Database, EnvelopeSimple, FileText, FolderSimple, GitPullRequest, ListChecks, Notebook, PaperPlaneTilt, PencilSimple, Question, Robot, Tag, Tray, TreeStructure, Users, UsersThree } from '@phosphor-icons/react';

const NAVIGATION_ICONS = { projects: FolderSimple, chat: ChatCircle, pending: ListChecks, mail: EnvelopeSimple,
  contacts: AddressBook, knowledge: BookOpen, office: Buildings, agents: Robot, bug: Bug,
  attention: Bell, api: Code, review: GitPullRequest, inbox: Tray, sent: PaperPlaneTilt, draft: PencilSimple, category: Tag,
  people: Users, organization: TreeStructure, changes: ArrowsLeftRight, meeting: UsersThree, attendance: CalendarCheck, records: Notebook, trend: ChartLine, report: FileText, database: Database, chart: ChartLine, help: Question };

/** Navigation alone has a semantic outline/fill pair; tool content keeps its existing icons. */
export function NavigationIcon({ name, selected = false }: { name: string; selected?: boolean }) {
  const Icon = NAVIGATION_ICONS[name.replace(/^desktop:/, '') as keyof typeof NAVIGATION_ICONS] || (name.includes('bug') ? Bug : Cube);
  return <Icon size={20} weight={selected ? 'fill' : 'regular'} aria-hidden="true" />;
}
