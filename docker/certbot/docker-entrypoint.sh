#!/bin/sh

register() {
  certbot run --test-cert -n \
    --agree-tos \
    -d agua.kevinpena.com \
    --email kevin.pena.prog@gmail.com \
    --nginx
}

register_if_required() {
  [ ! -d /etc/letsencrypt/live ] && register
}

register_if_required && crond -f
