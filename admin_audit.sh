#!/bin/bash
set -e

BASE_URL="http://localhost:3000"

echo "Step 6: Admin Access Audit"
echo "Authenticating as Admin..."
ADMIN_DATA=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"adminpass"}')
ADMIN_TOKEN=$(echo $ADMIN_DATA | jq -r '.token')

echo "Generating Payroll (Admin permission check)..."
PAYROLL_RES=$(curl -s -X POST $BASE_URL/api/payrolls/generate \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"month":2, "year":2026}')

if echo "$PAYROLL_RES" | grep -q "\"success\":true"; then
  echo "✅ SUCCESS: Admin Payroll generation working."
  echo "Result: $(echo $PAYROLL_RES | jq -r '.message')"
else
  echo "❌ FAILED: Admin could not generate payroll. Response: $PAYROLL_RES"
fi
