#!/bin/sh
# =============================================================================
# Container entrypoint -- routes to the correct role (app/horizon/scheduler)
# Designed for the distroless-inspired stripped Alpine runtime.
# Shell: /bin/sh (busybox) -- no bashisms allowed.
# =============================================================================
set -eu

# Restrictive umask: files 640, directories 750
umask 027

CONTAINER_ROLE="${CONTAINER_ROLE:-app}"

log() {
    printf '[entrypoint] %s\n' "$1"
}

log "Starting container with role: ${CONTAINER_ROLE}"

# ---------------------------------------------------------------------------
# Load .env from Docker secret if mounted (Swarm)
# ---------------------------------------------------------------------------
if [ -f /run/secrets/backend_secret_env ]; then
    cp /run/secrets/backend_secret_env /var/www/html/.env
    chown nobody:nobody /var/www/html/.env
    chmod 440 /var/www/html/.env
    log "Loaded .env from Docker secret"
fi

# ---------------------------------------------------------------------------
# Cache Laravel config (all roles benefit from this)
# ---------------------------------------------------------------------------
log "Caching Laravel configuration..."
php artisan config:cache || true

# ---------------------------------------------------------------------------
# Role-based startup
# ---------------------------------------------------------------------------
case "${CONTAINER_ROLE}" in
    app)
        log "Running Laravel optimizations..."
        php artisan route:cache || log "Route cache skipped"
        php artisan view:cache  || true
        php artisan event:cache || true
        php artisan storage:link 2>/dev/null || true

        log "Running database migrations (with lock to prevent race condition)..."
        flock -n /tmp/migrate.lock php artisan migrate --force --no-interaction \
            || log "Migration skipped (another replica is running it)"

        log "Starting supervisor (nginx + php-fpm + ssr)..."
        exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
        ;;

    horizon)
        log "Starting Laravel Horizon..."
        exec php artisan horizon
        ;;

    scheduler)
        log "Starting scheduler daemon..."
        exec php artisan schedule:work
        ;;

    *)
        log "ERROR: Unknown CONTAINER_ROLE: ${CONTAINER_ROLE}"
        exit 1
        ;;
esac
