#!/bin/sh
set -e

echo "Running Laravel optimizations..."

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "Running database migrations..."
php artisan migrate --force --no-interaction

echo "Starting supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
