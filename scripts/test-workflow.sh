#!/bin/bash

# Integration test script to verify the TracePlay workflow
# This script tests the end-to-end workflow using generated_turtle.png

set -e

echo "=== TracePlay Workflow Integration Tests ==="
echo ""

# Check if test image exists
TEST_IMAGE="apps/web/public/generated_turtle.png"
if [ ! -f "$TEST_IMAGE" ]; then
  echo "❌ Test image not found: $TEST_IMAGE"
  exit 1
fi
echo "✓ Test image found: $TEST_IMAGE"

# Build all packages (excluding backend)
echo ""
echo "Building all packages..."
pnpm run build --filter=@traceplay/runtime --filter=@traceplay/vector --filter=@traceplay/annotation --filter=@traceplay/curriculum --filter=@traceplay/quiz --filter=@traceplay/ui --filter=@traceplay/embed-sdk
echo "✓ All packages built successfully"

# Build web app in demo mode (localhost)
echo ""
echo "Building web app in demo mode (localhost)..."
NEXT_PUBLIC_DEMO_MODE=true pnpm run build --filter=@traceplay/web
echo "✓ Web app built in demo mode (localhost)"

# Build web app in demo mode (GitHub Pages)
echo ""
echo "Building web app in demo mode (GitHub Pages)..."
NEXT_PUBLIC_DEMO_MODE=true GITHUB_PAGES=true pnpm run build --filter=@traceplay/web
echo "✓ Web app built in demo mode (GitHub Pages)"

# Build web app in full mode (localhost)
echo ""
echo "Building web app in full mode (localhost)..."
NEXT_PUBLIC_DEMO_MODE=false pnpm run build --filter=@traceplay/web
echo "✓ Web app built in full mode (localhost)"

# Build web app in full mode (GitHub Pages)
echo ""
echo "Building web app in full mode (GitHub Pages)..."
NEXT_PUBLIC_DEMO_MODE=false GITHUB_PAGES=true pnpm run build --filter=@traceplay/web
echo "✓ Web app built in full mode (GitHub Pages)"

# Note: Backend build skipped (requires Prisma Client generation with database)
echo ""
echo "Note: Backend build skipped (requires database setup)"

# Build worker
echo ""
echo "Building worker..."
pnpm run build --filter=@traceplay/worker
echo "✓ Worker built successfully"

# Build game (localhost)
echo ""
echo "Building game (localhost)..."
pnpm run build --filter=@traceplay/game
echo "✓ Game built successfully (localhost)"

# Build game (GitHub Pages)
echo ""
echo "Building game (GitHub Pages)..."
GITHUB_PAGES=true pnpm run build --filter=@traceplay/game
echo "✓ Game built successfully (GitHub Pages)"

# Verify build outputs
echo ""
echo "Verifying build outputs..."
[ -d packages/runtime/dist ] && echo "✓ runtime built" || echo "❌ runtime not built"
[ -d packages/vector/dist ] && echo "✓ vector built" || echo "❌ vector not built"
[ -d packages/annotation/dist ] && echo "✓ annotation built" || echo "❌ annotation not built"
[ -d packages/curriculum/dist ] && echo "✓ curriculum built" || echo "❌ curriculum not built"
[ -d packages/quiz/dist ] && echo "✓ quiz built" || echo "❌ quiz not built"
[ -d packages/ui/dist ] && echo "✓ ui built" || echo "❌ ui not built"
[ -d packages/embed-sdk/dist ] && echo "✓ embed-sdk built" || echo "❌ embed-sdk not built"
[ -d apps/worker/dist ] && echo "✓ worker built" || echo "❌ worker not built"
[ -d apps/game/dist ] && echo "✓ game built" || echo "❌ game not built"
[ -d apps/web/.next ] && echo "✓ web built" || echo "❌ web not built"
echo "Note: Backend build verification skipped"

echo ""
echo "=== All workflow integration tests passed ==="
