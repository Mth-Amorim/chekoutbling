#!/bin/sh
set -eu

envsubst '${INTERNAL_DNS_DOMAIN} ${INTERNAL_APP_IP} ${UPSTREAM_DNS}' \
  < /templates/dnsmasq.conf.template \
  > /etc/dnsmasq.conf

envsubst '${PROXY_SERVER_NAME} ${PROXY_UPSTREAM_HOST} ${PROXY_UPSTREAM_PORT}' \
  < /templates/nginx.conf.template \
  > /etc/nginx/http.d/default.conf

dnsmasq --keep-in-foreground &

exec nginx -g 'daemon off;'