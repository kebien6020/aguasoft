variable "do_token" {
  type        = string
  description = "Digital Ocean Token, intended to go in creds.auto.tfvars"
}

terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}
