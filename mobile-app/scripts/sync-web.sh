#!/usr/bin/env bash
# Copies the app's real source files (the same ones GitHub Pages serves)
# into www/ so Capacitor has something to wrap. www/ itself is never
# committed — this script is the single point that keeps the native
# build in sync with the actual app, run before every `cap sync`.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="../"
rm -rf www
mkdir -p www
cp "$ROOT/ScotSwim.dc.html" www/index.html
cp "$ROOT/support.js" www/
cp "$ROOT/image-slot.js" www/
cp "$ROOT/ios-frame.jsx" www/
cp -r "$ROOT/uploads" www/
cp -r "$ROOT/photos" www/
echo "www/ synced from repo root"
