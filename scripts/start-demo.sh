#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "================================================================"
echo "           TracePlay Studio - DEMO / PREVIEW MODE               "
echo "================================================================"
echo ""
echo "🚀 Starting in Zero-Database Demo Mode..."
echo "  • Activity Studio: Photo to Coloring Book & Connect-The-Dots"
echo "  • Tracing Game: Interactive Web Audio, neon guide lines & dots"
echo "  • Worksheets: Printable classroom worksheets"
echo "  • URL State: Automatic state persistence & sharing via URL"
echo "  • Database Features: Excluded (zero database/docker required)"
echo ""

PORT="${PORT:-3000}"
export NEXT_PUBLIC_DEMO_MODE=true

echo "Starting Next.js Frontend on http://localhost:${PORT}..."
echo "Press Ctrl+C to stop."
echo ""

cd "$DIR/apps/web"
npx next dev -p "$PORT"
