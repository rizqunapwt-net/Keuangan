#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ADMIN_DIR="$ROOT_DIR/admin-panel"
DEST_DIR="$ROOT_DIR/public/admin"

if [ ! -f "$ADMIN_DIR/package.json" ]; then
  echo "ERROR: admin-panel/package.json not found." >&2
  exit 1
fi

echo "📦 Installing dependencies..."
cd "$ADMIN_DIR"
npm install --silent

echo "🔨 Building admin dashboard..."
npm run build

echo "📁 Copying build to public/admin/..."
rm -rf "$DEST_DIR"
cp -r "$ADMIN_DIR/dist" "$DEST_DIR"

echo "✅ Admin dashboard built → public/admin/"
echo "   Files: $(find "$DEST_DIR" -type f | wc -l | tr -d ' ')"
