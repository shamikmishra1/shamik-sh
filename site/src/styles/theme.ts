export const theme = {
  colors: {
    background: '#0a0a0f',
    terminal: '#0d1117',
    text: '#c9d1d9',
    textMuted: '#8b949e',
    primary: '#00ff88',
    secondary: '#58a6ff',
    accent: '#f0883e',
    error: '#f85149',
    border: '#30363d',
    selection: '#264f78',
  },
  fonts: {
    mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
  },
  sizes: {
    fontSize: '14px',
    lineHeight: '1.6',
  },
};

export type Theme = typeof theme;
