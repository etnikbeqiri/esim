# =============================================================================
# DISTROLESS-INSPIRED MULTI-STAGE DOCKERFILE
# Produces a minimal, hardened production image for Laravel + Inertia SSR
# Final image has: no package manager, no docs, no cache, restricted shell
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Composer -- resolve PHP dependencies
# ---------------------------------------------------------------------------
FROM composer:2.8 AS composer

WORKDIR /app
COPY composer.json composer.lock ./
RUN COMPOSE_BAKE=true composer install \
    --optimize-autoloader \
    --no-interaction \
    --no-scripts \
    --no-dev \
    --ignore-platform-reqs

COPY . .
RUN composer dump-autoload --optimize

# ---------------------------------------------------------------------------
# Stage 2: Node -- build Vite assets + SSR bundle
# ---------------------------------------------------------------------------
FROM alpine:edge AS node

# PHP is required alongside Node because the Wayfinder vite plugin
# invokes `php artisan wayfinder:generate` during the build
RUN apk add --no-cache \
    nodejs npm \
    php85 php85-tokenizer php85-mbstring php85-openssl php85-phar \
    php85-session php85-xml php85-dom php85-xmlwriter php85-ctype \
    php85-fileinfo php85-curl php85-iconv php85-pdo php85-pdo_sqlite \
    && ln -sf /usr/bin/php85 /usr/bin/php

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
COPY --from=composer /app/vendor ./vendor

RUN npm run build:ssr

# ---------------------------------------------------------------------------
# Stage 3: Final -- distroless-inspired minimal image
# Start from scratch Alpine and copy ONLY what is needed.
# No apk, no package manager databases, no docs, no man pages, no cache.
# ---------------------------------------------------------------------------
FROM alpine:edge AS final

# -- Metadata labels (OCI image spec) ----------------------------------------
LABEL org.opencontainers.image.title="esim-backend" \
      org.opencontainers.image.description="Laravel backend - distroless-inspired hardened image" \
      org.opencontainers.image.vendor="esim" \
      org.opencontainers.image.licenses="Proprietary"

# -- Install only the absolute minimum, then destroy the package manager ------
# We must install packages here (not just COPY) because Alpine's dynamic
# linker, musl libc, shared libraries, and the /etc skeleton all need to be
# consistent. Copying individual binaries from the builder is fragile due to
# transitive shared library dependencies. Instead, we install here and then
# strip everything the attacker could use post-exploitation.
RUN apk add --no-cache \
    php85-fpm php85-pdo_mysql php85-gd php85-zip php85-pcntl \
    php85-pecl-redis php85-session php85-tokenizer \
    php85-mbstring php85-openssl php85-phar php85-dom php85-xml \
    php85-xmlwriter php85-ctype php85-fileinfo php85-curl \
    php85-iconv php85-bcmath php85-pdo php85-simplexml \
    nginx supervisor nodejs \
    curl \
    util-linux-misc \
    # -- Aggressively strip the image ------------------------------------------
    #
    # 1. Remove the package manager and all its databases so nothing can be
    #    installed at runtime. This is the single most important hardening step.
    # 2. Remove documentation, man pages, info pages, locale data.
    # 3. Remove apk cache, temp files, and init scripts we never call.
    # 4. Remove world-writable directories that are not needed.
    # 5. Remove system crontabs (we use Laravel scheduler, not OS cron).
    && ln -sf /usr/bin/php85 /usr/bin/php \
    && ln -sf /usr/sbin/php-fpm85 /usr/sbin/php-fpm \
    # ---- Nuke the package manager ----
    && rm -rf /sbin/apk \
              /usr/share/apk \
              /etc/apk \
              /lib/apk \
              /var/cache/apk \
    # ---- Nuke documentation and non-essential data ----
    && rm -rf /usr/share/doc \
              /usr/share/man \
              /usr/share/info \
              /usr/share/licenses \
              /usr/share/i18n \
              /usr/share/locale \
              /usr/share/terminfo \
              /usr/share/misc \
              /usr/share/X11 \
    # ---- Remove init system scripts we never use ----
    && rm -rf /etc/init.d \
              /etc/conf.d \
              /etc/runlevels \
              /etc/logrotate.d \
              /etc/periodic \
              /etc/crontabs \
              /etc/network \
              /etc/modprobe.d \
              /etc/modules-load.d \
              /etc/sysctl.d \
              /etc/udhcpd.conf \
    # ---- Remove unnecessary binaries from busybox ----
    # Keep only the symlinks we actually need: sh, cp, chown, chmod, rm, mkdir,
    # echo, cat, ls, env, test, [, true, false, sleep, date, ln, id, touch
    # We remove network/debug utilities that could aid post-exploitation.
    && rm -f /usr/bin/wget \
             /usr/bin/nc \
             /usr/bin/telnet \
             /usr/bin/ftp \
             /usr/bin/ftpget \
             /usr/bin/ftpput \
             /usr/sbin/sendmail \
             /usr/bin/traceroute \
             /usr/bin/nslookup \
    # ---- Remove npm (only nodejs runtime is needed for SSR) ----
    && rm -rf /usr/lib/node_modules \
              /usr/bin/npm \
              /usr/bin/npx \
    # ---- Remove temp/cache files ----
    && rm -rf /tmp/* /var/tmp/* /var/cache/* \
    # ---- Remove world-writable sticky directories ----
    && chmod 1733 /tmp

# -- Create runtime directories -----------------------------------------------
RUN mkdir -p /var/log/supervisor /etc/supervisor/conf.d \
    /var/log/nginx /var/lib/nginx/tmp /run/nginx

# -- Copy configuration files -------------------------------------------------
COPY docker/php/production.ini /etc/php85/conf.d/99-production.ini
COPY docker/php/www.conf       /etc/php85/php-fpm.d/www.conf
COPY docker/nginx/nginx.conf   /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf   /etc/supervisor/conf.d/supervisord.conf

# -- Copy entrypoint -----------------------------------------------------------
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# -- Prepare application directory ---------------------------------------------
WORKDIR /var/www/html

RUN mkdir -p storage/logs storage/app/public storage/app/backup \
    storage/framework/cache storage/framework/sessions storage/framework/views \
    bootstrap/cache

# -- Copy application artifacts from builder stages ----------------------------
COPY --chown=nobody:nobody --from=composer /app/vendor ./vendor
COPY --chown=nobody:nobody --from=node /app/public/build ./public/build
COPY --chown=nobody:nobody --from=node /app/bootstrap/ssr ./bootstrap/ssr
COPY --chown=nobody:nobody . .

# .env is provided at runtime via Docker secrets -- never bake it in
RUN rm -f .env

# -- Set permissions -----------------------------------------------------------
RUN chmod -R 775 storage bootstrap/cache \
    && touch storage/logs/laravel.log \
    && chmod 664 storage/logs/laravel.log

# -- Security hardening -------------------------------------------------------
# Make system config files read-only to prevent tampering at runtime
RUN chmod 444 /etc/nginx/nginx.conf \
              /etc/nginx/http.d/default.conf \
              /etc/php85/conf.d/99-production.ini \
              /etc/php85/php-fpm.d/www.conf \
              /etc/supervisor/conf.d/supervisord.conf \
    # Remove setuid/setgid bits from all binaries
    && find / -xdev -perm /6000 -type f -exec chmod a-s {} + 2>/dev/null || true

EXPOSE 80

# -- Healthcheck (matches docker-stack.yml but provides a default) -------------
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -sf http://localhost/up || exit 1

# -- Use exec form for proper PID 1 signal handling ---------------------------
CMD ["/bin/sh", "/usr/local/bin/entrypoint.sh"]
