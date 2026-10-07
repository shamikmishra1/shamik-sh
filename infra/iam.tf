resource "aws_iam_policy" "lambda_permissions_boundary" {
  name        = "${local.name_prefix}-lambda-permissions-boundary"
  description = "Maximum permissions for the ${local.function_name} Lambda role"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "WriteLambdaLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${local.function_name}:*"
      },
      {
        Sid    = "ReadApplicationSecrets"
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue"]
        Resource = [
          data.aws_secretsmanager_secret.api_secrets.arn,
          data.aws_secretsmanager_secret.hardcover_token.arn
        ]
      },
      {
        Sid    = "UseAnalyticsTable"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem"
        ]
        Resource = [
          aws_dynamodb_table.analytics.arn,
          "${aws_dynamodb_table.analytics.arn}/index/*"
        ]
      },
      {
        Sid      = "DecryptAnalyticsTable"
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = aws_kms_key.data.arn
        Condition = {
          StringEquals = {
            "kms:CallerAccount"                            = data.aws_caller_identity.current.account_id
            "kms:ViaService"                               = "dynamodb.${var.aws_region}.amazonaws.com"
            "kms:EncryptionContext:aws:dynamodb:tableName" = aws_dynamodb_table.analytics.name
          }
        }
      },
      {
        Sid      = "ReadCostExplorerData"
        Effect   = "Allow"
        Action   = ["ce:GetCostAndUsage", "ce:GetCostForecast"]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role" "lambda_role" {
  name                 = "${var.domain_name}-lambda-role"
  permissions_boundary = aws_iam_policy.lambda_permissions_boundary.arn

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Condition = {
        StringEquals = { "aws:SourceAccount" = data.aws_caller_identity.current.account_id }
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_secrets" {
  name = "${var.domain_name}-lambda-secrets"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["secretsmanager:GetSecretValue"]
      Resource = [
        data.aws_secretsmanager_secret.api_secrets.arn,
        data.aws_secretsmanager_secret.hardcover_token.arn
      ]
    }]
  })
}

resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.domain_name}-lambda-dynamodb"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem"
        ]
        Resource = [
          aws_dynamodb_table.analytics.arn,
          "${aws_dynamodb_table.analytics.arn}/index/*"
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = aws_kms_key.data.arn
        Condition = {
          StringEquals = {
            "kms:CallerAccount"                            = data.aws_caller_identity.current.account_id
            "kms:ViaService"                               = "dynamodb.${var.aws_region}.amazonaws.com"
            "kms:EncryptionContext:aws:dynamodb:tableName" = aws_dynamodb_table.analytics.name
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_costexplorer" {
  name = "${var.domain_name}-lambda-costexplorer"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ce:GetCostAndUsage", "ce:GetCostForecast"]
      Resource = "*"
    }]
  })
}
