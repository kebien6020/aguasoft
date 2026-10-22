#!/bin/sh
set -x

DOMAINS="pos.agualaif.com agua.kevinpena.com"

register() {
	DOMAIN="$1"
	certbot certonly -n \
		--agree-tos \
		--email kevin.pena.prog@gmail.com \
		--dns-digitalocean \
		--dns-digitalocean-credentials /run/secrets/digitalocean_credentials \
		-d "$DOMAIN"
}

register_if_required() {
	for DOMAIN in $DOMAINS; do
		if [ ! -d /etc/letsencrypt/live/"$DOMAIN" ]; then
			register "$DOMAIN"
		fi
	done
}

register_if_required && crond -f
