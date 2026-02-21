FROM composer:2.8 AS composer

WORKDIR /app
COPY composer.json composer.lock ./
RUN COMPOSE_BAKE=true composer install \
    --optimize-autoloader \
    --no-interaction \
    --no-scripts \
    --no-dev \
    --ignore-platform-reqs

COPY . .
RUN composer dump-autoload --optimize

FROM alpine:edge AS node

# PHP needed for Wayfinder vite plugin (php artisan wayfinder:generate)
RUN apk add --no-cache \
    nodejs npm \
    php85 php85-tokenizer php85-mbstring php85-openssl php85-phar \
    php85-session php85-xml php85-dom php85-xmlwriter php85-ctype \
    php85-fileinfo php85-curl php85-iconv php85-pdo php85-pdo_sqlite \
    && ln -sf /usr/bin/php85 /usr/bin/php

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
COPY --from=composer /app/vendor ./vendor

RUN npm run build:ssr

FROM alpine:edge AS final

LABEL org.opencontainers.image.title="esim-backend" \
      org.opencontainers.image.vendor="esim" \
      org.opencontainers.image.licenses="Proprietary"

RUN apk add --no-cache \
    php85-fpm php85-pdo_mysql php85-gd php85-zip php85-pcntl \
    php85-pecl-redis php85-session php85-tokenizer \
    php85-mbstring php85-openssl php85-phar php85-dom php85-xml \
    php85-xmlwriter php85-ctype php85-fileinfo php85-curl \
    php85-iconv php85-bcmath php85-pdo php85-simplexml \
    nginx supervisor nodejs \
    curl util-linux-misc \
    && ln -sf /usr/bin/php85 /usr/bin/php \
    && ln -sf /usr/sbin/php-fpm85 /usr/sbin/php-fpm \
    && rm -rf /sbin/apk /usr/share/apk /etc/apk /lib/apk /var/cache/apk \
    && rm -rf /usr/share/doc /usr/share/man /usr/share/info /usr/share/licenses \
              /usr/share/i18n /usr/share/locale /usr/share/terminfo \
              /usr/share/misc /usr/share/X11 \
    && rm -rf /etc/init.d /etc/conf.d /etc/runlevels /etc/logrotate.d \
              /etc/periodic /etc/crontabs /etc/network /etc/modprobe.d \
              /etc/modules-load.d /etc/sysctl.d /etc/udhcpd.conf \
    && rm -f /usr/bin/wget /usr/bin/nc /usr/bin/telnet /usr/bin/ftp \
             /usr/bin/ftpget /usr/bin/ftpput /usr/sbin/sendmail \
             /usr/bin/traceroute /usr/bin/nslookup \
    && rm -rf /usr/lib/node_modules /usr/bin/npm /usr/bin/npx \
    && rm -rf /tmp/* /var/tmp/* /var/cache/* \
    && chmod 1733 /tmp

RUN mkdir -p /var/log/supervisor /etc/supervisor/conf.d \
    /var/log/nginx /var/lib/nginx/tmp /run/nginx

COPY docker/php/production.ini /etc/php85/conf.d/99-production.ini
COPY docker/php/www.conf       /etc/php85/php-fpm.d/www.conf
COPY docker/nginx/nginx.conf   /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf   /etc/supervisor/conf.d/supervisord.conf

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /var/www/html

RUN mkdir -p storage/logs storage/app/public storage/app/backup \
    storage/framework/cache storage/framework/sessions storage/framework/views \
    bootstrap/cache

COPY --chown=nobody:nobody --from=composer /app/vendor ./vendor
COPY --chown=nobody:nobody --from=node /app/public/build ./public/build
COPY --chown=nobody:nobody --from=node /app/bootstrap/ssr ./bootstrap/ssr
COPY --chown=nobody:nobody . .

RUN rm -f .env

RUN chmod -R 775 storage bootstrap/cache \
    && touch storage/logs/laravel.log \
    && chmod 664 storage/logs/laravel.log

RUN chmod 444 /etc/nginx/nginx.conf \
              /etc/nginx/http.d/default.conf \
              /etc/php85/conf.d/99-production.ini \
              /etc/php85/php-fpm.d/www.conf \
              /etc/supervisor/conf.d/supervisord.conf \
    && find / -xdev -perm /6000 -type f -exec chmod a-s {} + 2>/dev/null || true

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD if [ "${CONTAINER_ROLE}" = "app" ]; then curl -sf http://localhost/up; elif [ "${CONTAINER_ROLE}" = "horizon" ]; then php /var/www/html/artisan horizon:status; else pgrep -f "schedule:work" > /dev/null; fi

CMD ["/bin/sh", "/usr/local/bin/entrypoint.sh"]
