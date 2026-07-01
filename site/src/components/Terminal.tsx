import { useRef, useEffect, useState, lazy, Suspense } from 'react';
import styled from 'styled-components';

const TravelMap = lazy(() => import('./TravelMap').then(m => ({ default: m.TravelMap })));

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
  border-radius: 8px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TerminalBody = styled.div`
  flex: 1;
  padding: 24px;
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
  color: ${({ theme }) => theme.colors.primary};
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

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 8px;
  margin-bottom: 12px;
  object-fit: cover;

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
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

const Link = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

interface OutputItem {
  command: string;
  result: string;
}

function linkify(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return <Link key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</Link>;
    }
    return part;
  });
}

interface TerminalProps {
  output: OutputItem[];
  onCommand: (command: string) => void;
  history: string[];
  onNavigateHistory: (direction: 'up' | 'down') => string | undefined;
}

function renderResult(result: string) {
  if (result === '<travel-map>') {
    return (
      <Suspense fallback={<Result>Loading map...</Result>}>
        <TravelMap />
      </Suspense>
    );
  }
  const imageMatch = result.match(/^<img:([^>]+)>/);
  if (imageMatch) {
    const imageSrc = imageMatch[1];
    const textContent = result.replace(/^<img:[^>]+>\n?/, '');
    return (
      <>
        <ProfileImage src={imageSrc} alt="Profile" />
        <Result>{linkify(textContent)}</Result>
      </>
    );
  }
  return <Result>{linkify(result)}</Result>;
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
        <TerminalBody ref={bodyRef}>
          {output.map((item, index) => (
            <OutputLine key={index}>
              {item.command && (
                <CommandLine>
                  <Prompt>❯</Prompt>
                  <Command>{item.command}</Command>
                </CommandLine>
              )}
              {renderResult(item.result)}
            </OutputLine>
          ))}
          <InputLine>
            <Prompt>❯</Prompt>
            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
              <Input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder=""
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

const COMMANDS = ['help', 'about', 'projects', 'socials', 'blog', 'themes', 'clear', 'welcome', 'echo', 'pwd', 'music', 'reading', 'travel', 'matrix', 'whoami'];

function autocomplete(input: string): string | null {
  if (!input) return null;
  const matches = COMMANDS.filter(cmd => cmd.startsWith(input.toLowerCase()));
  return matches.length === 1 ? matches[0] : null;
}
