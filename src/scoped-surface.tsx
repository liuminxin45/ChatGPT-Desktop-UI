import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import { InputBehaviorRoot } from './input-behavior';
import { type Theme, useDesktopThemeContext, DesktopThemeContext } from './theme-context';

const SurfaceContext = createContext(false);
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface DesktopProviderProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled preference. Persistence belongs to the consumer. */
  theme?: Theme;
  defaultTheme?: Theme;
  onThemeChange?(theme: Theme): void;
}

/** Scoped controls and theme. Never changes document classes, scrolling or storage. */
export function DesktopProvider({
  theme: controlled,
  defaultTheme = 'system',
  onThemeChange,
  children,
  className,
  ...props
}: DesktopProviderProps) {
  const [preference, setPreference] = useState(defaultTheme);
  const theme = controlled ?? preference;
  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const change = () => setSystemDark(media.matches);
    change();
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  const setTheme = (next: Theme) => {
    if (controlled === undefined) setPreference(next);
    onThemeChange?.(next);
  };
  return (
    <DesktopThemeContext.Provider value={{ theme, setTheme }}>
      <SurfaceContext.Provider value={true}>
        <div
          {...props}
          className={['desktop-ui-root', className].filter(Boolean).join(' ')}
          data-theme={theme === 'system' ? (systemDark ? 'dark' : 'light') : theme}
        >
          <InputBehaviorRoot>{children}</InputBehaviorRoot>
        </div>
      </SurfaceContext.Provider>
    </DesktopThemeContext.Provider>
  );
}

type PortalProps = { children?: ReactNode; container?: Element | DocumentFragment | null; forceMount?: true };

const ScopedPortalContent = forwardRef<
  HTMLDivElement,
  { origin: RefObject<HTMLSpanElement>; children?: ReactNode }
>(function ScopedPortalContent({ origin, children }, forwardedRef) {
  const element = useRef<HTMLDivElement | null>(null);
  const theme = useDesktopThemeContext();
  useClientLayoutEffect(() => {
    const source = origin.current?.parentElement;
    const portal = element.current;
    if (!source || !portal) return;
    const sync = () => {
      const computed = source.ownerDocument.defaultView!.getComputedStyle(source);
      portal.dataset.theme =
        source.closest('[data-theme]')?.getAttribute('data-theme') ??
        (computed.colorScheme === 'dark' ? 'dark' : 'light');
      portal.classList.toggle(
        'desktop-native-tool-surface',
        !!source.closest('.desktop-native-tool-surface'),
      );
      for (const attribute of [
        'data-desktop-input-modality',
        'data-desktop-feature',
        'data-desktop-surface',
        'data-desktop-tool-surface',
      ]) {
        const value = source.closest(`[${attribute}]`)?.getAttribute(attribute);
        if (value === null || value === undefined) portal.removeAttribute(attribute);
        else portal.setAttribute(attribute, value);
      }
      for (const property of computed) {
        if (!property.startsWith('--desktop-') && !property.startsWith('--kit-')) continue;
        const value = computed.getPropertyValue(property);
        if (portal.style.getPropertyValue(property) !== value) portal.style.setProperty(property, value);
      }
      portal.style.colorScheme = computed.colorScheme;
    };
    sync();
    const observer = new MutationObserver(sync);
    for (let ancestor: Element | null = source; ancestor; ancestor = ancestor.parentElement)
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: [
          'class',
          'style',
          'data-theme',
          'data-desktop-input-modality',
          'data-desktop-feature',
          'data-desktop-surface',
          'data-desktop-tool-surface',
        ],
      });
    return () => observer.disconnect();
  }, [origin, theme]);
  return (
    <div
      className="desktop-ui-portal"
      data-theme={theme.theme === 'dark' ? 'dark' : 'light'}
      ref={(node) => {
        element.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
    >
      {children}
    </div>
  );
});

/** Keep Radix presence/layer ownership. A scoped wrapper mounts only when its portal opens,
 * inheriting the actual origin's tokens without pre-creating hidden modal targets. */
export function createDesktopPortal(Primitive: ComponentType<PortalProps>) {
  return function DesktopPortal({ children, ...props }: PortalProps) {
    const scoped = useContext(SurfaceContext);
    const origin = useRef<HTMLSpanElement>(null);
    if (!scoped) return <Primitive {...props}>{children}</Primitive>;
    return (
      <>
        <span hidden ref={origin} data-desktop-portal-origin="" />
        <Primitive {...props}>
          <ScopedPortalContent origin={origin}>{children}</ScopedPortalContent>
        </Primitive>
      </>
    );
  };
}

const documentOwners = new WeakMap<Document, object>();

/** Explicit document styling ownership for desktop applications using desktop.css.
 * The Host continues to own theme, persistence and native window behavior. */
export function DesktopDocumentAdapter({ children }: { children?: ReactNode }) {
  const marker = useRef<HTMLSpanElement>(null);
  useClientLayoutEffect(() => {
    const document = marker.current!.ownerDocument;
    if (documentOwners.has(document))
      throw new Error('A desktop document must have exactly one styling owner.');
    const owner = {};
    const previous = document.documentElement.getAttribute('data-desktop-document');
    documentOwners.set(document, owner);
    document.documentElement.setAttribute('data-desktop-document', '');
    return () => {
      if (documentOwners.get(document) !== owner) return;
      documentOwners.delete(document);
      if (previous === null) document.documentElement.removeAttribute('data-desktop-document');
      else document.documentElement.setAttribute('data-desktop-document', previous);
    };
  }, []);
  return (
    <>
      <span hidden ref={marker} />
      {children}
    </>
  );
}

/** Named type for consumer token overrides; values never become telemetry. */
export type DesktopTokenStyle = CSSProperties & { [key: `--desktop-${string}`]: string | number };
