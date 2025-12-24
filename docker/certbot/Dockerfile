FROM certbot/dns-digitalocean:v5.2.2

COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY certbot-cron /etc/crontabs/root

ENTRYPOINT [ "/docker-entrypoint.sh" ]
