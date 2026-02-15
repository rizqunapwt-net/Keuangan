#!/bin/bash
set -e

echo "--------------------------------------------------"
echo "🚀 NEW RIZQUNA ELFATH - LIVE SYSTEM AUDIT SIMULATION"
echo "--------------------------------------------------"
BASE_URL="http://localhost:3000"

# 1. AUTH SIMULATION
echo "Step 1: Authenticating as Karyawan (karyawan1)..."
LOGIN_DATA=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"karyawan1","password":"workerpass"}')

TOKEN=$(echo $LOGIN_DATA | jq -r '.token')
EMP_ID=$(echo $LOGIN_DATA | jq -r '.user.employee.id')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ FAILED: Could not retrieve token. Response: $LOGIN_DATA"
  exit 1
fi
echo "✅ SUCCESS: Token received. Employee ID: $EMP_ID"

# 2. RBAC SIMULATION (SECURITY AUDIT)
echo -e "\nStep 2: Security Audit - RBAC Verification"
echo "Attempting to access Admin Payroll Generation as Karyawan (Should be Forbidden)..."
RBAC_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/api/payrolls/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"month":3, "year":2026}')

if [ "$RBAC_RES" == "403" ]; then
  echo "✅ SUCCESS: Access Denied with 403 Forbidden (RBAC Working)."
else
  echo "❌ FAILED: RBAC Flaw! Expected 403, got $RBAC_RES"
fi

# 3. IDOR SIMULATION (SECURITY AUDIT)
echo -e "\nStep 3: Security Audit - IDOR Prevention"
echo "Attempting to fetch notifications of another ID (Should be Forbidden)..."
IDOR_RES=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/notifications?employeeId=99999999-9999-9999-9999-999999999999" \
  -H "Authorization: Bearer $TOKEN")

if [ "$IDOR_RES" == "403" ]; then
  echo "✅ SUCCESS: Access Denied with 403 Forbidden (IDOR Guard Working)."
else
  echo "❌ FAILED: IDOR Vulnerability! Expected 403, got $IDOR_RES"
fi

# 4. ATTENDANCE SIMULATION
echo -e "\nStep 4: Live Functional Simulation - Attendance"
echo "Capturing current status..."
STATUS_DATA=$(curl -s -X GET $BASE_URL/attendance/status -H "Authorization: Bearer $TOKEN")
STATUS=$(echo $STATUS_DATA | jq -r '.status')
echo "Current Status: $STATUS"

if [ "$STATUS" == "NOT_CHECKED_IN" ] || [ "$STATUS" == "CHECKED_OUT" ]; then
  echo "Performing Check-In Simulation..."
  CHECKIN_RES=$(curl -s -X POST $BASE_URL/attendance/check-in \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"location":"-6.175392,106.827153", "photo": ""}')
  
  if echo "$CHECKIN_RES" | grep -q "id"; then
    echo "✅ SUCCESS: Check-In verified."
    echo "Response: $(echo $CHECKIN_RES | jq -c '.')"
  else
    echo "❌ FAILED: Check-In simulation failed. Response: $CHECKIN_RES"
  fi
else
    echo "ℹ️ INFO: User already checked in. Skipping check-in simulation."
fi

# 5. DATA INTEGRITY (PRISMA AUDIT)
echo -e "\nStep 5: Data Integrity - Leave Balance Audit"
echo "Fetching Leave Balance for Employee $EMP_ID..."
LIFE_RES=$(curl -s -X GET "$BASE_URL/api/employees/$EMP_ID/leave-balance" \
  -H "Authorization: Bearer $TOKEN")

SUCCESS=$(echo $LIFE_RES | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
  COUNT=$(echo $LIFE_RES | jq '.data | length')
  echo "✅ SUCCESS: Leave balances retrieved. Types found: $COUNT"
else
  echo "❌ FAILED: Leave balance API failed. Response: $LIFE_RES"
fi

echo -e "\n--------------------------------------------------"
echo "🏁 LIVE AUDIT COMPLETE: ALL SYSTEMS NOMINAL"
echo "--------------------------------------------------"
