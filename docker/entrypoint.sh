#!/bin/sh
set -eu
umask 027

CONTAINER_ROLE="${CONTAINER_ROLE:-app}"

log() { printf '[entrypoint] %s\n' "$1"; }

log "Starting container with role: ${CONTAINER_ROLE}"

if [ -f /run/secrets/backend_secret_env ]; then
    cp /run/secrets/backend_secret_env /var/www/html/.env
    chown nobody:nobody /var/www/html/.env
    chmod 440 /var/www/html/.env
    log "Loaded .env from Docker secret"
fi

php artisan config:cache || true

case "${CONTAINER_ROLE}" in
    app)
        php artisan route:cache || true
        php artisan view:cache  || true
        php artisan event:cache || true
        php artisan storage:link 2>/dev/null || true

        flock -n /tmp/migrate.lock php artisan migrate --force --no-interaction \
            || log "Migration skipped (another replica is running it)"

        log "Starting supervisor..."
        exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
        ;;

    horizon)
        log "Starting Horizon..."
        exec php artisan horizon
        ;;

    scheduler)
        log "Starting scheduler..."
        exec php artisan schedule:work
        ;;

    *)
        log "ERROR: Unknown CONTAINER_ROLE: ${CONTAINER_ROLE}"
        exit 1
        ;;
esac
