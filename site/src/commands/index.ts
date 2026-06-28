import { help } from './help';
import { about } from './about';
import { skills } from './skills';
import { projects } from './projects';
import { contact, socials } from './contact';
import { easterEggs } from './easterEggs';

type CommandHandler = (args?: string) => string;

const commands: Record<string, CommandHandler> = {
  help,
  about,
  whoami: about,
  skills,
  projects,
  contact,
  socials,
  blog: () => `Coming soon... check back later!`,
  ...easterEggs,
};

export function executeCommand(input: string): string {
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
