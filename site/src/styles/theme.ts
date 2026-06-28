export type ThemeName = 'dark' | 'light' | 'dracula' | 'nord' | 'gruvbox';

export interface ThemeColors {
  background: string;
  terminal: string;
  text: string;
  textMuted: string;
  primary: string;
  secondary: string;
  accent: string;
  error: string;
  border: string;
  selection: string;
}

export interface Theme {
  colors: ThemeColors;
  fonts: {
    mono: string;
  };
  sizes: {
    fontSize: string;
    lineHeight: string;
  };
}

const baseTheme = {
  fonts: {
    mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
  },
  sizes: {
    fontSize: '14px',
    lineHeight: '1.6',
  },
};

export const themes: Record<ThemeName, Theme> = {
  dark: {
    ...baseTheme,
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
  },
  light: {
    ...baseTheme,
    colors: {
      background: '#ffffff',
      terminal: '#f6f8fa',
      text: '#24292f',
      textMuted: '#57606a',
      primary: '#1a7f37',
      secondary: '#0969da',
      accent: '#bf8700',
      error: '#cf222e',
      border: '#d0d7de',
      selection: '#ddf4ff',
    },
  },
  dracula: {
    ...baseTheme,
    colors: {
      background: '#282a36',
      terminal: '#1e1f29',
      text: '#f8f8f2',
      textMuted: '#6272a4',
      primary: '#50fa7b',
      secondary: '#8be9fd',
      accent: '#ffb86c',
      error: '#ff5555',
      border: '#44475a',
      selection: '#44475a',
    },
  },
  nord: {
    ...baseTheme,
    colors: {
      background: '#2e3440',
      terminal: '#3b4252',
      text: '#eceff4',
      textMuted: '#d8dee9',
      primary: '#a3be8c',
      secondary: '#88c0d0',
      accent: '#ebcb8b',
      error: '#bf616a',
      border: '#4c566a',
      selection: '#434c5e',
    },
  },
  gruvbox: {
    ...baseTheme,
    colors: {
      background: '#282828',
      terminal: '#1d2021',
      text: '#ebdbb2',
      textMuted: '#a89984',
      primary: '#b8bb26',
      secondary: '#83a598',
      accent: '#fe8019',
      error: '#fb4934',
      border: '#3c3836',
      selection: '#504945',
    },
  },
};

export const theme = themes.dark;
