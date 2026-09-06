#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "================================================================"
echo "       TracePlay Educational Platform - FULL DEPLOYMENT         "
echo "================================================================"
echo ""
echo "🌟 Starting Full Platform with PostgreSQL Database & Backend API:"
echo "  • Activity Studio: Image to Coloring & Dots Outline Converter"
echo "  • Tracing Game: Audio feedback, real cat/turtle guides, dot tracker"
echo "  • Live Classroom: Real-time PostgreSQL session synchronization"
echo "  • Student View: Live attendee roster and stroke tracking"
echo "  • NestJS REST API & WebSockets on port 3000"
echo "  • Next.js Frontend on port 3001"
echo ""

# 1. Start PostgreSQL
echo "1. Checking PostgreSQL database..."
if command -v docker &>/dev/null && docker compose version &>/dev/null; then
  echo "Attempting to start PostgreSQL container via Docker Compose..."
  docker compose up -d postgres 2>/dev/null || true
fi

# 2. Wait for database
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
  echo "Please start PostgreSQL or Docker Compose and try again."
  exit 1
fi
echo "✓ PostgreSQL is active on port 5432."

# Determine database connection URL
TEST_DB_URL="postgresql://traceplay:traceplay@localhost:5432/traceplay"
if ! psql "$TEST_DB_URL" -c '\q' &>/dev/null; then
  CURRENT_USER=$(whoami)
  TEST_DB_URL="postgresql://${CURRENT_USER}@localhost:5432/traceplay"
  createdb -h localhost -p 5432 traceplay 2>/dev/null || true
fi
export DATABASE_URL="$TEST_DB_URL"
echo "✓ Database Connection: $DATABASE_URL"
echo ""

# 3. Synchronize Schema & Seed Database
echo "2. Synchronizing database schema and seeding sample classroom data..."
pnpm prisma db push --accept-data-loss --skip-generate
npx tsx prisma/seed.ts
echo ""

# 4. Process Cleanup on Exit
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  echo "Stopping TracePlay services..."
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 5. Start Backend API on Port 3000
echo "3. Starting NestJS Backend API on http://localhost:3000/api..."
cd "$DIR/apps/backend"
PORT=3000 pnpm start &
BACKEND_PID=$!
cd "$DIR"

# Wait for backend to be available
echo "Waiting for Backend API to become ready..."
for i in {1..20}; do
  if curl -s http://localhost:3000/api/classroom/sessions >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
echo "✓ Backend API is ready."
echo ""

# 6. Start Frontend on Port 3001
echo "4. Starting Next.js Web App on http://localhost:3001..."
cd "$DIR/apps/web"
NEXT_PUBLIC_DEMO_MODE=false NEXT_PUBLIC_API_URL=http://localhost:3000 npx next dev -p 3001 &
FRONTEND_PID=$!
cd "$DIR"

echo ""
echo "================================================================"
echo "🎉 TracePlay is LIVE in Full Deployment Mode!"
echo "  • Web Application:  http://localhost:3001"
echo "  • Backend API:      http://localhost:3000/api"
echo "  • Live Classroom:   Room code TRACE-101 (Seeded in PostgreSQL)"
echo "================================================================"
echo "Press Ctrl+C to stop all servers."
echo ""

wait
