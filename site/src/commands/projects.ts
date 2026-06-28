export function projects(): string {
  return `
┌─────────────────────────────────────────────────────────────┐
│  PROJECTS                                                   │
└─────────────────────────────────────────────────────────────┘

01. This Website
────────────────────────────────────────
    A terminal-style portfolio... deployed with Terraform
    because I practice what I preach.

    Stack: React, TypeScript, S3, CloudFront, Route 53
    Infra: Terraform (it's in the repo!)

    → github.com/shamikmishra1/shamik-sh

02. [Your Project Here]
────────────────────────────────────────
    Add your own projects here!

    Update: site/src/commands/projects.ts

03. [Another Project]
────────────────────────────────────────
    Describe what you built, the tech stack,
    and what problems it solved.

────────────────────────────────────────

💡 TIP: Update this file with your actual projects!
   Edit: site/src/commands/projects.ts

Type 'kubectl get pods' to see projects as running pods.
`;
}
