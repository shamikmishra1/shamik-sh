data "aws_secretsmanager_secret" "api_secrets" {
  name = "${var.domain_name}/api"
}

data "aws_secretsmanager_secret" "hardcover_token" {
  name = "shamikmishra/hardcover-token"
}

data "archive_file" "lambda_placeholder" {
  type        = "zip"
  output_path = "${path.module}/placeholder.zip"
  source {
    content  = "placeholder"
    filename = "placeholder.txt"
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${local.function_name}"
  retention_in_days = 7
}

resource "aws_lambda_function" "api" {
  function_name                  = local.function_name
  role                           = aws_iam_role.lambda_role.arn
  handler                        = "com.shamikmishra.api.ApiHandler::handleRequest"
  runtime                        = "java21"
  timeout                        = 30
  memory_size                    = 512
  reserved_concurrent_executions = 10
  filename                       = data.archive_file.lambda_placeholder.output_path
  publish                        = true

  environment {
    variables = {
      SECRETS_ARN     = data.aws_secretsmanager_secret.api_secrets.arn
      ANALYTICS_TABLE = aws_dynamodb_table.analytics.name
    }
  }

  tags       = { Name = "${var.domain_name} API" }
  depends_on = [aws_cloudwatch_log_group.lambda]

  lifecycle {
    ignore_changes = [filename, s3_bucket, s3_key, source_code_hash]
  }
}

resource "aws_lambda_alias" "api_live" {
  name             = "live"
  function_name    = aws_lambda_function.api.function_name
  function_version = aws_lambda_function.api.version
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  qualifier     = aws_lambda_alias.api_live.name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}
