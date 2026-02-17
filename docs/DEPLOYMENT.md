# Deployment Guide: NRE Enterprise (Unified App)

This guide outlines the steps to deploy the unified NRE application (Laravel Backend + Next.js Frontend) to a production environment.

## 1. Prerequisites

- PHP 8.2+
- Node.js 18+ & npm
- Composer
- SQLite (or PostgreSQL/MySQL)
- Web Server (Nginx or Apache)

## 2. Backend Setup (Laravel)

Navigate to the `erp` directory:

```bash
cd erp
composer install --optimize-autoloader --no-dev
cp .env.example .env
```

### Configuration
Update the following variables in your `.env`:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://api.yourdomain.com`
- `FRONTEND_URL=https://yourdomain.com`
- `SANCTUM_STATEFUL_DOMAINS=yourdomain.com`

### Database & Security
```bash
php artisan key:generate --force
touch database/database.sqlite
php artisan migrate --force
```

### Optimization
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 3. Frontend Setup (Next.js)

Navigate to the `frontend` directory:

```bash
cd frontend
npm install
```

### Configuration
Create/Update `.env.production`:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1/hr
```

### Build
```bash
npm run build
```

### Serving
You can use `pm2` to run the Next.js app:
```bash
pm2 start npm --name "nre-frontend" -- start
```

## 4. Web Server Configuration (Nginx Example)

### Frontend (Next.js)
```nginx
server {
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Backend (Laravel API)
```nginx
server {
    server_name api.yourdomain.com;
    root /path/to/NRE/erp/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## 5. Maintenance
To update the application:
1. `git pull`
2. `cd erp && composer install && php artisan migrate --force && php artisan optimize`
3. `cd frontend && npm install && npm run build && pm2 restart nre-frontend`
