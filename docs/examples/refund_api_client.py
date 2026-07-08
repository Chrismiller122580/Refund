#!/usr/bin/env python3
"""Refund API client example using requests."""

import os
import sys

import requests

BASE_URL = os.environ.get("REFUND_API_BASE_URL", "http://localhost:3000")
API_KEY = os.environ.get("REFUND_API_KEY")

if not API_KEY:
    print("Set REFUND_API_KEY (rfnd_...)", file=sys.stderr)
    sys.exit(1)

session = requests.Session()
session.headers.update({
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
})

freedom_inputs = {
    "contractNumber": "FW-12345",
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
    "unlimitedMileage": False,
}

me = session.get(f"{BASE_URL}/api/auth/me").json()
print("Authenticated as:", me["user"]["email"], f"({me['user']['role']})")

calc = session.post(f"{BASE_URL}/api/calculate/freedom", json=freedom_inputs).json()
print("Recommendation:", calc["recommendation"]["message"])
print("Days total:", calc["recommendation"]["daysTotal"])