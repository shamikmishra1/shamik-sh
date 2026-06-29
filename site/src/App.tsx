import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Terminal } from './components/Terminal';
import { useCommandHistory } from './hooks/useCommandHistory';
import { executeCommand, setThemeCallback } from './commands';
import { useTheme } from './styles/ThemeProvider';

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const getWelcomeMessage = () => {
  const isMobile = window.innerWidth < 600;

  if (isMobile) {
    return `
┌─────────────────────┐
│   Shamik Mishra     │
└─────────────────────┘

Building things.
Breaking things.
Fixing things.

Type 'help' to explore.
`;
  }

  return `
 ____  _                 _ _      __  __ _     _
/ ___|| |__   __ _ _ __ (_) | __ |  \\/  (_)___| |__  _ __ __ _
\\___ \\| '_ \\ / _' | '_ \\| | |/ / | |\\/| | / __| '_ \\| '__/ _' |
 ___) | | | | (_| | | | | |   <  | |  | | \\__ \\ | | | | | (_| |
|____/|_| |_|\\__,_|_| |_|_|_|\\_\\ |_|  |_|_|___/_| |_|_|  \\__,_|

Building things. Breaking things. Fixing things.

You found my corner of the internet.
Type 'help' to explore.
`;
};

function App() {
  const [output, setOutput] = useState<Array<{ command: string; result: string }>>([
    { command: '', result: getWelcomeMessage() }
  ]);
  const { history, addToHistory, navigateHistory, resetNavigation } = useCommandHistory();
  const { setTheme, availableThemes, themeName } = useTheme();

  setThemeCallback(setTheme, availableThemes, themeName);

  const handleCommand = useCallback(async (command: string) => {
    const trimmedCommand = command.trim().toLowerCase();

    if (trimmedCommand === 'clear') {
      setOutput([]);
      return;
    }

    if (trimmedCommand === 'welcome') {
      setOutput([{ command: '', result: getWelcomeMessage() }]);
      return;
    }

    // Show loading state for async commands
    const asyncCommands = ['music', 'reading'];
    if (asyncCommands.includes(trimmedCommand)) {
      setOutput(prev => [...prev, { command, result: 'Loading...' }]);
      const result = await executeCommand(trimmedCommand);
      setOutput(prev => [...prev.slice(0, -1), { command, result }]);
    } else {
      const result = await executeCommand(trimmedCommand);
      setOutput(prev => [...prev, { command, result }]);
    }

    if (trimmedCommand) {
      addToHistory(command);
    }
    resetNavigation();
  }, [addToHistory, resetNavigation]);

  return (
    <AppContainer>
      <Terminal
        output={output}
        onCommand={handleCommand}
        history={history}
        onNavigateHistory={navigateHistory}
      />
    </AppContainer>
  );
}

export default App;
