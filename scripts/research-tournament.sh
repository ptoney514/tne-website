#!/bin/bash

# Tournament Research Script (New Places API)
# Usage: ./research-tournament.sh [location]
# Requires: GOOGLE_PLACES_API_KEY environment variable

# Load from .env.local if exists
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Check for API key
if [ -z "$GOOGLE_PLACES_API_KEY" ]; then
  echo "Error: GOOGLE_PLACES_API_KEY not set"
  echo "Set it in .env.local or export GOOGLE_PLACES_API_KEY=your-key"
  exit 1
fi

GOOGLE_API_KEY="$GOOGLE_PLACES_API_KEY"

# Location can be passed as argument
LOCATION="${1:-Council Bluffs, IA}"

echo "=== Tournament Research Agent ==="
echo "Location: $LOCATION"
echo ""

# Step 1: Search for hotels
echo "1. Searching for hotels..."
HOTELS_RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: $GOOGLE_API_KEY" \
  -H "X-Goog-FieldMask: places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber" \
  -d "{
    \"textQuery\": \"hotels near $LOCATION\",
    \"maxResultCount\": 10
  }" \
  "https://places.googleapis.com/v1/places:searchText")

HOTEL_COUNT=$(echo "$HOTELS_RESULT" | jq '.places | length')
echo "   Found: $HOTEL_COUNT hotels"

# Step 2: Search for restaurants
echo "2. Searching for restaurants..."
RESTAURANTS_RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: $GOOGLE_API_KEY" \
  -H "X-Goog-FieldMask: places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri,places.priceLevel" \
  -d "{
    \"textQuery\": \"family friendly restaurants near $LOCATION\",
    \"maxResultCount\": 15
  }" \
  "https://places.googleapis.com/v1/places:searchText")

RESTAURANT_COUNT=$(echo "$RESTAURANTS_RESULT" | jq '.places | length')
echo "   Found: $RESTAURANT_COUNT restaurants"

# Step 3: Search for attractions
echo "3. Searching for attractions..."
ATTRACTIONS_RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: $GOOGLE_API_KEY" \
  -H "X-Goog-FieldMask: places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri" \
  -d "{
    \"textQuery\": \"family attractions and things to do near $LOCATION\",
    \"maxResultCount\": 10
  }" \
  "https://places.googleapis.com/v1/places:searchText")

ATTRACTION_COUNT=$(echo "$ATTRACTIONS_RESULT" | jq '.places | length')
echo "   Found: $ATTRACTION_COUNT attractions"

echo ""
echo "=== Results Summary ==="
echo "Hotels: $HOTEL_COUNT"
echo "Restaurants: $RESTAURANT_COUNT"
echo "Attractions: $ATTRACTION_COUNT"
echo ""

# Output hotels
echo "=== Hotels ==="
echo "$HOTELS_RESULT" | jq -r '.places[] | "- \(.displayName.text) (\(.rating // "N/A") stars)\n  Address: \(.formattedAddress)\n  Phone: \(.nationalPhoneNumber // "N/A")\n  Place ID: \(.id)"'

echo ""
echo "=== Restaurants ==="
echo "$RESTAURANTS_RESULT" | jq -r '.places[] | "- \(.displayName.text) (\(.rating // "N/A") rating)\n  Address: \(.formattedAddress)\n  Price: \(.priceLevel // "N/A")"'

echo ""
echo "=== Attractions ==="
echo "$ATTRACTIONS_RESULT" | jq -r '.places[] | "- \(.displayName.text) (\(.rating // "N/A") rating)\n  Address: \(.formattedAddress)"'
