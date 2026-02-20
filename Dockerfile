# ============================================
# Stage 1: Composer dependencies
# ============================================
FROM composer:latest AS composer

WORKDIR /app
COPY composer.json composer.lock ./
RUN COMPOSE_BAKE=true composer install --optimize-autoloader --no-interaction --no-scripts --no-dev --ignore-platform-req=ext-pcntl

# Copy full source so post-autoload-dump scripts work
COPY . .
RUN composer dump-autoload --optimize

# ============================================
# Stage 2: Node build (SSR + Vite assets)
# ============================================
FROM node:22-alpine AS node

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build:ssr

# ============================================
# Stage 3: Runtime
# ============================================
FROM php:8.5-fpm-alpine

# Install required packages
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    mariadb-client \
    mariadb-connector-c \
    mariadb-connector-c-dev \
    freetype \
    freetype-dev \
    libjpeg-turbo \
    libjpeg-turbo-dev \
    libpng \
    libpng-dev \
    libwebp \
    libwebp-dev \
    libzip-dev \
    nodejs \
    npm \
    linux-headers \
    $PHPIZE_DEPS

# Create directories used by supervisor
RUN mkdir -p /var/log/supervisor /etc/supervisor/conf.d

# Configure and install PHP extensions
RUN docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg \
    --with-webp

RUN docker-php-ext-install -j$(nproc) pdo_mysql gd zip pcntl

# Install phpredis
RUN pecl install redis && docker-php-ext-enable redis

# Enable opcache
RUN docker-php-ext-enable opcache || true

# Clean up dev dependencies
RUN apk del --no-cache \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libwebp-dev \
    linux-headers \
    $PHPIZE_DEPS

# Copy config files
COPY docker/php/production.ini /usr/local/etc/php/conf.d/production.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf
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
COPY --chown=www-data:www-data . .

# Remove any .env that slipped through (will be provided via Docker secrets)
RUN rm -f .env

# Create storage link
RUN php artisan storage:link 2>/dev/null || true

# Ensure correct permissions
RUN chmod -R 775 storage bootstrap/cache \
    && touch storage/logs/laravel.log \
    && chmod 664 storage/logs/laravel.log \
    && chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["/usr/local/bin/entrypoint.sh"]
