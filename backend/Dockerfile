# Dockerfile for Symfony 7 with FrankenPHP
FROM dunglas/frankenphp:1-php8.3

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    libpq-dev \
    && docker-php-ext-install zip pdo pdo_pgsql

# Set working directory
WORKDIR /app

# Copy composer files and install dependencies
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader

# Copy the rest of the application
COPY . .

# Finalize composer installation
RUN composer dump-autoload --optimize && composer run-script post-install-cmd

# Expose port
EXPOSE 80

# Run FrankenPHP
CMD ["frankenphp", "run-server", "--config", "/app/Caddyfile"]
