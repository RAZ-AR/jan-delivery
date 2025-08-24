#!/usr/bin/env bash
set -euo pipefail

# Set Telegram webhook to your Render backend URL
# Usage:
#   BOT_TOKEN=123:ABC BACKEND_URL=https://your-backend.onrender.com ./scripts/set-telegram-webhook.sh

if [[ -z "${BOT_TOKEN:-}" || -z "${BACKEND_URL:-}" ]]; then
  echo "Usage: BOT_TOKEN=... BACKEND_URL=... $0" >&2
  exit 1
fi

URL="https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${BACKEND_URL%/}/webhook"
echo "Setting webhook: $URL"
curl -sS "$URL"
echo

