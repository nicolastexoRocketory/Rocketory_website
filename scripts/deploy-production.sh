#!/usr/bin/env bash
# Deploy code to Mittwald via git pull + server build.
# Keeps production payload.db, media/ and .env.production untouched.
#
# Deine Routine (ohne Agent):
#   1. git push   (oder GitHub Desktop)
#   2. npm run deploy
#
# Optional:
#   SKIP_SEED=1 npm run deploy
#
# Build läuft über mittnite (`npm start` temporär = build && start),
# weil detached Background-Builds auf Mittwald abgebrochen werden.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/mittwald-ssh.sh
source "$ROOT_DIR/scripts/lib/mittwald-ssh.sh"

REMOTE_PATH="${MITTWALD_REMOTE_PATH:-/home/p-jscfah/html/rocketory}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://rocketory.de}"
GIT_REMOTE="${MITTWALD_GIT_REMOTE:-git@github.com:nicolastexoRocketory/Rocketory_website.git}"
GIT_BRANCH="${MITTWALD_GIT_BRANCH:-main}"
SKIP_SEED="${SKIP_SEED:-0}"

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
SKIP_SEED=$(printf %q "$SKIP_SEED")
GITHUB_DEPLOY_KEY="\$HOME/.ssh/github_rocketory"
LOG_STDOUT="/var/log/nodejs/da0076d5-54e9-4aa0-9e9c-7e19d0ac4deb-stdout.log"

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

SHARP_VER="\$(node -p "require('./node_modules/sharp/package.json').version" 2>/dev/null || true)"
if [[ "\$SHARP_VER" != "0.34.5" ]]; then
  echo "==> sharp \$SHARP_VER → pin 0.34.5"
  npm install sharp@0.34.5 --save-exact --no-fund --no-audit
fi

if [[ ! -f .env.production && -f "\$HOME/.config/node/.env" ]]; then
  cp "\$HOME/.config/node/.env" .env.production
  chmod 600 .env.production
fi

if [[ -f scripts/ensure-email-settings-columns.mjs ]]; then
  echo "==> ensure email_settings Turnstile columns"
  node scripts/ensure-email-settings-columns.mjs ./payload.db \
    || echo "WARN: Spalten-Check fehlgeschlagen" >&2
fi

if [[ "\$SKIP_SEED" != "1" && -f .env.production ]]; then
  echo "==> Blog-Posts synchronisieren (seed, vor Build)"
  NODE_OPTIONS=--no-deprecation ./node_modules/.bin/tsx --env-file=.env.production src/scripts/seed-posts.ts \
    || echo "WARN: seed fehlgeschlagen – Blog ggf. manuell aktualisieren" >&2
fi

echo "==> Build + Start über mittnite"
mittnitectl job stop node >/dev/null 2>&1 || true
cp package.json package.json.bak-deploy
node <<'NODE'
const fs = require('fs')
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
pkg.scripts.start =
  'cross-env NODE_OPTIONS="--no-deprecation --max-old-space-size=4096" next build && cross-env NODE_OPTIONS=--no-deprecation next start'
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
NODE

MARKER="Ready in"
BEFORE_LINES="\$(wc -l < "\$LOG_STDOUT" 2>/dev/null || echo 0)"
mittnitectl job start node

echo "==> Warte auf Ready …"
for i in \$(seq 1 180); do
  if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ | grep -q '^200\$'; then
    echo "==> App antwortet"
    # restore normal start script (build already done)
    if [[ -f package.json.bak-deploy ]]; then
      mv package.json.bak-deploy package.json
      echo "==> package.json start wiederhergestellt"
    fi
    curl -s -o /dev/null -w "homepage:%{http_code}\n" http://127.0.0.1:3000/ || true
    curl -s -o /dev/null -w "admin:%{http_code}\n" http://127.0.0.1:3000/admin || true
    curl -s -o /dev/null -w "form-settings:%{http_code}\n" http://127.0.0.1:3000/api/form-settings || true
    echo "Deploy finished. Check ${SITE_URL}"
    exit 0
  fi
  # show progress from logs
  if [[ -f "\$LOG_STDOUT" ]]; then
    tail -n 3 "\$LOG_STDOUT" | sed 's/^/  /' || true
  fi
  sleep 5
done

# restore even on failure
if [[ -f package.json.bak-deploy ]]; then
  mv package.json.bak-deploy package.json
fi
echo "ERROR: Timeout – App nicht bereit. Logs:" >&2
tail -n 80 "\$LOG_STDOUT" >&2 || true
exit 1
REMOTE

echo "==> Done. Check ${SITE_URL}"
