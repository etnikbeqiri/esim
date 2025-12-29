FROM php:8.4-fpm-alpine

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
    --with-webp \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    opcache \
    gd \
    zip \
    && apk del --no-cache \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libwebp-dev

# Copy config files
COPY docker/php/production.ini /usr/local/etc/php/conf.d/production.ini
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy the cron job file
COPY docker/cron/laravel-cron /etc/cron.d/laravel-cron

# Set permissions for the cron job file
RUN chmod 0644 /etc/cron.d/laravel-cron && \
    crontab /etc/cron.d/laravel-cron

WORKDIR /var/www/html

# Copy application code
COPY . .

# Install Composer dependencies
RUN COMPOSE_BAKE=true composer install --optimize-autoloader --no-interaction

# Install frontend dependencies and build assets
RUN npm install && npm run build

# Optimize caches and create storage link
RUN php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan storage:link

# Fix storage permissions
RUN mkdir -p storage/logs \
    && mkdir -p storage/app/backup \
    && touch storage/logs/laravel.log \
    && chown -R www-data:www-data /var/www/html \
    && find storage -type f -exec chmod 666 {} \; \
    && find storage -type d -exec chmod 777 {} \; \
    && chmod -R 777 bootstrap/cache

EXPOSE 80

# Run Supervisor, which starts php-fpm + nginx + dcron
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
