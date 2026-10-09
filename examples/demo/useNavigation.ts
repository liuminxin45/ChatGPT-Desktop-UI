import { useState } from 'react';

type Route = { page: string; category: string; room: string };
export function useNavigation() {
  const [history, setHistory] = useState({ entries: [{ page: 'projects', category: 'appearance', room: 'launch' }], index: 0 });
  const navigate = (changes: Partial<Route>) => setHistory(current => {
    const before = current.entries[current.index];
    const next = { ...before, ...changes };
    if (Object.keys(next).every(key => next[key as keyof Route] === before[key as keyof Route])) return current;
    return { entries: [...current.entries.slice(0, current.index + 1), next], index: current.index + 1 };
  });
  const move = (offset: number) => setHistory(current => ({ ...current, index: Math.max(0, Math.min(current.entries.length - 1, current.index + offset)) }));
  return { route: history.entries[history.index], navigate, back: () => move(-1), forward: () => move(1), canBack: history.index > 0, canForward: history.index < history.entries.length - 1 };
}
