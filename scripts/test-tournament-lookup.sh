#!/bin/bash

# Test script to look up tournaments in database
# Uses environment variables for Supabase credentials

# Load from .env.local if exists
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Use VITE_ prefixed variables (same as React app)
SUPABASE_URL="${VITE_SUPABASE_URL:-https://xnvtfzakgdkqkzfvsswq.supabase.co}"
ANON_KEY="${VITE_SUPABASE_ANON_KEY}"

if [ -z "$ANON_KEY" ]; then
  echo "Warning: VITE_SUPABASE_ANON_KEY not set, using fallback"
  ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudnRmemFrZ2RrcWt6ZnZzc3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMjYxOTgsImV4cCI6MjA3NzYwMjE5OH0.gDPvGVl23-SPf_wtTTb3kpaMamipKtuT6Ed5MOfeov8"
fi

SEARCH="${1:-Dream}"
echo "Looking up tournaments with '$SEARCH' in name..."

curl -s "${SUPABASE_URL}/rest/v1/games?select=id,name,date,location,external_url" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" | jq ".[] | select(.name | test(\"$SEARCH\"; \"i\"))"
