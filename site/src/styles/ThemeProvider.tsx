import { createContext, useContext, useState, useCallback } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { themes, ThemeName } from './theme';

interface ThemeContextType {
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  availableThemes: ThemeName[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

interface Props {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: Props) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('theme') as ThemeName;
    return saved && themes[saved] ? saved : 'dark';
  });

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    localStorage.setItem('theme', name);
  }, []);

  const value: ThemeContextType = {
    themeName,
    setTheme,
    availableThemes: Object.keys(themes) as ThemeName[],
  };

  return (
    <ThemeContext.Provider value={value}>
      <StyledThemeProvider theme={themes[themeName]}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
}
