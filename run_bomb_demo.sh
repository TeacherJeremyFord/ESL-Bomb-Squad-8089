#!/usr/bin/env bash
# Serve web/ (the Working Version build) on the Tailscale IP only — not reachable off-tailnet.
set -euo pipefail
cd "$(dirname "$0")"
TS_IP="$(tailscale ip -4 | head -n1)"
PORT="${PORT:-8090}"
echo "Starting ESL Bomb Squad on http://${TS_IP}:${PORT}/ (tailnet-only)"
exec python3 tools/serve_nocache.py "$PORT" "$TS_IP" web
