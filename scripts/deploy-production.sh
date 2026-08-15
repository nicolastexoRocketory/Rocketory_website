#!/usr/bin/env bash
# Deploy code to Mittwald via git pull + server build.
# Keeps production payload.db, media/ and .env.production untouched.
#
# Usage:
#   1. Commit + push in GitHub Desktop (or: git push)
#   2. ./scripts/deploy-production.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/mittwald-ssh.sh
source "$ROOT_DIR/scripts/lib/mittwald-ssh.sh"

REMOTE_PATH="${MITTWALD_REMOTE_PATH:-/home/p-jscfah/html/rocketory}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://rocketory.de}"
GIT_REMOTE="${MITTWALD_GIT_REMOTE:-git@github.com:nicolastexo/Rocketory-Landingpage.git}"
GIT_BRANCH="${MITTWALD_GIT_BRANCH:-main}"

trap mittwald_cleanup_ssh_wrapper EXIT

if ! mittwald_resolve_ssh_key "$ROOT_DIR" >/dev/null && [[ -z "${MITTWALD_SSH_PASS:-}" ]]; then
  echo "No SSH key found. Set MITTWALD_SSH_KEY or add .deploy-keys/mittwald_ed25519" >&2
  exit 1
fi

echo "==> Deploying ${GIT_BRANCH} to ${REMOTE_PATH}"
mittwald_ssh "$ROOT_DIR" bash -s <<REMOTE
set -euo pipefail
REMOTE_PATH=$(printf %q "$REMOTE_PATH")
SITE_URL=$(printf %q "$SITE_URL")
GIT_REMOTE=$(printf %q "$GIT_REMOTE")
GIT_BRANCH=$(printf %q "$GIT_BRANCH")
GITHUB_DEPLOY_KEY="\$HOME/.ssh/github_rocketory"

cd "\$REMOTE_PATH"

if [[ ! -d .git ]]; then
  echo "ERROR: Server is not a git repo yet." >&2
  echo "Run: ./scripts/setup-server-git.sh" >&2
  exit 1
fi

export GIT_SSH_COMMAND="ssh -i \$GITHUB_DEPLOY_KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"

echo "==> git fetch + reset to origin/\$GIT_BRANCH"
git fetch origin "\$GIT_BRANCH"
git checkout "\$GIT_BRANCH"
git reset --hard "origin/\$GIT_BRANCH"

echo "==> npm ci"
npm ci

echo "==> npm run build (on Linux server)"
npm run build

if [[ -f .env.production ]]; then
  echo "==> Blog-Posts synchronisieren (seed)"
  cross-env NODE_OPTIONS=--no-deprecation tsx --env-file=.env.production src/scripts/seed-posts.ts || echo "WARN: seed fehlgeschlagen – Blog ggf. manuell aktualisieren" >&2
fi

if [[ ! -f .env.production && -f "\$HOME/.config/node/.env" ]]; then
  cp "\$HOME/.config/node/.env" .env.production
  chmod 600 .env.production
fi

echo "==> restart Node app"
if command -v mittnitectl >/dev/null 2>&1; then
  mittnitectl job restart node || mittnitectl job start node || true
fi

sleep 4
curl -s -o /dev/null -w "homepage:%{http_code}\n" http://127.0.0.1:3000/ || true
curl -s -o /dev/null -w "admin:%{http_code}\n" http://127.0.0.1:3000/admin || true
curl -s -o /dev/null -w "media-api:%{http_code}\n" "http://127.0.0.1:3000/api/media?limit=1" || true
echo "Deploy finished. Check ${SITE_URL}"
REMOTE

echo "==> Done. Check ${SITE_URL}"
