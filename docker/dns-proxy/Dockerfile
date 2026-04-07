FROM alpine:3.20

RUN apk add --no-cache nginx dnsmasq gettext

COPY docker/dns-proxy/start.sh /start.sh
COPY docker/dns-proxy/dnsmasq.conf.template /templates/dnsmasq.conf.template
COPY docker/dns-proxy/nginx.conf.template /templates/nginx.conf.template

RUN chmod +x /start.sh

EXPOSE 80 53/tcp 53/udp

CMD ["/start.sh"]