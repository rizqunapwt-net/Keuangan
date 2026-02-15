#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd)"

KEEP_REPORTS="${KEEP_REPORTS:-3}"
KEEP_BACKUPS="${KEEP_BACKUPS:-3}"
DRY_RUN="${DRY_RUN:-0}"

REPORT_DIR="${ROOT_DIR}/reports/automation"
BACKUP_DIR="${ROOT_DIR}/erp/backups/db"
AUTOMATION_DB="${ROOT_DIR}/erp/database/automation.sqlite"

remove_old_entries() {
  local dir="$1"
  local keep="$2"
  local mode="$3"

  [[ -d "$dir" ]] || return 0

  local count remove
  count="$(ls -1 "$dir" | wc -l | tr -d ' ')"
  if [[ "$count" -le "$keep" ]]; then
    return 0
  fi

  remove=$((count-keep))
  ls -1 "$dir" | sort | head -n "$remove" | while IFS= read -r entry; do
    [[ -n "$entry" ]] || continue
    if [[ "$mode" == "dir" ]]; then
      if [[ "$DRY_RUN" == "1" ]]; then
        echo "[DRY] rm -rf $dir/$entry"
      else
        rm -rf "$dir/$entry"
        echo "[DEL] $dir/$entry"
      fi
    else
      if [[ "$DRY_RUN" == "1" ]]; then
        echo "[DRY] rm -f $dir/$entry"
      else
        rm -f "$dir/$entry"
        echo "[DEL] $dir/$entry"
      fi
    fi
  done
}

echo "Auto cleaning..."
echo "- KEEP_REPORTS=$KEEP_REPORTS"
echo "- KEEP_BACKUPS=$KEEP_BACKUPS"
echo "- DRY_RUN=$DRY_RUN"

remove_old_entries "$REPORT_DIR" "$KEEP_REPORTS" "dir"
remove_old_entries "$BACKUP_DIR" "$KEEP_BACKUPS" "file"

if [[ "$DRY_RUN" == "1" ]]; then
  if [[ -f "$AUTOMATION_DB" ]]; then
    echo "[DRY] rm -f $AUTOMATION_DB"
  fi
else
  rm -f "$AUTOMATION_DB"
fi

echo "Done."
