#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./scripts/restore_db.sh --file <backup.dump> [--database <db>] [--force] [--docker|--local]

Defaults:
  - Mode: auto (pakai Docker jika container `rizquna_db` sedang jalan)
  - Jika --database tidak diisi, restore ke database baru: restore_<YYYYMMDD_HHMMSS>

Safety:
  - Jika database target sudah ada, script akan STOP kecuali --force diberikan.
  - --force akan DROP DATABASE target (destruktif) lalu CREATE ulang.

Env (mode --docker):
  - DB_DOCKER_CONTAINER (default: rizquna_db)
  - DB_USERNAME (default: postgres)

Env (mode --local):
  - DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD (optional)
EOF
}

MODE="auto"
FILE=""
TARGET_DB=""
FORCE="0"

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
    --file)
      FILE="${2:-}"
      shift 2
      ;;
    --database)
      TARGET_DB="${2:-}"
      shift 2
      ;;
    --force)
      FORCE="1"
      shift
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

if [[ -z "$FILE" ]]; then
  echo "--file wajib diisi." >&2
  usage >&2
  exit 2
fi

if [[ ! -f "$FILE" ]]; then
  echo "File tidak ditemukan: $FILE" >&2
  exit 2
fi

timestamp="$(date +%Y%m%d_%H%M%S)"
TARGET_DB="${TARGET_DB:-restore_${timestamp}}"

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

db_exists_docker() {
  local container="$1"
  local user="$2"
  local db="$3"
  docker exec -i "$container" psql -U "$user" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${db}'" | tr -d '[:space:]'
}

ensure_db_docker() {
  local container="$1"
  local user="$2"
  local db="$3"
  local exists
  exists="$(db_exists_docker "$container" "$user" "$db")"

  if [[ "$exists" == "1" ]]; then
    if [[ "$FORCE" != "1" ]]; then
      echo "Database target sudah ada: ${db}. Untuk overwrite, jalankan dengan --force." >&2
      exit 1
    fi

    echo "FORCE: drop & recreate database ${db}"
    docker exec -i "$container" psql -U "$user" -d postgres -v ON_ERROR_STOP=1 -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${db}' AND pid <> pg_backend_pid();" >/dev/null
    docker exec -i "$container" psql -U "$user" -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${db}\";" >/dev/null
  fi

  docker exec -i "$container" psql -U "$user" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${db}\";" >/dev/null
}

restore_docker() {
  local container="$1"
  local user="$2"
  local db="$3"
  local file="$4"

  echo "Restore via Docker container: ${container} (db=${db})"
  # pg_restore membaca dari stdin jika tidak ada filename.
  cat "$file" | docker exec -i "$container" pg_restore -U "$user" -d "$db" --no-owner --no-privileges
  echo "OK: restored to database ${db}"
}

if [[ "$MODE" == "docker" ]]; then
  container="${DB_DOCKER_CONTAINER:-rizquna_db}"
  user="${DB_USERNAME:-postgres}"

  ensure_db_docker "$container" "$user" "$TARGET_DB"
  restore_docker "$container" "$user" "$TARGET_DB" "$FILE"
  exit 0
fi

# Local mode (psql/pg_restore on host)
: "${DB_HOST:?DB_HOST wajib di-set untuk mode --local}"
: "${DB_PORT:?DB_PORT wajib di-set untuk mode --local}"
: "${DB_USERNAME:?DB_USERNAME wajib di-set untuk mode --local}"

if [[ -n "${DB_PASSWORD:-}" ]]; then
  export PGPASSWORD="${DB_PASSWORD}"
fi

db_exists_local() {
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${TARGET_DB}'" | tr -d '[:space:]'
}

exists="$(db_exists_local || true)"
if [[ "$exists" == "1" ]]; then
  if [[ "$FORCE" != "1" ]]; then
    echo "Database target sudah ada: ${TARGET_DB}. Untuk overwrite, jalankan dengan --force." >&2
    exit 1
  fi

  echo "FORCE: drop & recreate database ${TARGET_DB}"
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d postgres -v ON_ERROR_STOP=1 -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${TARGET_DB}' AND pid <> pg_backend_pid();" >/dev/null
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${TARGET_DB}\";" >/dev/null
fi

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${TARGET_DB}\";" >/dev/null

echo "Restore via pg_restore (host=${DB_HOST} port=${DB_PORT} db=${TARGET_DB})"
pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$TARGET_DB" --no-owner --no-privileges < "$FILE"
echo "OK: restored to database ${TARGET_DB}"

