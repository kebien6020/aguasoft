#!/bin/sh

register() {
  certbot certonly --test-cert -n \
    --agree-tos \
    --email kevin.pena.prog@gmail.com \
    --dns-digitalocean \
    --dns-digitalocean-credentials /run/secrets/digitalocean_credentials \
    -d agua.kevinpena.com
}

register_if_required() {
  [ ! -d /etc/letsencrypt/live ] && register
}

register_if_required && crond -f
