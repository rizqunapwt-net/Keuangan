#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd)"
RUN_ID="$(date +%Y%m%d_%H%M%S)"
RUN_DIR="${ROOT_DIR}/reports/automation/${RUN_ID}"
REPORT_FILE="${RUN_DIR}/report.md"
RESULTS_FILE="${RUN_DIR}/results.tsv"

mkdir -p "${RUN_DIR}"
: >"${RESULTS_FILE}"

FAILED_STEPS=()
SKIPPED_STEPS=()

run_step() {
  local key="$1"
  local desc="$2"
  shift 2

  local log_file="${RUN_DIR}/${key}.log"

  printf '[RUN ] %s\n' "$desc"

  set +e
  "$@" >"$log_file" 2>&1
  local rc=$?
  set -e

  if [[ $rc -eq 0 ]]; then
    printf '%s\t%s\t%s\t%s\n' "$key" "PASS" "$desc" "$log_file" >>"${RESULTS_FILE}"
    printf '[PASS] %s\n' "$desc"
  else
    printf '%s\t%s\t%s\t%s\n' "$key" "FAIL" "$desc" "$log_file" >>"${RESULTS_FILE}"
    FAILED_STEPS+=("$key")
    printf '[FAIL] %s (see %s)\n' "$desc" "$log_file"
  fi
}

skip_step() {
  local key="$1"
  local desc="$2"
  local reason="$3"
  local log_file="${RUN_DIR}/${key}.log"
  SKIPPED_STEPS+=("$key")

  printf '%s\n' "$reason" >"$log_file"
  printf '%s\t%s\t%s\t%s\n' "$key" "SKIP" "$desc" "$log_file" >>"${RESULTS_FILE}"
  printf '[SKIP] %s (%s)\n' "$desc" "$reason"
}

run_step "backend_deps" "Ensure backend dependencies" \
  bash -lc "cd '${ROOT_DIR}/backend' && if [[ -d node_modules ]]; then echo 'node_modules exists'; else npm ci --no-audit --no-fund; fi"

run_step "backend_tests" "Run backend tests (Jest)" \
  bash -lc "cd '${ROOT_DIR}/backend' && npm test -- --runInBand"

run_step "frontend_deps" "Ensure frontend dependencies" \
  bash -lc "cd '${ROOT_DIR}/frontend' && if [[ -d node_modules ]]; then echo 'node_modules exists'; else npm ci --legacy-peer-deps --no-audit --no-fund; fi"

run_step "frontend_tests" "Run frontend tests (Vitest)" \
  bash -lc "cd '${ROOT_DIR}/frontend' && npm test"

run_step "erp_env" "Ensure ERP .env exists" \
  bash -lc "cd '${ROOT_DIR}/erp' && if [[ -f .env ]]; then echo '.env exists'; else cp .env.example .env; fi"

run_step "erp_deps" "Ensure ERP dependencies (Composer)" \
  bash -lc "cd '${ROOT_DIR}/erp' && if [[ -f vendor/autoload.php ]]; then echo 'vendor exists'; else composer install --prefer-dist --no-interaction --no-progress; fi"

run_step "erp_tests" "Run ERP tests (Laravel)" \
  bash -lc "cd '${ROOT_DIR}/erp' && php artisan test"

AUTOMATION_DB="${ROOT_DIR}/erp/database/automation.sqlite"
AUDIT_PERIOD="$(date +%Y-%m)"
run_step "erp_audit_flow" "Run ERP audit commands in isolated DB" \
  bash -lc "cd '${ROOT_DIR}/erp' \
    && rm -f '${AUTOMATION_DB}' \
    && touch '${AUTOMATION_DB}' \
    && export APP_ENV=testing \
    && export APP_KEY='base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=' \
    && export DB_CONNECTION=sqlite \
    && export DB_DATABASE='${AUTOMATION_DB}' \
    && export CACHE_STORE=array \
    && export QUEUE_CONNECTION=sync \
    && export SESSION_DRIVER=array \
    && export MAIL_MAILER=array \
    && export FILESYSTEM_DISK=local \
    && php artisan migrate:fresh --seed --force \
    && php artisan contracts:expire \
    && php artisan contracts:notify-expiring \
    && php artisan audit:export '${AUDIT_PERIOD}'"

run_step "erp_audit_file_check" "Verify ERP audit CSV exists" \
  bash -lc "test -s '${ROOT_DIR}/erp/storage/app/private/audit-reports/audit-${AUDIT_PERIOD}.csv' || test -s '${ROOT_DIR}/erp/storage/app/audit-reports/audit-${AUDIT_PERIOD}.csv'"

if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -qx 'rizquna_db'; then
  run_step "erp_backup_restore" "Verify ERP backup+restore (Docker)" \
    bash -lc "cd '${ROOT_DIR}/erp' && ./scripts/verify_backup_restore.sh"
else
  skip_step "erp_backup_restore" "Verify ERP backup+restore (Docker)" "Container rizquna_db not running"
fi

{
  echo "# Full Auto Verification Report"
  echo
  echo "- Run ID: \`${RUN_ID}\`"
  echo "- Timestamp: \`$(date -u +"%Y-%m-%d %H:%M:%S UTC")\`"
  echo "- Repository: \`${ROOT_DIR}\`"
  echo
  echo "## Step Results"
  while IFS=$'\t' read -r key status desc log; do
    echo "- [${status}] ${desc}"
    echo "  - log: \`${log}\`"
  done <"${RESULTS_FILE}"
  echo
  if [[ ${#FAILED_STEPS[@]} -eq 0 ]]; then
    echo "## Final Status"
    echo "PASS"
  else
    echo "## Final Status"
    echo "FAIL"
    echo
    echo "Failed steps:"
    for key in "${FAILED_STEPS[@]}"; do
      echo "- \`${key}\`"
    done
  fi
  if [[ ${#SKIPPED_STEPS[@]} -gt 0 ]]; then
    echo
    echo "Skipped steps:"
    for key in "${SKIPPED_STEPS[@]}"; do
      echo "- \`${key}\`"
    done
  fi
} >"${REPORT_FILE}"

echo
echo "Report: ${REPORT_FILE}"

if [[ ${#FAILED_STEPS[@]} -eq 0 ]]; then
  exit 0
fi

exit 1
