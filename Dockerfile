# ============================================
# Stage 1: Composer dependencies
# ============================================
FROM composer:latest AS composer

WORKDIR /app
COPY composer.json composer.lock ./
RUN COMPOSE_BAKE=true composer install --optimize-autoloader --no-interaction --no-scripts --no-dev --ignore-platform-reqs

# Copy full source so post-autoload-dump scripts work
COPY . .
RUN composer dump-autoload --optimize

# ============================================
# Stage 2: Node build (SSR + Vite assets)
# ============================================
FROM alpine:3.21 AS node

# PHP + Node needed for Wayfinder vite plugin (runs php artisan wayfinder:generate)
RUN apk add --no-cache \
    nodejs npm \
    php84 php84-tokenizer php84-mbstring php84-openssl php84-phar \
    php84-session php84-xml php84-dom php84-xmlwriter php84-ctype \
    php84-fileinfo php84-curl php84-iconv \
    && ln -sf /usr/bin/php84 /usr/bin/php

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and composer deps (needed for artisan to boot)
COPY . .
COPY --from=composer /app/vendor ./vendor

RUN npm run build:ssr

# ============================================
# Stage 3: Runtime
# ============================================
FROM alpine:3.21

# Install PHP-FPM + all extensions as pre-compiled packages (no compilation needed)
RUN apk add --no-cache \
    php84-fpm php84-pdo_mysql php84-gd php84-zip php84-pcntl \
    php84-redis php84-opcache php84-session php84-tokenizer \
    php84-mbstring php84-openssl php84-phar php84-dom php84-xml \
    php84-xmlwriter php84-ctype php84-fileinfo php84-curl \
    php84-iconv php84-bcmath php84-pdo php84-simplexml \
    nginx supervisor curl nodejs npm \
    && ln -sf /usr/bin/php84 /usr/bin/php \
    && ln -sf /usr/sbin/php-fpm84 /usr/sbin/php-fpm

# Create directories used by supervisor
RUN mkdir -p /var/log/supervisor /etc/supervisor/conf.d

# Copy config files
COPY docker/php/production.ini /etc/php84/conf.d/99-production.ini
COPY docker/php/www.conf /etc/php84/php-fpm.d/www.conf
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /var/www/html

# Create storage directories with correct ownership
RUN mkdir -p storage/logs storage/app/public storage/app/backup \
    storage/framework/cache storage/framework/sessions storage/framework/views \
    bootstrap/cache

# Copy composer dependencies from stage 1
COPY --from=composer /app/vendor ./vendor

# Copy built assets from stage 2
COPY --from=node /app/public/build ./public/build
COPY --from=node /app/bootstrap/ssr ./bootstrap/ssr

# Copy application code
COPY --chown=nobody:nobody . .

# Remove any .env that slipped through (will be provided via Docker secrets)
RUN rm -f .env

# Create storage link
RUN php artisan storage:link 2>/dev/null || true

# Ensure correct permissions
RUN chmod -R 775 storage bootstrap/cache \
    && touch storage/logs/laravel.log \
    && chmod 664 storage/logs/laravel.log \
    && chown -R nobody:nobody /var/www/html

EXPOSE 80

CMD ["/usr/local/bin/entrypoint.sh"]
