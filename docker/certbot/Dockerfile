FROM certbot/dns-digitalocean:v1.17.0

COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY certbot-cron /etc/crontabs/root

ENTRYPOINT [ "/docker-entrypoint.sh" ]
