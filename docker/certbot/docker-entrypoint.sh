#!/bin/sh
set -x

register() {
  certbot certonly -n \
    --agree-tos \
    --email kevin.pena.prog@gmail.com \
    --dns-digitalocean \
    --dns-digitalocean-credentials /run/secrets/digitalocean_credentials \
    -d agua.kevinpena.com
}

register_if_required() {
  if [ ! -d /etc/letsencrypt/live ]; then
    register
  fi
}

register_if_required && crond -f
