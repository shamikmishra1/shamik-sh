variable "domain_name" {
  description = "The domain name for the website"
  type        = string
  default     = "shamikmishra.com"
}

variable "hosted_zone_id" {
  description = "The Route 53 hosted zone ID for the domain"
  type        = string
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-north-1"
}
