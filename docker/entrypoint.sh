#!/bin/sh
set -e

CONTAINER_ROLE=${CONTAINER_ROLE:-app}

echo "Starting container with role: $CONTAINER_ROLE"

# Load .env from Docker secret if mounted
if [ -f /run/secrets/backend_secret_env ]; then
    cp /run/secrets/backend_secret_env /var/www/html/.env
    chown www-data:www-data /var/www/html/.env
    echo "Loaded .env from Docker secret"
fi

# Cache config for all roles
echo "Caching Laravel configuration..."
php artisan config:cache || true

case "$CONTAINER_ROLE" in
    app)
        echo "Running Laravel optimizations..."
        php artisan route:cache || echo "Route cache skipped"
        php artisan view:cache || true
        php artisan event:cache || true

        echo "Running database migrations (with lock to prevent race condition)..."
        flock -n /tmp/migrate.lock php artisan migrate --force --no-interaction || echo "Migration skipped (another replica is running it)"

        echo "Starting supervisor (nginx + php-fpm + ssr)..."
        exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
        ;;

    horizon)
        echo "Starting Laravel Horizon..."
        exec php artisan horizon
        ;;

    scheduler)
        echo "Running scheduled tasks..."
        exec php artisan schedule:run
        ;;

    *)
        echo "Unknown CONTAINER_ROLE: $CONTAINER_ROLE"
        exit 1
        ;;
esac
