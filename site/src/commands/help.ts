export function help(): string {
  return `
Available commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  about / whoami     Who am I?
  skills             Tech stack & expertise
  projects           Things I've built
  experience         Work history
  contact / ssh      How to reach me

  terraform plan     See what I can build for you
  kubectl get pods   View my running projects
  man <topic>        Deep dive (try: kotlin, terraform)

  cat <file>         Read a file (try: resume.pdf)
  ls                 List available files
  clear              Clear the terminal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pro tips:
  • Use ↑/↓ arrows to navigate command history
  • Press Tab to autocomplete commands
  • Try some classic unix commands... if you dare 😏

`;
}
