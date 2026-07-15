#!/usr/bin/env bash
# Deploy frontend/code only — keeps production payload.db and media/ untouched.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE_HOST="${MITTWALD_SSH_HOST:-ssh.lashorst.project.host}"
REMOTE_USER="${MITTWALD_SSH_USER:-nicolas@viralista.de@a-fghqd3}"
REMOTE_PORT="${MITTWALD_SSH_PORT:-22}"
REMOTE_PATH="${MITTWALD_REMOTE_PATH:-/home/p-jscfah/html/rocketory}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://rocketory.de}"

if [[ -z "${MITTWALD_SSH_KEY:-}" ]]; then
  for candidate in \
    "$ROOT_DIR/.deploy-keys/mittwald_ed25519" \
    "$ROOT_DIR/../Rocketory Website/.deploy-keys/mittwald_ed25519"; do
    if [[ -f "$candidate" ]]; then
      MITTWALD_SSH_KEY="$candidate"
      break
    fi
  done
fi

SSH_TARGET="${REMOTE_USER}@${REMOTE_HOST}"

SSH_WRAPPER=""
cleanup_ssh_wrapper() {
  if [[ -n "$SSH_WRAPPER" && -f "$SSH_WRAPPER" ]]; then
    rm -f "$SSH_WRAPPER"
  fi
}
trap cleanup_ssh_wrapper EXIT

build_ssh_cmd() {
  if [[ -n "${MITTWALD_SSH_KEY:-}" && -f "${MITTWALD_SSH_KEY}" ]]; then
    SSH_WRAPPER="$(mktemp)"
    cat >"$SSH_WRAPPER" <<EOF
#!/usr/bin/env bash
exec ssh -i "$MITTWALD_SSH_KEY" -o IdentitiesOnly=yes -p "$REMOTE_PORT" -o StrictHostKeyChecking=accept-new "\$@"
EOF
    chmod +x "$SSH_WRAPPER"
    printf '%s' "$SSH_WRAPPER"
  elif [[ -n "${MITTWALD_SSH_PASS:-}" ]] && command -v sshpass >/dev/null 2>&1; then
    SSH_WRAPPER="$(mktemp)"
    cat >"$SSH_WRAPPER" <<EOF
#!/usr/bin/env bash
exec sshpass -p "$MITTWALD_SSH_PASS" ssh -p "$REMOTE_PORT" -o StrictHostKeyChecking=accept-new "\$@"
EOF
    chmod +x "$SSH_WRAPPER"
    printf '%s' "$SSH_WRAPPER"
  else
    printf 'ssh -p %s -o StrictHostKeyChecking=accept-new' "$REMOTE_PORT"
  fi
}

RSYNC_SSH="$(build_ssh_cmd)"

if [[ -z "${MITTWALD_SSH_KEY:-}" && -z "${MITTWALD_SSH_PASS:-}" ]]; then
  echo "No SSH key or password configured." >&2
  echo "Set MITTWALD_SSH_KEY or MITTWALD_SSH_PASS." >&2
  exit 1
fi

echo "==> Local production build"
cd "$ROOT_DIR"
npm run build

echo "==> Syncing frontend/code to ${REMOTE_PATH} (excluding payload.db + media/)"
rsync -avz --delete \
  --filter 'P .env.production' \
  --filter 'P payload.db' \
  --filter 'P media/' \
  --exclude node_modules \
  --exclude .git \
  --exclude .next \
  --exclude .env \
  --exclude .env.* \
  --exclude payload.db \
  --exclude media \
  --exclude .DS_Store \
  --exclude '*.log' \
  --exclude .deploy-keys \
  -e "$RSYNC_SSH" \
  "$ROOT_DIR/" "${SSH_TARGET}:${REMOTE_PATH}/"

echo "==> Uploading .next build artifact"
rsync -avz --delete \
  -e "$RSYNC_SSH" \
  "$ROOT_DIR/.next/" "${SSH_TARGET}:${REMOTE_PATH}/.next/"

echo "==> Restart Node app (CMS data unchanged)"
$(build_ssh_cmd) "${SSH_TARGET}" bash -s <<REMOTE
set -e
cd "$REMOTE_PATH"
if command -v mittnitectl >/dev/null 2>&1; then
  mittnitectl job restart node || mittnitectl job start node || true
fi
sleep 4
curl -s -o /dev/null -w "homepage:%{http_code}\n" http://127.0.0.1:3000/ || true
curl -s http://127.0.0.1:3000/agentur | grep -o "Nordrhein-Westfalen\\|Niedersachsen" | head -3 || true
echo "Frontend deploy finished."
REMOTE

echo "==> Done. Check ${SITE_URL}/agentur"
