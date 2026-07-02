type CommandHandler = () => string;

const coffee = `
    ( (
     ) )
  ........
  |      |]
  \\      /
   \`----'

  Here's your coffee. Now get back to work.
`;

const glitchFrames = [
  'CRITICAL ERROR: SYSTEM FAILURE',
  'Deleting system32...',
  'Corrupting bootloader...',
  'Formatting /dev/sda...',
  'Just kidding. Nice try though.',
];

export const easterEggs: Record<string, CommandHandler> = {
  sudo: () => `Permission denied... just kidding, you're already root here.`,

  'rm -rf /': () => `<glitch>${glitchFrames.join('|')}</glitch>`,
  'rm -rf': () => `<glitch>${glitchFrames.join('|')}</glitch>`,
  rm: () => `Nice try! This terminal is read-only.`,

  exit: () => `Nice try. There is no escape.`,
  quit: () => `You can check out any time you like, but you can never leave.`,
  ':q': () => `This isn't vim... or is it?`,
  ':q!': () => `Ah, a vim user. I respect that.`,
  ':wq': () => `Changes saved to /dev/null`,

  cd: () => `You're already home.`,

  vim: () => `You're now stuck in vim forever.

Hint: Try ':q!' to escape... if you can.`,

  emacs: () => `Emacs is a great operating system. Too bad it lacks a good text editor.`,
  nano: () => `Finally, someone with taste.`,

  neofetch: () => `
       _,met$$$$$gg.          visitor@shamikmishra.com
    ,g$$$$$$$$$$$$$$$P.       ─────────────────────────
  ,g$$P"     """Y$$.".        OS: Web Terminal
 ,$$P'              \`$$$.     Host: shamikmishra.com
',$$P       ,ggs.     \`$$b:   Uptime: always
\`d$$'     ,$P"'   .    $$$    Shell: shamik-sh
 $$P      d$'     ,    $$P    Terminal: Your Browser
`,

  ls: () => `about.md  projects/  socials.txt  .secrets  .env`,
  'ls -la': () => `total 42
drwxr-xr-x  shamik  staff  about.md
drwxr-xr-x  shamik  staff  projects/
-rw-r--r--  shamik  staff  socials.txt
-rw-------  shamik  staff  .secrets
-rw-------  shamik  staff  .env`,

  cat: () => `cat: permission denied. Try 'about' instead.`,
  'cat .secrets': () => `Nice try. The secrets stay secret.`,
  'cat .env': () => `API_KEY=nice_try_buddy`,

  pwd: () => `/home/visitor/shamikmishra.com`,

  ping: () => `pong 🏓`,

  curl: () => `{"status":"online","mood":"caffeinated","coffee_level":"critical"}`,

  hello: () => `Hello there! 👋 Type 'help' to see what you can do.`,
  hi: () => `Hi! Welcome to my corner of the internet.`,
  hey: () => `Hey! What's up?`,
  yo: () => `Yo! 🤙`,

  '42': () => `The Answer to the Ultimate Question of Life, the Universe, and Everything.`,
  'the answer': () => `42`,

  hack: () => `<hack>`,

  coffee: () => coffee,
  tea: () => `Sorry, I only serve coffee here. ☕`,

  please: () => `Since you asked nicely... still no.`,
  sorry: () => `Apology accepted. Now type 'help'.`,
  thanks: () => `You're welcome! 😊`,
  'thank you': () => `No problem! Happy to help.`,

  why: () => `Why not?`,
  how: () => `Very carefully.`,
  what: () => `Exactly.`,
  when: () => `Now.`,
  where: () => `Here.`,
  who: () => `You. Type 'whoami' to confirm.`,

  lol: () => `😂`,
  lmao: () => `🤣`,

  iddqd: () => `God mode activated. You are now invincible... to boredom.`,
  idkfa: () => `All weapons unlocked: help, about, projects, socials`,

  fortune: () => {
    const fortunes = [
      'A bug in the code is worth two in the documentation.',
      'You will mass update production... and somehow it works.',
      'Beware of the developer who codes with a smile.',
      'Help! I\'m trapped in a fortune cookie factory!',
      'You will find a bug right after deploying.',
      'The best code is no code at all.',
      'There are 10 types of people: those who understand binary and those who don\'t.',
    ];
    return fortunes[Math.floor(Math.random() * fortunes.length)];
  },

  motd: () => `
┌──────────────────────────────────────────┐
│   Message of the Day                     │
│                                          │
│   "It works on my machine"               │
│           - Every developer ever         │
└──────────────────────────────────────────┘`,

  man: () => `What manual page do you want?
Just kidding, there are no manuals. RTFM.`,

  make: () => `make: *** No targets specified. Did you mean 'make coffee'?`,
  'make coffee': () => coffee,

  git: () => `git: 'gud' is not a git command. See 'git --help'.`,
  'git status': () => `On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
(just kidding, there's always something to commit)`,
  'git push': () => `Everything up-to-date
(force push rejected for your own safety)`,

  npm: () => `npm WARN deprecated your-sanity@1.0.0: This package is no longer maintained`,
  'npm install': () => `added 1,247 packages in 42s
(approximately 847 vulnerabilities found)`,

  python: () => `>>> import antigravity
>>> # XKCD 353`,

  node: () => `Welcome to Node.js.
Type ".help" for more information.
> process.exit()
Nice try.`,

  konami: () => `<konami>`,

  '': () => '',
};
