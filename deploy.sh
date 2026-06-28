#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "=== Building shamikmishra.com ==="

# Build Lambda
echo "Building Lambda..."
./gradlew :aws-lambda:aws-lambda-api-health:shadowJar

# Build site
echo "Building site..."
cd site && npm install && npm run build && cd ..

# Get Terraform outputs
echo "Getting deployment targets..."
cd infra
LAMBDA_BUCKET=$(terraform output -raw s3_lambda_bucket_name 2>/dev/null || echo "")
WEBSITE_BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
LAMBDA_FUNCTION=$(terraform output -raw lambda_function_name 2>/dev/null || echo "")
cd ..

if [ -z "$WEBSITE_BUCKET" ]; then
    echo "Error: Terraform outputs not found. Run 'terraform apply' first."
    exit 1
fi

# Deploy Lambda
echo "Deploying Lambda to S3..."
aws s3 cp aws-lambda/api-health/build/libs/api-health-all.jar \
    "s3://$LAMBDA_BUCKET/api-health/api-health-all.jar"

echo "Updating Lambda function..."
aws lambda update-function-code \
    --function-name "$LAMBDA_FUNCTION" \
    --s3-bucket "$LAMBDA_BUCKET" \
    --s3-key api-health/api-health-all.jar \
    --no-cli-pager

# Deploy site
echo "Deploying site to S3..."
aws s3 sync site/dist/ "s3://$WEBSITE_BUCKET" --delete

# Invalidate CloudFront
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" --no-cli-pager

echo ""
echo "=== Deployment complete! ==="
echo "Website: https://shamikmishra.com"
echo "API: https://api.shamikmishra.com/health"
