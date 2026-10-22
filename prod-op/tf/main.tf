locals {
  blue_enabled  = true
  green_enabled = false
}

resource "digitalocean_project" "this" {
  name        = "aguasoft"
  environment = "production"
  resources   = concat([for d in digitalocean_droplet.this : d.urn])
}

locals {
  instances = {
    blue = {
      enabled   = true
      user_data = file("${path.module}/user_data/user_data.001.sh")
    }
    green = {
      enabled   = false
      user_data = file("${path.module}/user_data/user_data.001.sh")
    }
  }
  point_dns_to = "blue"
}

resource "digitalocean_droplet" "this" {
  for_each = { for k, v in local.instances : k => v if v.enabled }

  name      = "aguasoft"
  region    = "nyc1"
  size      = "s-1vcpu-512mb-10gb"
  image     = "debian-13-x64"
  ssh_keys  = [2440806]
  user_data = each.value.user_data
}

data "digitalocean_domain" "this" {
  name = "agualaif.com"
}

resource "digitalocean_record" "this" {
  domain = data.digitalocean_domain.this.id
  name   = "pos"
  type   = "A"
  value  = digitalocean_droplet.this[local.point_dns_to].ipv4_address
  ttl    = 60 # TODO: Higher TTL when the setup is a bit more proven
}

output "ssh_command" {
  value = "ssh root@${digitalocean_droplet.this[local.point_dns_to].ipv4_address}"
}

output "ssh_config" {
  value = <<-EOT
  Host agua
  	HostName ${digitalocean_droplet.this[local.point_dns_to].ipv4_address}
  	User root
  	IdentityFile ~/.ssh/id_rsa
  EOT
}
