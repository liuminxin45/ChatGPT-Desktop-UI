import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Button,
  Input,
  Select,
  DesktopRoot,
  DesktopThemeSelect,
  InternalScrollArea,
  useDesktopTheme,
} from '../../src';
import catalogData from '../../docs/design-system/catalog.json';
import { Examples } from './Examples';
import { CompatExamples } from './CompatExamples';
import '../../src/styles.css';
import './catalog.css';

function Reference() {
  const [family, setFamily] = useState('actions');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('chatgpt-desktop-kit:Button');
  const [copied, setCopied] = useState('');
  const [native, setNative] = useState(false);
  const { theme } = useDesktopTheme();
  const matches = useMemo(
    () =>
      catalogData.components.filter(
        (item) =>
          (query ? true : item.family === family) &&
          `${item.name} ${item.importPath}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [family, query],
  );
  const component = matches.find((item) => item.id === selected) || matches[0];
  const displayedFamily = component?.family || family;
  const metadata = catalogData.families[displayedFamily as keyof typeof catalogData.families];
  const code = component
    ? `import { ${component.name} } from '${component.importPath}';\nimport 'chatgpt-desktop-kit/${displayedFamily === 'compat' ? 'controls.css' : 'styles.css'}';`
    : '';
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied('Copied');
    } catch {
      setCopied('Select and copy the code below.');
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
          ChatGPT Desktop UI
        </a>
        <nav aria-label="Documentation">
          <a href="../">Client</a>
          <a href="../gallery/">Gallery</a>
          <a href="https://github.com/liuminxin45/ChatGPT-Desktop-UI/tree/main/docs">Documentation</a>
          <a href="https://github.com/liuminxin45/ChatGPT-Desktop-UI">GitHub</a>
        </nav>
        <DesktopThemeSelect />
      </header>
      <div className="reference-body">
        <aside>
          <h1>Components</h1>
          <Input
            aria-label="Search components"
            placeholder="Search components"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <nav aria-label="Component families">
            {Object.keys(catalogData.families).map((id) => (
              <Button
                key={id}
                variant="ghost"
                actionId={`reference.family.${id}`}
                aria-current={id === displayedFamily ? 'page' : undefined}
                onClick={() => {
                  setFamily(id);
                  setQuery('');
                  setCopied('');
                }}
              >
                {id}
              </Button>
            ))}
          </nav>
          <a href="https://github.com/liuminxin45/ChatGPT-Desktop-UI/blob/main/docs/design-system/README.md">
            Design system
          </a>
          <a href="https://github.com/liuminxin45/ChatGPT-Desktop-UI/blob/main/docs/development/README.md">
            Contributing
          </a>
        </aside>
        <InternalScrollArea role="main" className="reference-main">
          <h2>{displayedFamily}</h2>
          <p>{metadata.description}</p>
          <p className="reference-muted">States: {metadata.states}</p>
          <section aria-label="Live example" className="reference-preview" data-theme={theme}>
            {displayedFamily === 'compat' ? <CompatExamples /> : <Examples family={displayedFamily} />}
          </section>
          {component ? (
            <>
              <div className="reference-toolbar">
                <Select
                  actionId="reference.component.select"
                  aria-label="Component API"
                  value={component.id}
                  onValueChange={setSelected}
                  options={matches.map((item) => ({
                    value: item.id,
                    label: `${item.name}${item.importPath.includes('/compat/') ? ' · ' + item.importPath.split('/').at(-1) : ''}`,
                  }))}
                />
                <a
                  href={`https://github.com/liuminxin45/ChatGPT-Desktop-UI/blob/main/${component.implementation}`}
                >
                  Source
                </a>
              </div>
              <div className="reference-code">
                <pre>
                  <code>{code}</code>
                </pre>
                <Button actionId="reference.import.copy" onClick={copy}>
                  Copy import
                </Button>
                <span role="status">{copied}</span>
              </div>
              <h3>{component.name} props</h3>
              {component.description && <p>{component.description}</p>}
              <Button actionId="reference.props.native" variant="ghost" onClick={() => setNative(!native)}>
                {native ? 'Hide' : 'Show'} native attributes
              </Button>
              <div className="reference-table">
                <table>
                  <thead>
                    <tr>
                      <th>Prop</th>
                      <th>Type</th>
                      <th>Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {component.props
                      .filter((prop) => native || !prop.native)
                      .map((prop) => (
                        <tr key={prop.name}>
                          <th scope="row">{prop.name}</th>
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
              <p className="reference-muted">
                API generated from TypeScript. Preview shows a family composition; compound exports are used
                together. Hosts own data, persistence and native capabilities.
              </p>
            </>
          ) : (
            <p role="status">No matching components.</p>
          )}
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
