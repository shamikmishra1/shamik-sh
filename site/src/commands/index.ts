import { help } from './help';
import { about } from './about';
import { projects } from './projects';
import { contact, socials } from './contact';
import { easterEggs } from './easterEggs';
import { ThemeName } from '../styles/theme';
import { fetchNowPlaying, fetchReading } from '../utils/api';

type CommandHandler = (args?: string) => string | Promise<string>;

let _setTheme: ((name: ThemeName) => void) | null = null;
let _availableThemes: ThemeName[] = [];
let _currentTheme: ThemeName = 'dark';

export function setThemeCallback(
  setTheme: (name: ThemeName) => void,
  availableThemes: ThemeName[],
  currentTheme: ThemeName
) {
  _setTheme = setTheme;
  _availableThemes = availableThemes;
  _currentTheme = currentTheme;
}

function handleThemes(args?: string): string {
  if (!args) {
    return `
Available themes: ${_availableThemes.join(', ')}
Current: ${_currentTheme}

Usage: themes <name>
Example: themes dracula
`;
  }

  const themeName = args.trim() as ThemeName;
  if (_availableThemes.includes(themeName)) {
    _setTheme?.(themeName);
    return `Theme changed to '${themeName}'`;
  }

  return `Unknown theme: ${args}\nAvailable: ${_availableThemes.join(', ')}`;
}

const commands: Record<string, CommandHandler> = {
  help,
  about,
  whoami: about,
  projects,
  contact,
  socials,
  themes: handleThemes,
  music: () => fetchNowPlaying(),
  reading: () => fetchReading(),
  blog: () => `Coming soon... check back later!`,
  ...easterEggs,
};

export async function executeCommand(input: string): Promise<string> {
  const [cmd, ...args] = input.split(' ');
  const argString = args.join(' ');

  if (!cmd) {
    return '';
  }

  const handler = commands[cmd];

  if (handler) {
    return handler(argString);
  }

  return `Command not found: ${cmd}. Type 'help' for available commands.`;
}
