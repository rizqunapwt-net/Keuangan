FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    bash \
    curl \
    git \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    unzip \
    zip

RUN docker-php-ext-install pdo pdo_pgsql

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

CMD ["php-fpm"]
