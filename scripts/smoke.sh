#!/usr/bin/env bash
# Simple smoke tests for local backend
BASE=${BASE:-http://localhost:8080}

echo "Checking health..."
curl -sS "$BASE/api/health" | jq || true

echo
# Example publish (requires JWT and POST_ID)
if [[ -n "$POST_ID" && -n "$JWT" ]]; then
  echo "Publishing post $POST_ID..."
  curl -sS -X POST "$BASE/api/posts/$POST_ID/publish" -H "Authorization: Bearer $JWT" -H "Content-Type: application/json" | jq || true
else
  echo "Skipping publish test — set POST_ID and JWT environment variables to run it"
fi
