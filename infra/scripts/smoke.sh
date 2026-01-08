#!/bin/bash

BASE_URL="http://localhost:18000/api/v1"
ADMIN_EMAIL="admin@acme.com"
PASSWORD="password123"

echo "1. Checking Health..."
curl -s "$BASE_URL/../health" | grep "ok" && echo " [OK]" || echo " [FAIL]"

echo "2. Login Admin..."
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_EMAIL&password=$PASSWORD" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo " [FAIL] Could not get token"
  exit 1
else
  echo " [OK] Token acquired"
  echo "$TOKEN" > .token
fi

echo "3. List Tickets (Admin)..."
curl -s -X GET "$BASE_URL/tickets?page=1&size=5" \
  -H "Authorization: Bearer $TOKEN" | grep "total" && echo " [OK]" || echo " [FAIL]"

echo "4. Trigger SLA Escalation Job..."
curl -s -X POST "$BASE_URL/admin/jobs/run" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"job": "sla_escalation"}' | grep "executed" && echo " [OK]" || echo " [FAIL]"

echo "Done."
