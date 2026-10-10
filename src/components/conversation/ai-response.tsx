import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Markdown } from '../feedback';
import { ToolVisibilityContext } from '../../surface-visibility';

type RevealRecord = { offset: number; length: number; deadline?: number; finished: boolean };
const RevealContext = createContext<Map<string, RevealRecord> | null>(null);

/** Mount above virtualized conversations. Only offsets and timing are retained, never response text. */
export function AIResponseProvider({ children }: { children: ReactNode }) {
  const [records] = useState(() => new Map<string, RevealRecord>());
  return <RevealContext.Provider value={records}>{children}</RevealContext.Provider>;
}

export interface AIResponseProps {
  content: string;
  responseId: string;
  /** Enable only for a newly received response; loaded history is static by default. */
  animate?: boolean;
  state?: 'streaming' | 'complete' | 'cancelled' | 'failed';
  className?: string;
  components?: Parameters<typeof Markdown>[0]['components'];
  /** Host can remeasure and follow the bottom without scrolling readers away from history. */
  onReveal?: () => void;
}

/** One presenter for streamed increments and complete responses. Canonical content stays Host-owned. */
export function AIResponse({
  content,
  responseId,
  animate = false,
  state = 'complete',
  className,
  components,
  onReveal,
}: AIResponseProps) {
  const shared = useContext(RevealContext);
  const local = useRef(new Map<string, RevealRecord>());
  const records = shared ?? local.current;
  const visible = useContext(ToolVisibilityContext);
  const callback = useRef(onReveal);
  callback.current = onReveal;
  const previous = useRef({ id: responseId, content });
  const lastTick = useRef(performance.now());
  const boundaries = useMemo(() => {
    const result = [0];
    for (const part of new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(content))
      result.push(part.index + part.segment.length);
    if (state === 'streaming' && /[\uD800-\uDBFF]$/.test(content)) result.pop();
    return result;
  }, [content, state]);
  const [, refresh] = useState(0);
  let record = records.get(responseId);
  if (!record) {
    record = { offset: animate ? 0 : content.length, length: content.length, finished: !animate };
    records.set(responseId, record);
  }
  record.length = content.length;
  const replaced = previous.current.id === responseId && !content.startsWith(previous.current.content);
  if (!animate || state === 'cancelled' || state === 'failed' || replaced) {
    record.offset = content.length;
    record.finished = true;
  }
  if (record.finished) record.offset = content.length;
  previous.current = { id: responseId, content };

  useEffect(() => {
    const current = records.get(responseId)!;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    const flush = () => {
      current.offset = content.length;
      current.finished = true;
      refresh((v) => v + 1);
      callback.current?.();
    };
    const tick = () => {
      if (disposed) return;
      lastTick.current = performance.now();
      if (
        !visible ||
        document.hidden ||
        media.matches ||
        !animate ||
        state === 'cancelled' ||
        state === 'failed'
      ) {
        flush();
        return;
      }
      if (current.finished) return;
      if (state === 'complete') current.deadline ??= performance.now() + 2000;
      const remaining = Math.max(
        1,
        Math.ceil(((current.deadline ?? performance.now() + 2000) - performance.now()) / 32),
      );
      let index = boundaries.findIndex((offset) => offset >= current.offset);
      const count = Math.max(3, Math.ceil((boundaries.length - 1 - index) / remaining));
      index = Math.min(boundaries.length - 1, index + count);
      current.offset =
        current.deadline && performance.now() >= current.deadline ? content.length : boundaries[index];
      if (current.offset === content.length && state !== 'streaming') current.finished = true;
      refresh((v) => v + 1);
      callback.current?.();
      if (current.offset < boundaries[boundaries.length - 1]) timer = setTimeout(tick, 32);
    };
    const preferenceChanged = () => {
      if (document.hidden || media.matches) {
        if (timer) clearTimeout(timer);
        flush();
      }
    };
    if (!current.finished) timer = setTimeout(tick, Math.max(0, 32 - (performance.now() - lastTick.current)));
    document.addEventListener('visibilitychange', preferenceChanged);
    media.addEventListener('change', preferenceChanged);
    if (!visible || document.hidden || media.matches) flush();
    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', preferenceChanged);
      media.removeEventListener('change', preferenceChanged);
    };
  }, [animate, boundaries, content, records, responseId, state, visible]);

  const offset = Math.min(content.length, record.offset);
  return (
    <Markdown
      variant="ai"
      className={className}
      components={components}
      copyDisabled={offset < content.length}
      data-ai-response={responseId}
      aria-busy={state === 'streaming' || offset < content.length}
    >
      {content.slice(0, offset)}
    </Markdown>
  );
}
