# shamikmishra.com - Terminal Portfolio Setup Guide

## Project Structure

```
shamikmishra.com/
├── SETUP.md                    # This file
├── build.gradle.kts            # Root Gradle build (Kotlin DSL)
├── settings.gradle.kts         # Module configuration
├── gradle/
│   ├── libs.versions.toml      # Version catalog
│   └── wrapper/
├── aws-lambda/
│   └── api-health/             # Lambda: /health endpoint
│       ├── build.gradle.kts
│       └── src/main/kotlin/
├── site/                       # React/TypeScript frontend
│   ├── build.gradle.kts        # npm wrapper tasks
│   ├── package.json
│   └── src/
└── infra/                      # Terraform infrastructure
    ├── main.tf
    ├── variables.tf
    └── outputs.tf
```

---

## Prerequisites

- [ ] **JDK 21** installed (`brew install openjdk@21`)
- [ ] **AWS CLI** installed and configured (`aws configure`)
- [ ] **Terraform** installed (`brew install terraform`)
- [ ] **Node.js 18+** installed (`brew install node`)
- [ ] Domain `shamikmishra.com` in Route 53

---

## Part 1: Open in IntelliJ IDEA

1. Open IntelliJ IDEA
2. File → Open → Select `/Users/shamikmishra/Documents/Personal/shamikmishra.com`
3. IntelliJ will auto-detect Gradle and import the project
4. Wait for Gradle sync to complete

**Project Modules:**
- `aws-lambda:aws-lambda-api-health` - Kotlin Lambda function
- `site` - React/TypeScript frontend (npm build tasks)

---

## Part 2: GitHub Setup

```bash
cd /Users/shamikmishra/Documents/Personal/shamikmishra.com

# Initialize git
git init

# Initial commit
git add .
git commit -m "Initial commit: terminal portfolio with Kotlin Lambda"

# Create GitHub repo and push
gh repo create shamikmishra.com --public --source=. --remote=origin --push
```

---

## Part 3: Deploy Infrastructure to AWS

### Step 1: Get Your Route 53 Hosted Zone ID

```bash
aws route53 list-hosted-zones --query "HostedZones[?Name=='shamikmishra.com.'].Id" --output text
# Returns something like: /hostedzone/Z1234567890ABC
# Use just the ID part: Z1234567890ABC
```

### Step 2: Initialize and Plan Terraform

```bash
cd /Users/shamikmishra/Documents/Personal/shamikmishra.com/infra

# Initialize Terraform
terraform init

# Preview what will be created
terraform plan -var="hosted_zone_id=YOUR_ZONE_ID"
```

### Step 3: Apply Terraform (Create Resources)

```bash
terraform apply -var="hosted_zone_id=YOUR_ZONE_ID"

# Type 'yes' when prompted
# This creates:
#   - S3 bucket for website
#   - S3 bucket for Lambda code
#   - CloudFront distribution
#   - ACM certificate (with DNS validation)
#   - API Gateway + Lambda
#   - Route 53 records for:
#     - shamikmishra.com → CloudFront
#     - www.shamikmishra.com → CloudFront
#     - api.shamikmishra.com → API Gateway
```

**Note:** Certificate validation takes 5-30 minutes. Terraform will wait.

### Step 4: Save Terraform Outputs

```bash
terraform output
# Save these values - you'll need them for deployment
```

---

## Part 4: Build and Deploy

### Build Lambda

```bash
cd /Users/shamikmishra/Documents/Personal/shamikmishra.com

# Build the Lambda JAR
./gradlew :aws-lambda:aws-lambda-api-health:shadowJar

# The JAR is at: aws-lambda/api-health/build/libs/api-health-all.jar
```

### Deploy Lambda to S3

```bash
# Get bucket name from Terraform
LAMBDA_BUCKET=$(cd infra && terraform output -raw s3_lambda_bucket_name)

# Upload Lambda JAR
aws s3 cp aws-lambda/api-health/build/libs/api-health-all.jar \
    s3://$LAMBDA_BUCKET/api-health/api-health-all.jar

# Update Lambda function code
aws lambda update-function-code \
    --function-name shamikmishra-com-api-health \
    --s3-bucket $LAMBDA_BUCKET \
    --s3-key api-health/api-health-all.jar
```

### Build and Deploy Site

```bash
cd site

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to S3
WEBSITE_BUCKET=$(cd ../infra && terraform output -raw s3_bucket_name)
aws s3 sync dist/ s3://$WEBSITE_BUCKET --delete

# Invalidate CloudFront cache
DISTRIBUTION_ID=$(cd ../infra && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

---

## Part 5: Verify Deployment

```bash
# Test the website
curl -I https://shamikmishra.com

# Test the API
curl https://api.shamikmishra.com/health
# Should return: {"status":"healthy","message":"shamikmishra.com API is running",...}
```

---

## Quick Reference Commands

### Gradle (IntelliJ or Terminal)

```bash
# Build Lambda
./gradlew :aws-lambda:aws-lambda-api-health:build

# Build Lambda fat JAR
./gradlew :aws-lambda:aws-lambda-api-health:shadowJar

# Run tests
./gradlew test

# Build site (via npm)
./gradlew :site:npmBuild

# Start dev server
./gradlew :site:npmDev
```

### Full Deployment Script

```bash
#!/bin/bash
set -e

cd /Users/shamikmishra/Documents/Personal/shamikmishra.com

# Build Lambda
./gradlew :aws-lambda:aws-lambda-api-health:shadowJar

# Build site
cd site && npm run build && cd ..

# Get bucket names
cd infra
LAMBDA_BUCKET=$(terraform output -raw s3_lambda_bucket_name)
WEBSITE_BUCKET=$(terraform output -raw s3_bucket_name)
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
cd ..

# Deploy Lambda
aws s3 cp aws-lambda/api-health/build/libs/api-health-all.jar \
    s3://$LAMBDA_BUCKET/api-health/api-health-all.jar

aws lambda update-function-code \
    --function-name shamikmishra-com-api-health \
    --s3-bucket $LAMBDA_BUCKET \
    --s3-key api-health/api-health-all.jar

# Deploy site
aws s3 sync site/dist/ s3://$WEBSITE_BUCKET --delete

# Invalidate cache
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

echo "Deployment complete!"
echo "Website: https://shamikmishra.com"
echo "API: https://api.shamikmishra.com/health"
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Route 53                                    │
│  shamikmishra.com → CloudFront                                      │
│  api.shamikmishra.com → API Gateway                                 │
└─────────────────────────────────────────────────────────────────────┘
                │                               │
                ▼                               ▼
┌───────────────────────────┐    ┌───────────────────────────┐
│       CloudFront          │    │      API Gateway          │
│   (CDN + HTTPS + Cache)   │    │    (HTTP API + CORS)      │
└───────────────────────────┘    └───────────────────────────┘
                │                               │
                ▼                               ▼
┌───────────────────────────┐    ┌───────────────────────────┐
│         S3 Bucket         │    │     Lambda Function       │
│   (Static Website Files)  │    │  (Kotlin + Java 21)       │
│    - index.html           │    │   - /health endpoint      │
│    - assets/*             │    │   - Future: more APIs     │
└───────────────────────────┘    └───────────────────────────┘
```

---

## Costs (Estimated Monthly)

| Service | Cost |
|---------|------|
| S3 (website + Lambda code) | ~$0.05 |
| CloudFront (1TB free tier) | $0.00 |
| Route 53 (hosted zone) | $0.50 |
| ACM Certificate | Free |
| API Gateway (1M requests free) | $0.00 |
| Lambda (1M requests free) | $0.00 |
| **Total** | **~$0.55/month** |

---

## Troubleshooting

### Gradle sync fails in IntelliJ
- Ensure JDK 21 is installed: `java -version`
- File → Invalidate Caches and Restart

### Lambda returns 502
- Check CloudWatch Logs: `/aws/lambda/shamikmishra-com-api-health`
- Verify JAR was uploaded to correct S3 path

### Certificate stuck validating
- Check Route 53 for CNAME validation records
- Can take up to 30 minutes

### DNS not resolving
```bash
dig shamikmishra.com
dig api.shamikmishra.com
```

---

## Next Steps

1. [ ] Deploy infrastructure
2. [ ] Build and deploy Lambda
3. [ ] Build and deploy site
4. [ ] Add more Lambda endpoints (contact form, etc.)
5. [ ] Set up GitHub Actions for CI/CD
6. [ ] Customize terminal commands with your real info
