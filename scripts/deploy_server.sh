#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f ".env" ]]; then
  echo "ERROR: .env not found in ${ROOT_DIR}." >&2
  echo "Create it from .env.example and set production values (DB, APP_URL, APP_KEY, etc.)." >&2
  exit 1
fi

if ! command -v php >/dev/null 2>&1; then
  echo "ERROR: php not found on PATH." >&2
  exit 1
fi

if ! command -v composer >/dev/null 2>&1; then
  echo "ERROR: composer not found on PATH." >&2
  exit 1
fi

composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader

php artisan migrate --force

php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

php artisan storage:link >/dev/null 2>&1 || true

# If Horizon is used under Supervisor/systemd, this forces a graceful restart.
php artisan horizon:terminate >/dev/null 2>&1 || true
php artisan queue:restart >/dev/null 2>&1 || true

echo "Deploy OK"

