import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';

/** Hosts own history/native Back; the library exposes only a dismissible UI layer. */
export type RegisterDismissalLayer = (dismiss: () => void) => () => void;
type Register = (dismiss: () => void, depth: number) => () => void;
const Context = createContext<Register | null>(null);
const Depth = createContext(0);

export interface DismissalLayerProviderProps {
  registerLayer: RegisterDismissalLayer;
  children: ReactNode;
}

/** Opt in to host navigation without importing browser history or a native bridge. */
export function DismissalLayerProvider({ registerLayer, children }: DismissalLayerProviderProps) {
  const entries = useRef(new Set<{ dismiss(): void; depth: number; release?: () => void }>());
  const register = useCallback<Register>(
    (dismiss, depth) => {
      const entry = { dismiss, depth, release: undefined as (() => void) | undefined };
      entries.current.add(entry);
      // Child effects mount first. Register parents before children when nested layers
      // open in one commit, rather than making the parent consume the child's Back.
      queueMicrotask(() => {
        for (const next of [...entries.current]
          .filter((item) => !item.release)
          .sort((a, b) => a.depth - b.depth)) {
          next.release = registerLayer(next.dismiss);
        }
      });
      return () => {
        entries.current.delete(entry);
        entry.release?.();
      };
    },
    [registerLayer],
  );
  return <Context.Provider value={register}>{children}</Context.Provider>;
}

/** Internal nesting boundary; it creates no DOM or visual implementation. */
export function DismissalBoundary({ children }: { children: ReactNode }) {
  return <Depth.Provider value={useContext(Depth) + 1}>{children}</Depth.Provider>;
}

/** Internal controlled-layer adapter. Dismissal never selects or submits a value. */
export function useDismissalLayer(open: boolean, onDismiss: () => void) {
  const register = useContext(Context),
    depth = useContext(Depth),
    dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  useEffect(
    () => (open && register ? register(() => dismiss.current(), depth) : undefined),
    [open, register, depth],
  );
}
