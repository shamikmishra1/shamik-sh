output "s3_bucket_name" {
  description = "Name of the S3 bucket for website"
  value       = aws_s3_bucket.website.id
}

output "s3_lambda_bucket_name" {
  description = "Name of the S3 bucket for Lambda code"
  value       = aws_s3_bucket.lambda_code.id
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.id
}

output "website_url" {
  description = "URL of the website"
  value       = "https://${var.domain_name}"
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
