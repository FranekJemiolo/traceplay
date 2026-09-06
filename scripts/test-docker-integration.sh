#!/usr/bin/env bash
set -e

echo "=== TracePlay Docker & PostgreSQL Integration Test Suite ==="
echo ""

# 1. Start PostgreSQL with Docker Compose
echo "1. Attempting to start PostgreSQL via docker compose..."
if command -v docker &>/dev/null && docker compose version &>/dev/null; then
  docker compose up -d postgres 2>/dev/null || true
fi

# 2. Wait for PostgreSQL to accept connections
echo "2. Checking PostgreSQL database connection..."
MAX_RETRIES=15
RETRY_COUNT=0
DB_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if pg_isready -h localhost -p 5432 &>/dev/null || nc -z localhost 5432 &>/dev/null; then
    DB_READY=true
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  sleep 1
done

if [ "$DB_READY" = false ]; then
  echo "❌ Error: Could not connect to PostgreSQL on port 5432."
  exit 1
fi
echo "✓ PostgreSQL is ready and accepting connections."

# 3. Determine database connection URL
# Try Docker user 'traceplay' first, fall back to current system user
TEST_DB_URL="postgresql://traceplay:traceplay@localhost:5432/traceplay"
if ! psql "$TEST_DB_URL" -c '\q' &>/dev/null; then
  CURRENT_USER=$(whoami)
  TEST_DB_URL="postgresql://${CURRENT_USER}@localhost:5432/traceplay"
  createdb -h localhost -p 5432 traceplay 2>/dev/null || true
fi

echo "✓ Using Database Target: $TEST_DB_URL"
echo ""

# 4. Synchronize Prisma Schema with PostgreSQL
echo "3. Synchronizing Prisma schema to PostgreSQL database..."
DATABASE_URL="$TEST_DB_URL" pnpm prisma db push --accept-data-loss --skip-generate
echo "✓ Database schema synchronized."
echo ""

# 5. Run Classroom Integration Tests
echo "4. Executing Classroom & Live Student View Integration Tests..."
DATABASE_URL="$TEST_DB_URL" pnpm --filter @traceplay/backend test:integration
echo ""

echo "=== All Docker & PostgreSQL Integration Tests Passed Successfully! ==="
