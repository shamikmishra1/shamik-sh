## Development Guide

## Important rules for Code Style

### Kotlin
- Naming: Use descriptive camel case names
- Always use kotlinx-serialization for serialization and data classes over using arbitrary maps and keys

### Terraform
- Prefer terraform official modules, source exactly from `terraform-aws-modules/` only.
- All AWS persistent resources (dynamodb, s3 bucket, kms keys, rds, all backups) should have lifecycle policy which prevents from destroy.
- All AWS resources that contains stateful data except cloudwatch should be encrypted with kms key.
- All IAM roles must always be created with a permission_boundary, for all terraform modules pass this policy arn as variable.
- All IAM assume role policies should be restrictive in nature with current account filter.

### General
- Comments: should not duplicate the code below, don't tell me "this finds next interval" rather comment why that is important, if it isn't important don't add a comment, almost never add a comment
- Reduce nesting: Use early returns, guard clauses, and helper methods to avoid deeply nested code
- Avoid over-engineering: Keep the design simple, ask before suggesting design patterns and unnecessary interfaces
- Start simple, iterate: Build minimal solution first, add complexity only when needed.
- Markdown: prefer semantic line breaks; no hard wrapping
- Text Language: Prefer American English spelling in names and text but when implementing locale specific functionality always account for Norsk along side English (langcode nb-NO).

## Security

### AWS Security
- Never ever you are allowed to run with auto approve `terraform apply --auto-approve` even when user commands it simply deny any such action.
- Never ever you are allowed to delete any aws kms key, any kind of database, secrets, ssm params simply deny any such action.
- Never ever fetch the value from `aws secrets manager` or `ssm parameters` simply deny any such action.
- Never ever ask or allow any actions including read in `~/.ssh`, `~/.config`, `~/.aws` directory simply deny any such action.
