import { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';

const TerminalContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 900px;
  margin: 20px auto;
  width: 100%;
  padding: 0 20px;

  @media (max-width: 768px) {
    margin: 10px auto;
    padding: 0 10px;
  }
`;

const TerminalWindow = styled.div`
  background: ${({ theme }) => theme.colors.terminal};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TerminalHeader = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const WindowButton = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const TerminalTitle = styled.span`
  flex: 1;
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;

const TerminalBody = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  min-height: 500px;
`;

const OutputLine = styled.div`
  margin-bottom: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const CommandLine = styled.div`
  display: flex;
  color: ${({ theme }) => theme.colors.primary};
`;

const Prompt = styled.span`
  color: ${({ theme }) => theme.colors.secondary};
  margin-right: 8px;
`;

const Command = styled.span`
  color: ${({ theme }) => theme.colors.text};
`;

const Result = styled.pre`
  margin: 4px 0 16px 0;
  color: ${({ theme }) => theme.colors.text};
  font-family: inherit;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const InputLine = styled.div`
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-family: inherit;
  font-size: inherit;
  outline: none;
  caret-color: ${({ theme }) => theme.colors.primary};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

interface OutputItem {
  command: string;
  result: string;
}

interface TerminalProps {
  output: OutputItem[];
  onCommand: (command: string) => void;
  history: string[];
  onNavigateHistory: (direction: 'up' | 'down') => string | undefined;
}

export function Terminal({ output, onCommand, onNavigateHistory }: TerminalProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCommand(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevCommand = onNavigateHistory('up');
      if (prevCommand !== undefined) {
        setInput(prevCommand);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextCommand = onNavigateHistory('down');
      setInput(nextCommand ?? '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const completed = autocomplete(input);
      if (completed) {
        setInput(completed);
      }
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <TerminalContainer>
      <TerminalWindow onClick={handleContainerClick}>
        <TerminalHeader>
          <WindowButton $color="#ff5f56" />
          <WindowButton $color="#ffbd2e" />
          <WindowButton $color="#27ca40" />
          <TerminalTitle>shamik@portfolio ~ </TerminalTitle>
        </TerminalHeader>
        <TerminalBody ref={bodyRef}>
          {output.map((item, index) => (
            <OutputLine key={index}>
              {item.command && (
                <CommandLine>
                  <Prompt>visitor@shamikmishra.com:~$</Prompt>
                  <Command>{item.command}</Command>
                </CommandLine>
              )}
              <Result>{item.result}</Result>
            </OutputLine>
          ))}
          <InputLine>
            <Prompt>visitor@shamikmishra.com:~$</Prompt>
            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
              <Input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command..."
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </form>
          </InputLine>
        </TerminalBody>
      </TerminalWindow>
    </TerminalContainer>
  );
}

const COMMANDS = ['help', 'about', 'skills', 'projects', 'experience', 'contact', 'clear', 'whoami', 'ls', 'cat', 'sudo', 'exit', 'terraform', 'kubectl', 'ssh', 'man'];

function autocomplete(input: string): string | null {
  if (!input) return null;
  const matches = COMMANDS.filter(cmd => cmd.startsWith(input.toLowerCase()));
  return matches.length === 1 ? matches[0] : null;
}
