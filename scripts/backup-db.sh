#!/bin/bash
#
# Local Database Backup Script
#
# Creates a timestamped pg_dump of the production database.
# Backups are saved to ~/backups/tne-website/ by default.
#
# Usage:
#   ./scripts/backup-db.sh              # Backs up production (main branch)
#   ./scripts/backup-db.sh --dev        # Backs up dev branch instead
#
# Prerequisites:
#   - PostgreSQL client (pg_dump): brew install libpq && brew link --force libpq
#   - .env file with DATABASE_URL and NEON_PRODUCTION_ENDPOINT

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$HOME/backups/tne-website"
TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)

# Load .env (parse key=value manually to handle unquoted special chars like &)
if [ -f "$PROJECT_DIR/.env" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and blank lines
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    # Extract key and value
    key="${line%%=*}"
    value="${line#*=}"
    export "$key=$value"
  done < "$PROJECT_DIR/.env"
fi

# Determine which database to back up
if [ "${1:-}" = "--dev" ]; then
  # Use whatever DATABASE_URL is in .env (should be dev branch)
  DB_URL="$DATABASE_URL"
  LABEL="dev"
  echo "Backing up DEV branch database..."
else
  # For production, swap to the production endpoint
  PROD_ENDPOINT="${NEON_PRODUCTION_ENDPOINT:-}"
  if [ -z "$PROD_ENDPOINT" ]; then
    echo "Error: NEON_PRODUCTION_ENDPOINT is not set in .env"
    echo "Cannot determine production connection string."
    exit 1
  fi
  # Replace the dev endpoint in DATABASE_URL with the production endpoint
  # Extract the dev endpoint from the current URL and swap it
  DB_URL=$(echo "$DATABASE_URL" | sed "s/ep-[a-z0-9-]*-pooler/$(echo "$PROD_ENDPOINT" | sed 's/$/-pooler/')/")
  LABEL="production"
  echo "Backing up PRODUCTION database..."
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

FILENAME="tne-${LABEL}-${TIMESTAMP}.dump"
FILEPATH="$BACKUP_DIR/$FILENAME"

echo "Output: $FILEPATH"
echo ""

# Run pg_dump
pg_dump "$DB_URL" \
  --format=custom \
  --no-owner \
  --no-acl \
  --verbose \
  -f "$FILEPATH" 2>&1

SIZE=$(du -h "$FILEPATH" | cut -f1)
echo ""
echo "Backup complete: $FILEPATH ($SIZE)"
echo ""

# Clean up backups older than 30 days
DELETED=$(find "$BACKUP_DIR" -name "tne-*.dump" -mtime +30 -print -delete | wc -l | tr -d ' ')
if [ "$DELETED" -gt 0 ]; then
  echo "Cleaned up $DELETED backup(s) older than 30 days."
fi

# Show recent backups
echo "Recent backups:"
ls -lh "$BACKUP_DIR"/tne-*.dump 2>/dev/null | tail -5
