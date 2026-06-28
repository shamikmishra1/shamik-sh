type CommandHandler = () => string;

export const easterEggs: Record<string, CommandHandler> = {
  sudo: () => `shamik is not in the sudoers file. This incident will be reported.`,

  rm: () => `Nice try! This terminal is read-only.`,

  exit: () => `There is no escape. But you could close the tab.`,

  cd: () => `You're already home.`,

  vim: () => `How do I exit this thing?!`,

  emacs: () => `Let's not start this debate.`,

  neofetch: () => `
       _,met$$$$$gg.          visitor@shamikmishra.com
    ,g$$$$$$$$$$$$$$$P.       ─────────────────────────
  ,g$$P"     """Y$$.".        OS: Web Terminal
 ,$$P'              \`$$$.     Host: shamikmishra.com
',$$P       ,ggs.     \`$$b:   Uptime: always
\`d$$'     ,$P"'   .    $$$    Shell: shamik-sh
 $$P      d$'     ,    $$P    Theme: \${current}
`,

  ls: () => `about.md  projects/  socials.txt`,

  cat: () => `cat: permission denied. Try 'about' instead.`,

  ping: () => `pong`,

  curl: () => `{"status":"online","mood":"caffeinated"}`,

  hello: () => `Hello! Type 'help' to see commands.`,
  hi: () => `Hi! Type 'help' to get started.`,
  hey: () => `Hey there!`,

  '': () => '',
};
