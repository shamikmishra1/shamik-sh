type CommandHandler = () => string;

export const easterEggs: Record<string, CommandHandler> = {
  sudo: () => `
shamik is not in the sudoers file.
This incident will be reported.

...just kidding. But nice try! 😄
`,

  'rm': () => `
rm: missing operand
Try 'rm --help' for more information.

(You weren't trying to rm -rf /, were you?)
`,

  'rm -rf /': () => `
🚫 PERMISSION DENIED

Nice try! But this portfolio is:
  ✓ Backed up
  ✓ Version controlled
  ✓ Deployed via Terraform

You can't destroy what's in the cloud 😎
`,

  'rm -rf': () => `
What exactly were you planning to delete? 🤔
`,

  exit: () => `
There is no escape from this terminal.

But you could:
  → Close the tab (boring)
  → Type 'contact' to reach the real me
  → Keep exploring!
`,

  pwd: () => `/home/visitor/shamikmishra.com`,

  cd: () => `You're exactly where you need to be.`,

  vim: () => `
Opening vim...

...

How do I exit this thing?!

(Just kidding, I use vim. :wq)
`,

  emacs: () => `
Emacs? In this economy?

(I respect your choices, but this terminal runs on vim energy)
`,

  neofetch: () => `
       _,met$$$$$gg.          visitor@shamikmishra.com
    ,g$$$$$$$$$$$$$$$P.       ─────────────────────────
  ,g$$P"     """Y$$.".        OS: TerminalOS 1.0
 ,$$P'              \`$$$.     Host: shamikmishra.com
',$$P       ,ggs.     \`$$b:   Kernel: React 18.2.0
\`d$$'     ,$P"'   .    $$$    Uptime: since 2020
 $$P      d$'     ,    $$P    Shell: bash 5.0
 $$:      $$.   -    ,d$$'    Terminal: web-based
 $$;      Y$b._   _,d$P'      CPU: Kotlin-powered
 Y$$.    \`.\`"Y$$$$P"'         Memory: Unlimited ambition
 \`$$b      "-.__
  \`Y$$                        Type 'skills' for specs
   \`Y$$.
     \`$$b.
       \`Y$$b.
          \`"Y$b._
              \`"""
`,

  ping: () => `
PING shamikmishra.com (your-screen): 56 data bytes
64 bytes from your-screen: icmp_seq=0 ttl=64 time=0.042 ms
64 bytes from your-screen: icmp_seq=1 ttl=64 time=0.038 ms
64 bytes from your-screen: icmp_seq=2 ttl=64 time=0.041 ms

--- shamikmishra.com ping statistics ---
3 packets transmitted, 3 packets received, 0.0% packet loss

The server is up! Type 'contact' to connect for real.
`,

  curl: () => `
{
  "status": "available",
  "role": "backend-engineer",
  "location": "wherever the wifi is",
  "hireable": true,
  "coffee_level": "optimal"
}
`,

  htop: () => `
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    1 shamik    20   0   99999  99999  99999 S  100.0  0.0  9999:99+ coding
    2 shamik    20   0   88888  88888  88888 S   80.0  0.0  8888:88+ debugging
    3 shamik    20   0   77777  77777  77777 S   50.0  0.0  7777:77+ coffee
    4 shamik    20   0   66666  66666  66666 S   30.0  0.0  6666:66+ meetings
    5 shamik    20   0   55555  55555  55555 S   20.0  0.0  5555:55+ documentation
`,

  docker: () => `
CONTAINER ID   IMAGE              STATUS          NAMES
a1b2c3d4e5f6   shamik/skills      Up 4 years      backend-development
b2c3d4e5f6a1   shamik/terraform   Up 3 years      infrastructure
c3d4e5f6a1b2   shamik/aws         Up 4 years      cloud-expertise
d4e5f6a1b2c3   shamik/coffee      Always Up       productivity-engine
`,

  git: () => `
On branch main
Your career is up to date with 'origin/success'.

nothing to commit, working tree is clean
(but there's always room for new commits!)
`,

  npm: () => `
npm WARN deprecated traditional-employment@1.0.0: Consider remote work

added 999 experiences, removed 0 regrets, changed 100 perspectives in 4 years
`,

  'hello': () => `Hello! 👋 Type 'about' to learn more about me.`,
  'hi': () => `Hi there! 👋 Type 'help' to see what you can do here.`,
  'hey': () => `Hey! Welcome to my terminal. Try typing 'help' to get started.`,

  '': () => '',
};
