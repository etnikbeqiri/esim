#!/bin/sh
set -e

echo "Running Laravel optimizations..."

php artisan config:cache || true
php artisan route:cache || echo "Route cache skipped"
php artisan view:cache || true
php artisan event:cache || true

echo "Running database migrations..."
php artisan migrate --force --no-interaction

echo "Starting supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
