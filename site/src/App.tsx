import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Terminal } from './components/Terminal';
import { useCommandHistory } from './hooks/useCommandHistory';
import { executeCommand } from './commands';

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

function App() {
  const [output, setOutput] = useState<Array<{ command: string; result: string }>>([
    { command: '', result: getWelcomeMessage() }
  ]);
  const { history, addToHistory, navigateHistory, resetNavigation } = useCommandHistory();

  const handleCommand = useCallback((command: string) => {
    const trimmedCommand = command.trim().toLowerCase();

    if (trimmedCommand === 'clear') {
      setOutput([]);
      return;
    }

    const result = executeCommand(trimmedCommand);
    setOutput(prev => [...prev, { command, result }]);

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

function getWelcomeMessage(): string {
  return `
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ███████╗██╗  ██╗ █████╗ ███╗   ███╗██╗██╗  ██╗           │
│   ██╔════╝██║  ██║██╔══██╗████╗ ████║██║██║ ██╔╝           │
│   ███████╗███████║███████║██╔████╔██║██║█████╔╝            │
│   ╚════██║██╔══██║██╔══██║██║╚██╔╝██║██║██╔═██╗            │
│   ███████║██║  ██║██║  ██║██║ ╚═╝ ██║██║██║  ██╗           │
│   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═╝           │
│                                                             │
│   Backend Engineer | Kotlin | Terraform | AWS               │
│                                                             │
│   Type 'help' to see available commands                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
`;
}

export default App;
