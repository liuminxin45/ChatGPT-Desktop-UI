module.exports = {
  content: ['./src/compat/**/*.{ts,tsx}', './examples/catalog/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        foreground: 'var(--desktop-color-text)',
        background: 'var(--desktop-color-background)',
        primary: 'var(--desktop-color-text)',
        'primary-foreground': 'var(--desktop-color-background)',
        secondary: 'var(--desktop-color-surface-muted)',
        'secondary-foreground': 'var(--desktop-color-text)',
        'destructive-foreground': 'var(--desktop-color-background)',
        ring: 'var(--desktop-color-focus)',
        'muted-foreground': 'var(--desktop-color-text-muted)',
        accent: 'var(--desktop-color-surface-hover)',
        'accent-foreground': 'var(--desktop-color-text)',
        muted: 'var(--desktop-color-surface-muted)',
        border: 'var(--desktop-color-border)',
        input: 'var(--desktop-color-border)',
        destructive: 'var(--desktop-color-danger)',
      },
      fontSize: { sm: ['13px', '20px'], base: ['13px', '20px'], xs: ['12px', '18px'] },
    },
  },
};
