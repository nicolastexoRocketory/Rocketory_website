#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${MITTWALD_ENV_FILE:-$ROOT_DIR/../Rocketory Website/.env}"
REMOTE_HOST="${MITTWALD_SSH_HOST:-ssh.lashorst.project.host}"
REMOTE_USER="${MITTWALD_SSH_USER:-nicolas@viralista.de@a-fghqd3}"
REMOTE_PORT="${MITTWALD_SSH_PORT:-22}"
REMOTE_PATH="${MITTWALD_REMOTE_PATH:-/home/p-jscfah/html/rocketory}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://rocketory.de}"
SSH_KEY="${MITTWALD_SSH_KEY:-$ROOT_DIR/../Rocketory Website/.deploy-keys/mittwald_ed25519}"

if [[ -z "${PAYLOAD_SECRET:-}" && -f "$ENV_FILE" ]]; then
  PAYLOAD_SECRET="$(grep '^PAYLOAD_SECRET=' "$ENV_FILE" | cut -d= -f2- || true)"
fi

: "${PAYLOAD_SECRET:?Set PAYLOAD_SECRET or provide MITTWALD_ENV_FILE with PAYLOAD_SECRET}"

SSH_TARGET="${REMOTE_USER}@${REMOTE_HOST}"
RSYNC_SSH="ssh -i \"${SSH_KEY}\" -o IdentitiesOnly=yes -p ${REMOTE_PORT} -o StrictHostKeyChecking=accept-new"

echo "==> Syncing project to ${REMOTE_PATH}"
rsync -avz --delete \
  --filter 'P .env.production' \
  --exclude node_modules \
  --exclude .git \
  --exclude .next \
  --exclude .env \
  --exclude .env.* \
  --exclude .DS_Store \
  --exclude '*.log' \
  -e "$RSYNC_SSH" \
  "$ROOT_DIR/" "${SSH_TARGET}:${REMOTE_PATH}/"

echo "==> Uploading database and media"
rsync -avz -e "$RSYNC_SSH" \
  "$ROOT_DIR/payload.db" \
  "${SSH_TARGET}:${REMOTE_PATH}/payload.db"

if [[ -d "$ROOT_DIR/media" ]]; then
  rsync -avz -e "$RSYNC_SSH" \
    "$ROOT_DIR/media/" \
    "${SSH_TARGET}:${REMOTE_PATH}/media/"
fi

echo "==> Remote install + migrate + build + restart"
ssh -i "$SSH_KEY" -o IdentitiesOnly=yes -p "${REMOTE_PORT}" -o StrictHostKeyChecking=accept-new "${SSH_TARGET}" \
  "PAYLOAD_SECRET=$(printf %q "$PAYLOAD_SECRET") SITE_URL=$(printf %q "$SITE_URL") REMOTE_PATH=$(printf %q "$REMOTE_PATH") bash -s" <<'REMOTE'
set -e
cd "$REMOTE_PATH"
mkdir -p ~/.config/node
cat > .env.production <<ENVEOF
NODE_ENV=production
PORT=3000
DATABASE_URI=file:./payload.db
PAYLOAD_SECRET=${PAYLOAD_SECRET}
NEXT_PUBLIC_SITE_URL=${SITE_URL}
ENVEOF
chmod 600 .env.production
cat > ~/.config/node/.env <<ENVEOF
NODE_ENV=production
PORT=3000
DATABASE_URI=file:./payload.db
PAYLOAD_SECRET=${PAYLOAD_SECRET}
NEXT_PUBLIC_SITE_URL=${SITE_URL}
ENVEOF
npm ci
# DB is synced from local dev (schema via push). Skip migrate to avoid duplicate-column errors.
npm run build
if command -v mittnitectl >/dev/null 2>&1; then
  mittnitectl job restart node || mittnitectl job start node || true
fi
echo "Deploy finished."
REMOTE

echo "==> Done. Check ${SITE_URL}"
