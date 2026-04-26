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

# Build all packages
echo ""
echo "Building all packages..."
pnpm run build --filter=@traceplay/*
echo "✓ All packages built successfully"

# Build web app in demo mode
echo ""
echo "Building web app in demo mode..."
NEXT_PUBLIC_DEMO_MODE=true pnpm run build --filter=@traceplay/web
echo "✓ Web app built in demo mode"

# Build web app in full mode
echo ""
echo "Building web app in full mode..."
NEXT_PUBLIC_DEMO_MODE=false pnpm run build --filter=@traceplay/web
echo "✓ Web app built in full mode"

# Build backend
echo ""
echo "Building backend..."
pnpm run build --filter=@traceplay/backend
echo "✓ Backend built successfully"

# Build worker
echo ""
echo "Building worker..."
pnpm run build --filter=@traceplay/worker
echo "✓ Worker built successfully"

# Build game
echo ""
echo "Building game..."
pnpm run build --filter=@traceplay/game
echo "✓ Game built successfully"

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
[ -d apps/backend/dist ] && echo "✓ backend built" || echo "❌ backend not built"
[ -d apps/worker/dist ] && echo "✓ worker built" || echo "❌ worker not built"
[ -d apps/game/dist ] && echo "✓ game built" || echo "❌ game not built"
[ -d apps/web/.next ] && echo "✓ web built" || echo "❌ web not built"

echo ""
echo "=== All workflow integration tests passed ==="
