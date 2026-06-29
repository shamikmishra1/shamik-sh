output "s3_bucket_name" {
  description = "Name of the S3 bucket for website"
  value       = aws_s3_bucket.website.id
}

output "s3_lambda_bucket_name" {
  description = "Name of the S3 bucket for Lambda code"
  value       = aws_s3_bucket.lambda_code.id
}

output "s3_admin_bucket_name" {
  description = "Name of the S3 bucket for admin site"
  value       = aws_s3_bucket.admin.id
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_admin_distribution_id" {
  description = "ID of the admin CloudFront distribution"
  value       = aws_cloudfront_distribution.admin.id
}

output "website_url" {
  description = "URL of the website"
  value       = "https://${var.domain_name}"
}

output "admin_url" {
  description = "URL of the admin site"
  value       = "https://admin.${var.domain_name}"
}

output "api_url" {
  description = "URL of the API"
  value       = "https://api.${var.domain_name}"
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.api.function_name
}

output "secrets_arn" {
  description = "ARN of the secrets"
  value       = data.aws_secretsmanager_secret.api_secrets.arn
}

output "analytics_table_name" {
  description = "Name of the DynamoDB analytics table"
  value       = aws_dynamodb_table.analytics.name
}
