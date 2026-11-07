#!/usr/bin/env bash
# Install the Frame Studio renderer dependency into a task-local runtime directory.
# Usage: bash setup.sh <runtime-dir>
set -euo pipefail
RT="${1:?usage: setup.sh <runtime-dir>}"
mkdir -p "$RT"
command -v node >/dev/null || { echo "node not found (need Node 18+)" >&2; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg not found on PATH" >&2; exit 1; }
if [ ! -d "$RT/node_modules/playwright-core" ]; then
  npm install --prefix "$RT" --no-audit --no-fund --ignore-scripts playwright-core@1 >/dev/null
fi
echo "runtime ready: $RT"
echo "use: STUDIO_RUNTIME=$RT node <skill>/scripts/render.mjs <mode> <index.html> ..."
