import { useRef, useEffect, useState, lazy, Suspense } from 'react';
import styled, { keyframes, css } from 'styled-components';

const TravelMap = lazy(() => import('./TravelMap').then(m => ({ default: m.TravelMap })));
const Timeline = lazy(() => import('./Timeline').then(m => ({ default: m.Timeline })));
const TravelRandom = lazy(() => import('./TravelRandom').then(m => ({ default: m.TravelRandom })));

const glitch = keyframes`
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
`;

const flicker = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

const GlitchText = styled.div<{ $active: boolean }>`
  ${({ $active }) => $active && css`
    animation: ${glitch} 0.1s infinite, ${flicker} 0.15s infinite;
    color: #ff0000;
    text-shadow: 2px 2px #00ff00, -2px -2px #0000ff;
  `}
`;

const HackContainer = styled.div`
  color: #00ff00;
  font-family: monospace;
`;

const HackLine = styled.div<{ $delay: number }>`
  opacity: 0;
  animation: fadeIn 0.3s forwards;
  animation-delay: ${({ $delay }) => $delay}s;

  @keyframes fadeIn {
    to { opacity: 1; }
  }
`;

const ConfettiCanvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
`;

const TerminalContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 1000px;
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

const GreenText = styled.span`
  color: #50fa7b;
`;

const WhiteText = styled.span`
  color: #ffffff;
  font-weight: 500;
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

const TravelImage = styled.img`
  max-width: 100%;
  max-height: 350px;
  border-radius: 8px;
  margin-bottom: 12px;
  object-fit: contain;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
`;

const TravelVideo = styled.video`
  max-width: 100%;
  max-height: 350px;
  border-radius: 8px;
  margin-bottom: 12px;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
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
  const combinedRegex = /(https?:\/\/[^\s]+|mailto:[^\s]+|<green>[\s\S]*?<\/green>|<white>[\s\S]*?<\/white>)/g;
  const parts = text.split(combinedRegex);
  return parts.map((part, i) => {
    if (part.match(/^https?:\/\//) || part.match(/^mailto:/)) {
      const isMailto = part.startsWith('mailto:');
      return (
        <Link
          key={i}
          href={part}
          target={isMailto ? undefined : "_blank"}
          rel={isMailto ? undefined : "noopener noreferrer"}
        >
          {isMailto ? part.replace('mailto:', '') : part}
        </Link>
      );
    }
    if (part.match(/^<green>/)) {
      const content = part.replace(/<\/?green>/g, '');
      return <GreenText key={i}>{content}</GreenText>;
    }
    if (part.match(/^<white>/)) {
      const content = part.replace(/<\/?white>/g, '');
      return <WhiteText key={i}>{content}</WhiteText>;
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

function GlitchEffect({ frames }: { frames: string[] }) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (index < frames.length - 1) {
      const timer = setTimeout(() => setIndex(i => i + 1), 800);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setDone(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [index, frames.length]);

  return (
    <GlitchText $active={!done}>
      {frames[index]}
    </GlitchText>
  );
}

function HackEffect() {
  const lines = [
    '> Initializing hack sequence...',
    '> Accessing mainframe...',
    '> Bypassing firewall... [OK]',
    '> Decrypting passwords... [OK]',
    '> Downloading secrets... [OK]',
    '> Covering tracks... [OK]',
    '',
    'Just kidding. This is a portfolio website.',
    'But you looked pretty cool typing that. 😎',
  ];

  return (
    <HackContainer>
      {lines.map((line, i) => (
        <HackLine key={i} $delay={i * 0.4}>{line}</HackLine>
      ))}
    </HackContainer>
  );
}

function Confetti({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
    }> = [];

    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
      });
    }

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      frame++;
      if (frame < 180) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animate();
  }, [onComplete]);

  return <ConfettiCanvas ref={canvasRef} />;
}

function KonamiEffect() {
  const [showConfetti, setShowConfetti] = useState(true);

  return (
    <>
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      <Result>
        🎉 You found the secret! 🎉
      </Result>
    </>
  );
}

function renderResult(result: string) {
  if (result === '<travel-map>') {
    return (
      <Suspense fallback={<Result>Loading map...</Result>}>
        <TravelMap />
      </Suspense>
    );
  }

  if (result === '<travel-random>') {
    return (
      <Suspense fallback={<Result>Loading...</Result>}>
        <TravelRandom />
      </Suspense>
    );
  }

  if (result === '<timeline>') {
    return (
      <Suspense fallback={<Result>Loading timeline...</Result>}>
        <Timeline />
      </Suspense>
    );
  }

  const glitchMatch = result.match(/^<glitch>(.+)<\/glitch>$/);
  if (glitchMatch) {
    const frames = glitchMatch[1].split('|');
    return <GlitchEffect frames={frames} />;
  }

  if (result === '<hack>') {
    return <HackEffect />;
  }

  if (result === '<konami>') {
    return <KonamiEffect />;
  }

  const videoMatch = result.match(/^<video:([^>]+)>/);
  if (videoMatch) {
    const videoSrc = videoMatch[1];
    const textContent = result.replace(/^<video:[^>]+>\n?/, '');
    return (
      <>
        <TravelVideo
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
        />
        <Result>{linkify(textContent)}</Result>
      </>
    );
  }

  const imageMatch = result.match(/^<img:([^>]+)>/);
  if (imageMatch) {
    const imageSrc = imageMatch[1];
    const textContent = result.replace(/^<img:[^>]+>\n?/, '');
    const isTravelImage = imageSrc.startsWith('/travel/');
    const ImageComponent = isTravelImage ? TravelImage : ProfileImage;
    return (
      <>
        <ImageComponent
          src={imageSrc}
          alt="Profile"
          draggable={false}
          onContextMenu={(e) => isTravelImage && e.preventDefault()}
        />
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

  // Focus input and scroll to bottom when user starts typing anywhere
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if already focused on input, or if it's a modifier key
      if (document.activeElement === inputRef.current) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length === 1 || e.key === 'Backspace') {
        inputRef.current?.focus();
        if (bodyRef.current) {
          bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
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

const COMMANDS = ['help', 'about', 'projects', 'socials', 'blog', 'themes', 'clear', 'welcome', 'echo', 'pwd', 'music', 'reading', 'travel', 'timeline', 'matrix', 'whoami'];

function autocomplete(input: string): string | null {
  if (!input) return null;
  const matches = COMMANDS.filter(cmd => cmd.startsWith(input.toLowerCase()));
  return matches.length === 1 ? matches[0] : null;
}
