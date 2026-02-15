#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "ERROR: docker compose is required." >&2
  exit 1
fi

ensure_env() {
  if [[ ! -f ".env" ]]; then
    cp .env.example .env
  fi

  # If using SQLite locally, keep the DB file present to avoid confusion.
  if grep -q '^DB_CONNECTION=sqlite$' .env 2>/dev/null; then
    mkdir -p database
    touch database/database.sqlite
  fi
}

wait_for_postgres() {
  # Best-effort wait (docker compose `depends_on` doesn't wait for readiness).
  local i
  for i in {1..30}; do
    if "${COMPOSE[@]}" exec -T db pg_isready -U postgres -d rizquna_erp >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "WARN: postgres not ready after 30s; continuing anyway." >&2
}

bootstrap() {
  ensure_env
  "${COMPOSE[@]}" up -d --build
  wait_for_postgres

  "${COMPOSE[@]}" exec -T app composer install --prefer-dist --no-interaction --no-progress

  if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
    "${COMPOSE[@]}" exec -T app php artisan key:generate
  fi

  "${COMPOSE[@]}" exec -T app php artisan migrate --seed --force
  "${COMPOSE[@]}" exec -T app php artisan storage:link >/dev/null 2>&1 || true
}

case "${1:-}" in
  up)
    bootstrap
    echo "Ready:"
    echo "- App: http://localhost:8000"
    echo "- MinIO Console: http://localhost:9011"
    ;;
  bootstrap)
    bootstrap
    ;;
  down)
    "${COMPOSE[@]}" down
    ;;
  restart)
    "${COMPOSE[@]}" down
    bootstrap
    ;;
  status)
    "${COMPOSE[@]}" ps
    ;;
  logs)
    shift || true
    "${COMPOSE[@]}" logs -f --tail=200 "$@"
    ;;
  artisan)
    shift || true
    ensure_env
    "${COMPOSE[@]}" exec -T app php artisan "$@"
    ;;
  test)
    ensure_env
    "${COMPOSE[@]}" up -d --build
    "${COMPOSE[@]}" exec -T app composer install --prefer-dist --no-interaction --no-progress
    "${COMPOSE[@]}" exec -T app php artisan test
    ;;
  psql)
    ensure_env
    "${COMPOSE[@]}" exec -T db psql -U postgres -d rizquna_erp
    ;;
  *)
    cat <<'USAGE'
Usage: ./scripts/dev.sh <command>

Commands:
  up         Build+start containers, install deps, migrate+seed (one-command local run)
  down       Stop containers
  restart    Down + up
  status     Show container status
  logs       Tail logs (optional: pass service name)
  artisan    Run artisan in app container (args passthrough)
  test       Run test suite in container (uses .env.testing when present)
  psql       Open psql in db container
USAGE
    exit 1
    ;;
esac
