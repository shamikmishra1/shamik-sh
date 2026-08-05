variable "domain_name" {
  description = "The domain name for the website"
  type        = string
  default     = "shamikmishra.com"

  validation {
    condition     = can(regex("^[a-z0-9.-]+\\.[a-z]{2,}$", var.domain_name))
    error_message = "Must be a valid domain name (e.g., example.com)."
  }
}

variable "hosted_zone_id" {
  description = "The Route 53 hosted zone ID for the domain"
  type        = string

  validation {
    condition     = can(regex("^Z[A-Z0-9]+$", var.hosted_zone_id))
    error_message = "Must be a valid Route 53 hosted zone ID (starts with Z)."
  }
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-north-1"

  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9]$", var.aws_region))
    error_message = "Must be a valid AWS region (e.g., eu-north-1)."
  }
}
