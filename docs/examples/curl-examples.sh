#!/usr/bin/env bash
# Refund API cURL examples
set -euo pipefail

BASE_URL="${REFUND_API_BASE_URL:-http://localhost:3000}"
COOKIE_JAR="${TMPDIR:-/tmp}/refund-cookies.txt"

echo "=== Cookie login ==="
curl -s -c "$COOKIE_JAR" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${REFUND_API_EMAIL:-admin@example.com}\",\"password\":\"${REFUND_API_PASSWORD:-change-me}\"}"

echo -e "\n\n=== Freedom calculate (cookie) ==="
curl -s -b "$COOKIE_JAR" -X POST "$BASE_URL/api/calculate/freedom" \
  -H "Content-Type: application/json" \
  -d '{
    "startMileage": 101520,
    "endMileage": 204145,
    "contractTermMiles": 5000,
    "contractTermDays": 1095,
    "startDate": "2024-06-25",
    "endDate": "2025-10-29",
    "cost": 1928,
    "markup": 1050,
    "deductible": 50,
    "approvedClaimAmount": 0,
    "unlimitedMileage": false
  }' | head -c 500

if [ -n "${REFUND_API_KEY:-}" ]; then
  echo -e "\n\n=== Freedom calculate (API key) ==="
  curl -s -X POST "$BASE_URL/api/calculate/freedom" \
    -H "Authorization: Bearer $REFUND_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contractTermDays": 1095,
      "startDate": "2024-06-25",
      "endDate": "2025-10-29",
      "cost": 1928,
      "markup": 1050,
      "deductible": 50,
      "approvedClaimAmount": 0,
      "unlimitedMileage": true
    }' | head -c 500
fi

echo ""