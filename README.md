# shamik-sh

Terminal-style portfolio website built with React/TypeScript and deployed via Terraform.

## Quick Start

```bash
# Install dependencies
cd site && npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Infrastructure

```bash
cd infra

# Initialize Terraform
terraform init

# Deploy (replace YOUR_ZONE_ID with your Route 53 hosted zone ID)
terraform apply -var="hosted_zone_id=YOUR_ZONE_ID"
```

## Full Setup Guide

See [SETUP.md](./SETUP.md) for complete step-by-step instructions.

## Tech Stack

- **Frontend:** React, TypeScript, Styled-Components, Vite
- **Backend:** Kotlin, AWS Lambda
- **Infrastructure:** Terraform, S3, CloudFront, API Gateway, Route 53, ACM
- **CI/CD:** GitHub Actions

## License

MIT
