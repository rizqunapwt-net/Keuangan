#!/bin/bash
set -e

echo "Logging in as karyawan1..."
LOGIN_RES=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"karyawan1","password":"workerpass"}')

echo "Login Response: $LOGIN_RES"
TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit 1
fi

echo "Token received: $TOKEN"

echo "Checking status..."
STATUS_RES=$(curl -s -X GET http://localhost:3000/attendance/status \
  -H "Authorization: Bearer $TOKEN")
echo "Initial Status: $STATUS_RES"

if [[ $STATUS_RES == *"CHECKED_OUT"* ]]; then
    # Already checked out, check in again?
    # Backend logic: if checked out, check-out_time is set.
    # Check-in logic: checks if 'existing' record exists for TODAY.
    # If checked-out, 'existing' record exists. So we probably cannot check-in again same day?
    # Let's see attendance.service.js:
    # const existing = await prisma.attendance.findFirst({ ... attendance_date: new Date(attendanceDate) ... })
    # if (existing) throw error 'Already checked in for this date'
    
    # So if we already checked out, we are stuck for the day. That's fine for MVP.
    echo "Already checked out for today. Test complete."
    exit 0
fi

if [[ $STATUS_RES == *"CHECKED_IN"* ]]; then
    echo "User is CHECKED_IN. Attempting Check Out..."
    CHECKOUT_RES=$(curl -s -X POST http://localhost:3000/attendance/check-out \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{"location":"Test Script","photo":""}')
    echo "Checkout Response: $CHECKOUT_RES"
    
     # Status again
    STATUS_RES_Final=$(curl -s -X GET http://localhost:3000/attendance/status \
      -H "Authorization: Bearer $TOKEN")
    echo "Final Status: $STATUS_RES_Final"
    exit 0
fi

echo "User is NOT_CHECKED_IN. Attempting Check In..."
CHECKIN_RES=$(curl -s -X POST http://localhost:3000/attendance/check-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"location":"Test Script","photo":""}')
echo "Checkin Response: $CHECKIN_RES"

# Status again
STATUS_RES_2=$(curl -s -X GET http://localhost:3000/attendance/status \
  -H "Authorization: Bearer $TOKEN")
echo "Post-Checkin Status: $STATUS_RES_2"

echo "Attempting Check Out..."
CHECKOUT_RES=$(curl -s -X POST http://localhost:3000/attendance/check-out \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"location":"Test Script","photo":""}')
echo "Checkout Response: $CHECKOUT_RES"

# Status again
STATUS_RES_3=$(curl -s -X GET http://localhost:3000/attendance/status \
  -H "Authorization: Bearer $TOKEN")
echo "Final Status: $STATUS_RES_3"
