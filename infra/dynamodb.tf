resource "aws_dynamodb_table" "analytics" {
  name         = "${var.domain_name}-analytics"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  deletion_protection_enabled = true
  tags                        = { Name = "${var.domain_name} Analytics" }
}
