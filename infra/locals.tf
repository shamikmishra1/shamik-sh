locals {
  name_prefix      = replace(var.domain_name, ".", "-")
  s3_origin_id     = "S3-${var.domain_name}"
  s3_admin_origin  = "S3-admin-${var.domain_name}"
  api_origin_id    = "API-${var.domain_name}"
  function_name    = "${local.name_prefix}-api"
}

data "aws_caller_identity" "current" {}
