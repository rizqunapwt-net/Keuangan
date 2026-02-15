#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./scripts/backup_db.sh [--docker|--local] [--output-dir <dir>]

Behavior:
  - Mode default: auto (pakai Docker jika container `rizquna_db` sedang jalan).
  - Output default: `erp/backups/db/`.

Env (mode --local):
  - DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD (optional)

Env (mode --docker):
  - DB_DOCKER_CONTAINER (default: rizquna_db)
  - DB_DATABASE (default: rizquna_erp)
  - DB_USERNAME (default: postgres)
EOF
}

MODE="auto"
OUTPUT_DIR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --docker)
      MODE="docker"
      shift
      ;;
    --local)
      MODE="local"
      shift
      ;;
    --output-dir)
      OUTPUT_DIR="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
ERP_DIR="$(cd -- "${SCRIPT_DIR}/.." >/dev/null 2>&1 && pwd)"

DEFAULT_OUTPUT_DIR="${ERP_DIR}/backups/db"
OUTPUT_DIR="${OUTPUT_DIR:-$DEFAULT_OUTPUT_DIR}"

mkdir -p "$OUTPUT_DIR"
umask 077

timestamp="$(date +%Y%m%d_%H%M%S)"

docker_db_running() {
  command -v docker >/dev/null 2>&1 || return 1
  local container="${DB_DOCKER_CONTAINER:-rizquna_db}"
  docker ps --format '{{.Names}}' | grep -qx "$container"
}

if [[ "$MODE" == "auto" ]]; then
  if docker_db_running; then
    MODE="docker"
  else
    MODE="local"
  fi
fi

if [[ "$MODE" == "docker" ]]; then
  container="${DB_DOCKER_CONTAINER:-rizquna_db}"
  db="${DB_DATABASE:-rizquna_erp}"
  user="${DB_USERNAME:-postgres}"

  out="${OUTPUT_DIR}/${db}_${timestamp}.dump"

  echo "Backup DB via Docker container: ${container} (db=${db})"
  docker exec -i "$container" pg_dump -U "$user" -d "$db" -Fc > "$out"
  echo "OK: ${out}"
  exit 0
fi

# Local pg_dump mode
: "${DB_HOST:?DB_HOST wajib di-set untuk mode --local}"
: "${DB_PORT:?DB_PORT wajib di-set untuk mode --local}"
: "${DB_DATABASE:?DB_DATABASE wajib di-set untuk mode --local}"
: "${DB_USERNAME:?DB_USERNAME wajib di-set untuk mode --local}"

out="${OUTPUT_DIR}/${DB_DATABASE}_${timestamp}.dump"

echo "Backup DB via pg_dump (host=${DB_HOST} port=${DB_PORT} db=${DB_DATABASE})"
if [[ -n "${DB_PASSWORD:-}" ]]; then
  export PGPASSWORD="${DB_PASSWORD}"
fi

pg_dump -Fc -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" > "$out"
echo "OK: ${out}"

