import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BookOpen,
  CaretDown,
  CaretRight,
  Check,
  Copy,
  GithubLogo,
  ArrowSquareOut,
  MagnifyingGlass,
  ArrowClockwise,
  SquaresFour,
} from '@phosphor-icons/react';
import {
  Button,
  IconButton,
  Input,
  DesktopRoot,
  DesktopThemeSelect,
  InternalScrollArea,
  Tooltip,
  useDesktopTheme,
} from '../../src';
import catalogData from '../../docs/design-system/catalog.json';
import { Examples } from './Examples';
import { CompatExamples } from './CompatExamples';
import '../../src/styles.css';
import './catalog.css';

const groups = [
  {
    name: 'Controls',
    families: ['actions', 'forms', 'navigation', 'layout', 'overlays', 'lists', 'tables', 'feedback'],
  },
  { name: 'Patterns', families: ['shell', 'client', 'conversation'] },
  { name: 'Integration', families: ['runtime', 'compat'] },
];
const labels: Record<string, string> = {
  actions: 'Actions',
  forms: 'Forms',
  navigation: 'Navigation',
  layout: 'Layout',
  overlays: 'Overlays',
  lists: 'Lists',
  tables: 'Tables',
  feedback: 'Feedback',
  shell: 'Shell',
  client: 'Client',
  conversation: 'Conversation',
  runtime: 'Runtime',
  compat: 'Compatibility',
};
const repository = 'https://github.com/liuminxin45/ChatGPT-Desktop-UI';
type Component = (typeof catalogData.components)[number] & { aliasOf?: string };

function ReferenceLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip label={label}>
      <a
        href={href}
        aria-label={label}
        className="desktop-button desktop-button--sm desktop-button--icon"
        data-desktop-action="reference.document.open"
      >
        {children}
      </a>
    </Tooltip>
  );
}

function Reference() {
  const [selected, setSelected] = useState('chatgpt-desktop-kit:Button');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(['actions']);
  const [native, setNative] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const [previewRevision, setPreviewRevision] = useState(0);
  const { theme } = useDesktopTheme();
  const scroll = useRef<HTMLDivElement>(null);
  const matches = useMemo(
    () =>
      catalogData.components.filter((item) =>
        (item.name + ' ' + item.importPath).toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );
  const component: Component =
    catalogData.components.find((item) => item.id === selected) || catalogData.components[0];
  const family = component.family;
  const metadata = catalogData.families[family as keyof typeof catalogData.families];
  const props = [
    ...component.props,
    ...(native
      ? component.nativeProps.map(
          (id) => catalogData.nativeAttributes[id as keyof typeof catalogData.nativeAttributes],
        )
      : []),
  ];
  const stylesheet = 'chatgpt-desktop-kit/' + (family === 'compat' ? 'controls.css' : 'styles.css');
  const code =
    'import { ' + component.name + " } from '" + component.importPath + "';\nimport '" + stylesheet + "';";
  const choose = (item: Component) => {
    setSelected(item.id);
    setNative(false);
    setCopied(false);
    setCopyError('');
    scroll.current?.scrollTo({ top: 0 });
  };
  const chooseFamily = (id: string) => {
    if (id === family && expanded.includes(id)) {
      setExpanded((old) => old.filter((item) => item !== id));
      return;
    }
    setExpanded((old) => (old.includes(id) ? old : [...old, id]));
    choose(catalogData.components.find((item) => item.family === id)!);
  };
  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);
  async function copy() {
    setCopied(false);
    setCopyError('');
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setCopyError('');
    } catch {
      setCopyError('Couldn’t copy. Select the code to copy it.');
    }
  }
  return (
    <div
      className="reference-app"
      data-desktop-feature="component-reference"
      data-desktop-surface="component-reference.main"
    >
      <header className="reference-header">
        <a className="reference-brand" href="../">
          <SquaresFour size={20} aria-hidden="true" />
          ChatGPT Desktop UI
        </a>
        <nav aria-label="Documentation">
          <a className="desktop-button desktop-button--sm desktop-button--ghost" href="../">
            Client
          </a>
          <a
            className="desktop-button desktop-button--sm desktop-button--ghost"
            href="./"
            aria-current="page"
          >
            Components
          </a>
          <a className="desktop-button desktop-button--sm desktop-button--ghost" href="../gallery/">
            Gallery
          </a>
        </nav>
        <div className="reference-header-actions">
          <ReferenceLink href={repository} label="GitHub">
            <GithubLogo size={18} aria-hidden="true" />
          </ReferenceLink>
          <DesktopThemeSelect />
        </div>
      </header>
      <div className="reference-body">
        <aside className="reference-sidebar" aria-label="Component navigation">
          <h1>Components</h1>
          <div className="reference-search">
            <MagnifyingGlass size={16} aria-hidden="true" />
            <Input
              aria-label="Search components"
              placeholder="Search components"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <InternalScrollArea className="reference-navigation">
            <nav aria-label="Component families">
              {groups.map((group) => {
                const visible = group.families.filter((id) => matches.some((item) => item.family === id));
                if (!visible.length) return null;
                return (
                  <section key={group.name} className="reference-nav-group" aria-label={group.name}>
                    <h2>{group.name}</h2>
                    {visible.map((id) => {
                      const open = Boolean(query) || expanded.includes(id);
                      return (
                        <div key={id} className="reference-nav-family">
                          <Button
                            variant="ghost"
                            actionId={'reference.family.' + id}
                            aria-label={id}
                            aria-expanded={open}
                            aria-controls={'reference-family-' + id}
                            aria-current={id === family ? 'page' : undefined}
                            onClick={() => chooseFamily(id)}
                          >
                            <CaretRight size={14} className="reference-nav-chevron" aria-hidden="true" />
                            <span>{labels[id]}</span>
                          </Button>
                          <div
                            id={'reference-family-' + id}
                            hidden={!open}
                            className="reference-nav-components"
                          >
                            {matches
                              .filter((item) => item.family === id)
                              .map((item) => (
                                <Button
                                  key={item.id}
                                  variant="ghost"
                                  size="sm"
                                  actionId="reference.component.select"
                                  aria-current={selected === item.id ? 'page' : undefined}
                                  onClick={() => choose(item)}
                                >
                                  <span>{item.name}</span>
                                  {id === 'compat' && <small>{item.importPath.split('/').at(-1)}</small>}
                                </Button>
                              ))}
                          </div>
                        </div>
                      );
                    })}
                  </section>
                );
              })}
              {!matches.length && (
                <p className="reference-empty" role="status">
                  No matching components.
                </p>
              )}
            </nav>
          </InternalScrollArea>
          <footer className="reference-sidebar-footer">
            <a
              className="desktop-button desktop-button--sm desktop-button--ghost"
              href={repository + '/blob/main/docs/design-system/README.md'}
            >
              <BookOpen size={16} aria-hidden="true" />
              Design system
              <ArrowSquareOut size={13} aria-hidden="true" />
            </a>
            <a
              className="desktop-button desktop-button--sm desktop-button--ghost"
              href={repository + '/blob/main/CONTRIBUTING.md'}
            >
              Contributing
              <ArrowSquareOut size={13} aria-hidden="true" />
            </a>
          </footer>
        </aside>
        <InternalScrollArea ref={scroll} role="main" className="reference-main">
          <div className="reference-content">
            <header className="reference-heading">
              <div>
                <h2>{component.name}</h2>
                <p>{component.description || metadata.description}</p>
              </div>
            </header>
            <section className="reference-preview-frame" aria-label="Live example">
              <header className="reference-section-bar">
                <h3>{labels[family]} preview</h3>
                <IconButton
                  aria-label="Reset example"
                  actionId="reference.example.reset"
                  onClick={() => setPreviewRevision((old) => old + 1)}
                >
                  <ArrowClockwise size={16} aria-hidden="true" />
                </IconButton>
              </header>
              <div className="reference-preview" data-theme={theme}>
                {family === 'compat' ? (
                  <CompatExamples key={family + previewRevision} />
                ) : (
                  <Examples key={family + previewRevision} family={family} />
                )}
              </div>
            </section>
            <section className="reference-import" aria-label="Import">
              <header className="reference-section-bar">
                <h3>Import</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  iconOnly
                  actionId="reference.import.copy"
                  onClick={copy}
                  icon={
                    copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />
                  }
                >
                  Copy import
                </Button>
              </header>
              <pre>
                <code>
                  <span className="reference-code-keyword">import</span>
                  {' { '}
                  <span className="reference-code-symbol">{component.name}</span>
                  {' } '}
                  <span className="reference-code-keyword">from</span>{' '}
                  <span className="reference-code-string">{"'" + component.importPath + "'"}</span>
                  {';\n'}
                  <span className="reference-code-keyword">import</span>{' '}
                  <span className="reference-code-string">{"'" + stylesheet + "'"}</span>
                  {';'}
                </code>
              </pre>
              <span role="status" className="reference-sr-only">
                {copied ? 'Import copied to clipboard.' : ''}
              </span>
              {copyError && (
                <p role="alert" className="reference-copy-error">
                  {copyError}
                </p>
              )}
            </section>
            <section className="reference-api" aria-label="Properties">
              <header className="reference-section-bar">
                <h3>Properties</h3>
                {!!component.nativeProps.length && (
                  <Button
                    size="sm"
                    variant="ghost"
                    actionId="reference.props.native"
                    aria-expanded={native}
                    onClick={() => setNative(!native)}
                    icon={<CaretDown size={14} aria-hidden="true" />}
                  >
                    Native attributes
                  </Button>
                )}
              </header>
              {props.length ? (
                <div className="reference-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Type</th>
                        <th>Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props.map((prop) => (
                        <tr key={prop.name}>
                          <th scope="row">
                            <code>{prop.name}</code>
                          </th>
                          <td>
                            <code>{prop.type}</code>
                            {prop.description && <p>{prop.description}</p>}
                          </td>
                          <td>{prop.required ? 'Yes' : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="reference-muted">
                  {component.nativeProps.length
                    ? 'Accepts native HTML attributes.'
                    : 'No configurable properties.'}
                </p>
              )}
              {component.aliasOf && (
                <p className="reference-muted">
                  Alias of <code>{component.aliasOf.split(':').at(-1)}</code>.
                </p>
              )}
            </section>
          </div>
        </InternalScrollArea>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <DesktopRoot>
    <Reference />
  </DesktopRoot>,
);
