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
FROM alpine:edge AS node

# PHP + Node needed for Wayfinder vite plugin (runs php artisan wayfinder:generate)
RUN apk add --no-cache \
    nodejs npm \
    php85 php85-tokenizer php85-mbstring php85-openssl php85-phar \
    php85-session php85-xml php85-dom php85-xmlwriter php85-ctype \
    php85-fileinfo php85-curl php85-iconv php85-pdo php85-pdo_sqlite \
    && ln -sf /usr/bin/php85 /usr/bin/php

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
FROM alpine:edge

# Install PHP-FPM + all extensions as pre-compiled packages (no compilation needed)
RUN apk add --no-cache \
    php85-fpm php85-pdo_mysql php85-gd php85-zip php85-pcntl \
    php85-pecl-redis php85-session php85-tokenizer \
    php85-mbstring php85-openssl php85-phar php85-dom php85-xml \
    php85-xmlwriter php85-ctype php85-fileinfo php85-curl \
    php85-iconv php85-bcmath php85-pdo php85-simplexml \
    nginx supervisor curl nodejs npm \
    && ln -sf /usr/bin/php85 /usr/bin/php \
    && ln -sf /usr/sbin/php-fpm85 /usr/sbin/php-fpm

# Create directories used by supervisor
RUN mkdir -p /var/log/supervisor /etc/supervisor/conf.d

# Copy config files
COPY docker/php/production.ini /etc/php85/conf.d/99-production.ini
COPY docker/php/www.conf /etc/php85/php-fpm.d/www.conf
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
