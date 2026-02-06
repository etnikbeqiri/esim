FROM php:8.5-fpm-alpine

# Install required packages
RUN apk add --no-cache \
    nginx \
    supervisor \
    git \
    zip \
    unzip \
    nodejs \
    npm \
    mariadb-client \
    mariadb-connector-c \
    mariadb-connector-c-dev \
    postgresql-client \
    postgresql-dev \
    freetype \
    freetype-dev \
    libjpeg-turbo \
    libjpeg-turbo-dev \
    libpng \
    libpng-dev \
    libwebp \
    libwebp-dev \
    libzip-dev

# Create directories used by supervisor
RUN mkdir -p /var/log/supervisor \
    && mkdir -p /etc/supervisor/conf.d

# Configure and install PHP extensions
RUN docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg \
    --with-webp

RUN docker-php-ext-install -j$(nproc) pdo_mysql pdo_pgsql pgsql
RUN docker-php-ext-install -j$(nproc) gd
RUN docker-php-ext-install -j$(nproc) zip

# Enable opcache (built-in with PHP 8.5)
RUN docker-php-ext-enable opcache || true

# Clean up dev dependencies
RUN apk del --no-cache \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libwebp-dev \
    postgresql-dev

# Copy config files
COPY docker/php/production.ini /usr/local/etc/php/conf.d/production.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy the cron job file
COPY docker/cron/laravel-cron /etc/cron.d/laravel-cron

# Copy entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Set permissions for the cron job file and entrypoint
RUN chmod 0644 /etc/cron.d/laravel-cron && \
    crontab /etc/cron.d/laravel-cron && \
    chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /var/www/html

# Create storage directories with correct ownership BEFORE copying files
RUN mkdir -p storage/logs storage/app/public storage/app/backup storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data /var/www/html

# ============================================
# LAYER 1: Composer dependencies (cached if composer.json/lock unchanged)
# ============================================
COPY --chown=www-data:www-data composer.json composer.lock ./
RUN COMPOSE_BAKE=true composer install --optimize-autoloader --no-interaction --no-scripts

# ============================================
# LAYER 2: NPM dependencies (cached if package.json/lock unchanged)
# ============================================
COPY --chown=www-data:www-data package.json package-lock.json ./
RUN npm ci

# ============================================
# LAYER 3: Application code (changes most frequently)
# ============================================
COPY --chown=www-data:www-data . .

# Run composer scripts that need the full codebase
RUN composer dump-autoload --optimize

COPY --chown=www-data:www-data .env .env

RUN npm run build:ssr

# Create storage link
RUN php artisan storage:link

# Ensure storage and cache directories have correct permissions
RUN chmod -R 775 storage bootstrap/cache \
    && touch storage/logs/laravel.log \
    && chmod 664 storage/logs/laravel.log

EXPOSE 80

# Run entrypoint which caches config then starts Supervisor
CMD ["/usr/local/bin/entrypoint.sh"]
