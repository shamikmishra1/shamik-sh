import { help } from './help';
import { about } from './about';
import { skills } from './skills';
import { projects } from './projects';
import { experience } from './experience';
import { contact } from './contact';
import { easterEggs } from './easterEggs';

type CommandHandler = (args?: string) => string;

const commands: Record<string, CommandHandler> = {
  help,
  about,
  whoami: about,
  skills,
  projects,
  experience,
  contact,
  ssh: contact,
  ...easterEggs,
};

export function executeCommand(input: string): string {
  const [cmd, ...args] = input.split(' ');
  const argString = args.join(' ');

  if (!cmd) {
    return '';
  }

  // Handle special commands
  if (cmd === 'terraform') {
    return handleTerraform(argString);
  }

  if (cmd === 'kubectl') {
    return handleKubectl(argString);
  }

  if (cmd === 'man') {
    return handleMan(argString);
  }

  if (cmd === 'cat') {
    return handleCat(argString);
  }

  if (cmd === 'ls') {
    return handleLs(argString);
  }

  const handler = commands[cmd];

  if (handler) {
    return handler(argString);
  }

  return `Command not found: ${cmd}. Type 'help' for available commands.`;
}

function handleTerraform(args: string): string {
  if (args === 'plan') {
    return `
Refreshing Terraform state...

Terraform will perform the following actions:

  # opportunity.new_role will be created
  + resource "opportunity" "new_role" {
      + id          = (known after apply)
      + type        = "backend-engineer"
      + skills      = ["kotlin", "terraform", "aws", "kubernetes"]
      + impact      = "high"
      + growth      = "unlimited"
    }

Plan: 1 to add, 0 to change, 0 to destroy.

Would you like to 'terraform apply'? Contact me to discuss!
`;
  }

  if (args === 'apply') {
    return `
opportunity.new_role: Creating...
opportunity.new_role: Creation complete after 1s [id=shamik-2024]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.

Outputs:

contact_email = "shamik@example.com"
linkedin = "linkedin.com/in/shamikmishra"
`;
  }

  return `Usage: terraform <plan|apply>`;
}

function handleKubectl(args: string): string {
  if (args === 'get pods' || args === 'get po') {
    return `
NAME                              READY   STATUS    RESTARTS   AGE
portfolio-site-7d9f8b6c4-x2k9m    1/1     Running   0          2y
kotlin-services-5c8d7f9b2-h4j6    1/1     Running   0          3y
terraform-modules-8f6d5c4b1-m9n2  1/1     Running   0          2y
aws-infra-6b4d3c2a1-p7q5          1/1     Running   0          4y
side-projects-9e7d6c5b4-r3s8      1/1     Running   0          1y
`;
  }

  if (args === 'get services' || args === 'get svc') {
    return `
NAME              TYPE           CLUSTER-IP      EXTERNAL-IP         PORT(S)
shamik-api        LoadBalancer   10.0.0.1        shamikmishra.com    443:31337/TCP
linkedin          ExternalName   <none>          linkedin.com        443/TCP
github            ExternalName   <none>          github.com          443/TCP
`;
  }

  return `Usage: kubectl get <pods|services>`;
}

function handleMan(args: string): string {
  if (args === 'kotlin') {
    return `
KOTLIN(1)                    Shamik's Manual                    KOTLIN(1)

NAME
       kotlin - a modern, concise, and safe programming language

DESCRIPTION
       Why I love Kotlin:

       - Null safety that actually works
       - Coroutines for elegant async code
       - Extension functions that make code readable
       - Data classes that eliminate boilerplate
       - Perfect Java interop when you need it

       Used for:
       - Backend services (Spring Boot, Ktor)
       - Infrastructure tooling
       - Build scripts (Gradle Kotlin DSL)

SEE ALSO
       terraform(1), aws(1), kubernetes(1)
`;
  }

  if (args === 'terraform') {
    return `
TERRAFORM(1)                 Shamik's Manual                 TERRAFORM(1)

NAME
       terraform - infrastructure as code that doesn't make you cry

DESCRIPTION
       Why infrastructure as code matters:

       - Reproducible environments every time
       - Version-controlled infrastructure
       - Self-documenting architecture
       - No more "it works on my cloud"

       Modules I've built:
       - EKS clusters with proper networking
       - Multi-region failover setups
       - Cost-optimized auto-scaling
       - Security-hardened baselines

SEE ALSO
       kotlin(1), aws(1), kubernetes(1)
`;
  }

  return `What manual page do you want?\nTry: man kotlin, man terraform`;
}

function handleCat(args: string): string {
  if (args === 'resume.pdf' || args === 'resume') {
    return `[Opening resume... Just kidding, download it at /resume.pdf]

Or better yet, let's chat! Type 'contact' for details.`;
  }

  if (args === '/etc/passwd') {
    return `Nice try! But this isn't that kind of terminal ;)`;
  }

  if (args === '.env' || args === '.env.local') {
    return `
# Secrets? In MY terminal portfolio?
API_KEY=nice-try-hacker
DATABASE_URL=postgresql://shamik:hunter2@localhost/portfolio
SECRET_MESSAGE=type 'contact' to actually reach me
`;
  }

  return `cat: ${args || '<file>'}: No such file or directory`;
}

function handleLs(args: string): string {
  if (!args || args === '-la' || args === '-l' || args === '-a') {
    return `
drwxr-xr-x  shamik  staff   about.md
drwxr-xr-x  shamik  staff   skills/
drwxr-xr-x  shamik  staff   projects/
drwxr-xr-x  shamik  staff   experience/
-rw-r--r--  shamik  staff   resume.pdf
-rw-r--r--  shamik  staff   contact.md
`;
  }

  return `ls: ${args}: No such file or directory`;
}
