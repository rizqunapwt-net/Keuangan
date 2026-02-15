#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./scripts/verify_backup_restore.sh

What it does (Docker only):
  1) Create a DB backup to `erp/backups/db/`
  2) Restore it to a NEW temporary database
  3) Run a sanity query
  4) Drop the temporary database

Safety:
  - Tidak menyentuh database utama kecuali untuk membaca saat backup.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
ERP_DIR="$(cd -- "${SCRIPT_DIR}/.." >/dev/null 2>&1 && pwd)"

container="${DB_DOCKER_CONTAINER:-rizquna_db}"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker tidak ditemukan." >&2
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$container"; then
  echo "Container PostgreSQL tidak jalan: ${container}" >&2
  exit 1
fi

db="${DB_DATABASE:-rizquna_erp}"
user="${DB_USERNAME:-postgres}"
ts="$(date +%Y%m%d_%H%M%S)"
tmpdb="restore_test_${ts}"

backup_file="$("${SCRIPT_DIR}/backup_db.sh" --docker --output-dir "${ERP_DIR}/backups/db" | tail -n 1 | awk '{print $2}')"

if [[ -z "$backup_file" || ! -f "$backup_file" ]]; then
  echo "Gagal membuat backup. File tidak ditemukan." >&2
  exit 1
fi

"${SCRIPT_DIR}/restore_db.sh" --docker --file "$backup_file" --database "$tmpdb"

echo "Sanity check: cek tabel migrations ada dan bisa diquery..."
docker exec -i "$container" psql -U "$user" -d "$tmpdb" -v ON_ERROR_STOP=1 -tAc "SELECT count(*) FROM migrations;" >/dev/null

echo "Cleanup: drop database ${tmpdb}"
docker exec -i "$container" psql -U "$user" -d postgres -v ON_ERROR_STOP=1 -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${tmpdb}' AND pid <> pg_backend_pid();" >/dev/null
docker exec -i "$container" psql -U "$user" -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${tmpdb}\";" >/dev/null

echo "OK: backup+restore verified (backup=${backup_file})"

