#!/usr/bin/env bash
# Sync local Payload CMS (payload.db + media/) to Mittwald production.
# Preserves .env.production on the server (Matomo, secrets, etc.).
# Clears Next.js cache and rebuilds so media URLs and KI-Kennzeichnungen refresh.
#
# Usage:
#   1. Ensure local payload.db and media/ are up to date
#   2. ./scripts/sync-cms-production.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/mittwald-ssh.sh
source "$ROOT_DIR/scripts/lib/mittwald-ssh.sh"

REMOTE_PATH="${MITTWALD_REMOTE_PATH:-/home/p-jscfah/html/rocketory}"

trap mittwald_cleanup_ssh_wrapper EXIT

if ! mittwald_resolve_ssh_key "$ROOT_DIR" >/dev/null && [[ -z "${MITTWALD_SSH_PASS:-}" ]]; then
  echo "No SSH key found. Set MITTWALD_SSH_KEY or add .deploy-keys/mittwald_ed25519" >&2
  exit 1
fi

SSH_CMD="$(mittwald_build_ssh_cmd "$ROOT_DIR")"
SSH_TARGET="$(mittwald_ssh_target)"

echo "==> Backup production CMS"
bash "$ROOT_DIR/scripts/backup-production.sh"

echo "==> Upload payload.db"
rsync -avz -e "$SSH_CMD" \
  "$ROOT_DIR/payload.db" \
  "${SSH_TARGET}:${REMOTE_PATH}/payload.db"

echo "==> Upload media/"
rsync -avz --delete -e "$SSH_CMD" \
  "$ROOT_DIR/media/" \
  "${SSH_TARGET}:${REMOTE_PATH}/media/"

echo "==> Clear cache, rebuild, restart"
"$SSH_CMD" "$SSH_TARGET" bash -s <<REMOTE
set -euo pipefail
cd $(printf %q "$REMOTE_PATH")
rm -rf .next/cache
npm run build
if command -v mittnitectl >/dev/null 2>&1; then
  mittnitectl job restart node || mittnitectl job start node || true
fi
curl -s -o /dev/null -w "media-api:%{http_code}\n" "http://127.0.0.1:3000/api/media?limit=1" || true
curl -s "http://127.0.0.1:3000/api/ai-images" | head -c 120 || true
echo
REMOTE

echo "==> CMS sync finished. Check https://rocketory.de"
