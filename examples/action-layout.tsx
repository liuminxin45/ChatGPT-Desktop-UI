import { createRoot } from 'react-dom/client';
import { Button, DesktopRoot } from '../src';
import '../src/styles.css';
createRoot(document.getElementById('root')!).render(
  <DesktopRoot>
    <div style={{ width: 320, margin: 24 }}>
      <Button data-testid="command">Command</Button>
      {['安', 'A considerably longer contact name'].map((name) => (
        <Button layout="row" key={name} data-testid="row" aria-label={name}>
          <span data-testid="avatar" style={{ width: 32, height: 32, flexShrink: 0 }}>
            A
          </span>
          <span style={{ minWidth: 0 }}>
            {name}
            <small style={{ display: 'block' }}>Department</small>
          </span>
        </Button>
      ))}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 6 }}>
        {[1, 100].map((size) => (
          <Button key={size} layout="tile" data-testid="tile" aria-label="Preview" disabled={size === 100}>
            <img
              alt="preview"
              src={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="gray"/></svg>`)}`}
            />
          </Button>
        ))}
      </div>
      <Button
        layout="surface"
        data-testid="surface"
        aria-label="Schedule cell"
        style={{ width: 100, height: 88, border: 0, background: 'var(--desktop-color-surface-muted)' }}
      >
        Schedule
      </Button>
    </div>
    <section
      aria-label="Button state matrix"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 88px)', gap: 8, padding: 24 }}
    >
      {(['command', 'row', 'tile', 'surface'] as const).flatMap((layout) =>
        (['primary', 'secondary', 'ghost', 'danger'] as const).flatMap((variant) =>
          (['sm', 'md'] as const).flatMap((size) =>
            [false, true].map((disabled) => (
              <Button
                key={`${layout}-${variant}-${size}-${disabled}`}
                layout={layout}
                variant={variant}
                size={size}
                disabled={disabled}
                actionId={`fixture.matrix.${layout}.${variant}.${size}.${disabled}`}
                data-testid="matrix"
                data-layout={layout}
                data-variant={variant}
                data-size={size}
                aria-label={`${layout} ${variant} ${size} ${disabled ? 'disabled' : 'enabled'}`}
                style={
                  layout === 'surface'
                    ? { width: 88, height: 44, border: 0, background: 'var(--desktop-color-surface-muted)' }
                    : undefined
                }
                onClick={(event) => {
                  event.currentTarget.dataset.invoked = 'true';
                }}
              >
                {layout}
              </Button>
            )),
          ),
        ),
      )}
    </section>
  </DesktopRoot>,
);
