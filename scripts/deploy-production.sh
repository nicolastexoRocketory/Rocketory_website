#!/usr/bin/env bash
# Deploy code to Mittwald via git pull + server build.
# Keeps production payload.db, media/ and .env.production untouched.
#
# Deine Routine (ohne Agent):
#   1. git push   (oder GitHub Desktop)
#   2. npm run deploy
#
# Optional:
#   SKIP_SEED=1 npm run deploy      # Blog-Seed überspringen
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
DEPLOY_DIR="/tmp/rocketory-deploy"
LOG="\$DEPLOY_DIR/build.log"
PID_FILE="\$DEPLOY_DIR/pid"

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

# Mittwald: sharp 0.35.x bricht next build (vips_colourspace). Pin erzwingen falls Lockfile driftet.
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

mkdir -p "\$DEPLOY_DIR"
if [[ -f "\$PID_FILE" ]]; then
  OLD_PID="\$(cat "\$PID_FILE" 2>/dev/null || true)"
  if [[ -n "\${OLD_PID:-}" ]] && kill -0 "\$OLD_PID" 2>/dev/null; then
    echo "ERROR: Deploy-Build läuft bereits (PID \$OLD_PID). Warte oder beende ihn." >&2
    exit 1
  fi
fi

echo "==> npm run build (detached, Log: \$LOG)"
REMOTE_PATH_FOR_NODE="\$REMOTE_PATH" node <<'NODE'
const { spawn } = require('child_process')
const fs = require('fs')
const remotePath = process.env.REMOTE_PATH_FOR_NODE
const logPath = '/tmp/rocketory-deploy/build.log'
const pidPath = '/tmp/rocketory-deploy/pid'
fs.writeFileSync(logPath, `START ${new Date().toISOString()}\n`)
const out = fs.openSync(logPath, 'a')
const script = [
  'set -euo pipefail',
  'cd ' + JSON.stringify(remotePath),
  'npm run build',
  'echo BUILD_EXIT:$?',
  'if command -v mittnitectl >/dev/null 2>&1; then',
  '  mittnitectl job restart node || mittnitectl job start node || true',
  'fi',
  'sleep 4',
  'curl -s -o /dev/null -w "homepage:%{http_code}\\n" http://127.0.0.1:3000/ || true',
  'curl -s -o /dev/null -w "admin:%{http_code}\\n" http://127.0.0.1:3000/admin || true',
  'curl -s -o /dev/null -w "form-settings:%{http_code}\\n" http://127.0.0.1:3000/api/form-settings || true',
  'echo DONE $(date -Is)',
].join('\n')
const child = spawn('bash', ['-lc', script], {
  cwd: remotePath,
  detached: true,
  stdio: ['ignore', out, out],
  env: process.env,
})
fs.writeFileSync(pidPath, String(child.pid))
child.unref()
console.log('BUILD_PID=' + child.pid)
NODE

echo "==> Warte auf Build …"
for i in \$(seq 1 120); do
  if grep -q '^DONE ' "\$LOG" 2>/dev/null; then
    echo "==> Build fertig"
    tail -n 30 "\$LOG"
    if grep -q '^BUILD_EXIT:0\$' "\$LOG"; then
      echo "Deploy finished. Check ${SITE_URL}"
      exit 0
    fi
    echo "ERROR: Build fehlgeschlagen. Log: \$LOG" >&2
    exit 1
  fi
  if [[ -f "\$PID_FILE" ]]; then
    BPID="\$(cat "\$PID_FILE" 2>/dev/null || true)"
    if [[ -n "\${BPID:-}" ]] && ! kill -0 "\$BPID" 2>/dev/null; then
      if ! grep -q '^DONE ' "\$LOG" 2>/dev/null; then
        echo "ERROR: Build-Prozess beendet ohne DONE. Log:" >&2
        tail -n 80 "\$LOG" >&2 || true
        exit 1
      fi
    fi
  fi
  sleep 5
done

echo "ERROR: Timeout beim Warten auf Build. Log: \$LOG" >&2
tail -n 80 "\$LOG" >&2 || true
exit 1
REMOTE

echo "==> Done. Check ${SITE_URL}"
