#!/usr/bin/env bash
set -euo pipefail

HOST_DASH=${HOST_DASH:-http://localhost:3000}
HOST_API=${HOST_API:-http://localhost:3001}

echo "Checking dashboard health at $HOST_DASH/api/healthz" && curl -fsS "$HOST_DASH/api/healthz" | jq .
echo "Checking API health at $HOST_API/healthz" && curl -fsS "$HOST_API/healthz" | jq .
echo "Checking API metrics at $HOST_API/metrics (first lines)" && curl -fsS "$HOST_API/metrics" | head -n 15
echo "OK"
