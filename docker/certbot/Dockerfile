FROM alpine:3.14

RUN apk add --no-cache certbot certbot-nginx nginx

COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY certbot-cron /etc/crontabs/root

ENTRYPOINT [ "/docker-entrypoint.sh" ]
