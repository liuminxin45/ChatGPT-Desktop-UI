// Entirely fictional people, projects and discussions; no production exports.
export type Project = { id: string; name: string; summary: string; state: 'In progress' | 'In review' | 'Planned'; completed: number; total: number; due: string; owner: string; initials: string; icon: 'compass' | 'layers' | 'globe' | 'chart'; tasks: string[] };
export const projects: Project[] = [
  { id: 'onboarding', name: 'A better first five minutes', summary: 'Help new teams reach their first shared workspace without a call.', state: 'In progress', completed: 14, total: 20, due: 'Oct 16', owner: 'Maya Chen', initials: 'MC', icon: 'compass', tasks: ['Review the invite flow with support', 'Finish the empty workspace states', 'Test setup with three pilot teams'] },
  { id: 'system', name: 'One language for every screen', summary: 'Bring navigation, forms and feedback into the same design system.', state: 'In review', completed: 23, total: 26, due: 'Oct 12', owner: 'Oliver Reed', initials: 'OR', icon: 'layers', tasks: ['Check keyboard navigation in dialogs', 'Document compact button variants', 'Sign off the dark theme contrast'] },
  { id: 'search', name: 'Find the work, not the folder', summary: 'Make project notes and decisions easier to find across the team.', state: 'In progress', completed: 8, total: 18, due: 'Oct 23', owner: 'Ava Morgan', initials: 'AM', icon: 'globe', tasks: ['Tune ranking for archived projects', 'Review the no-results experience', 'Measure search latency on larger workspaces'] },
  { id: 'insights', name: 'Weekly insights, less noise', summary: 'A useful Friday readout of what moved and what needs attention.', state: 'Planned', completed: 2, total: 12, due: 'Nov 02', owner: 'Sam Rivera', initials: 'SR', icon: 'chart', tasks: ['Agree on the weekly summary format', 'Map project health signals', 'Interview team leads about their Friday routine'] },
];
export const conversations = [
  { id: 'launch', title: 'October launch', preview: 'The invite flow is ready for another pass.', time: '10:42', unread: true, messages: [
    { name: 'Maya Chen', initials: 'MC', time: '10:24', text: 'I ran through the new invite flow with support this morning. The steps feel much clearer now. There is one edge case left: joining two workspaces with the same name.', own: false },
    { name: 'Oliver Reed', initials: 'OR', time: '10:31', text: 'Good catch. We can show the team domain below the workspace name. I added the treatment to the review notes.', own: false },
    { name: 'Alex Taylor', initials: 'AT', time: '10:36', text: 'That should work. Let’s keep the first screen focused on joining, then offer profile setup once they are inside.', own: true },
    { name: 'Maya Chen', initials: 'MC', time: '10:42', text: 'Agreed. The invite flow is ready for another pass. I’ll bring the updated version to the 2 pm review.', own: false },
  ] },
  { id: 'design', title: 'Design system', preview: 'The compact controls are looking good.', time: '09:18', unread: false, messages: [
    { name: 'Oliver Reed', initials: 'OR', time: '09:12', text: 'The compact controls are looking good. I checked the dropdowns at the window edge and the keyboard focus in both themes.', own: false },
    { name: 'Alex Taylor', initials: 'AT', time: '09:18', text: 'Thanks. Let’s include the focus states in the handoff so they don’t get lost during implementation.', own: true },
  ] },
  { id: 'search', title: 'Search & discovery', preview: 'Archived projects need a quieter treatment.', time: 'Yesterday', unread: false, messages: [
    { name: 'Ava Morgan', initials: 'AM', time: '16:05', text: 'Archived projects need a quieter treatment in the results. They should still be searchable, but active work should come first.', own: false },
  ] },
];
