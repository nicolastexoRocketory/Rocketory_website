#!/usr/bin/env bash
# Download production payload.db and media/ from Mittwald (backup only).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/mittwald-ssh.sh
source "$ROOT_DIR/scripts/lib/mittwald-ssh.sh"

REMOTE_PATH="${MITTWALD_REMOTE_PATH:-/home/p-jscfah/html/rocketory}"
BACKUP_DIR="${MITTWALD_BACKUP_DIR:-$ROOT_DIR/backups/production}"
STAMP="$(date +%Y%m%d-%H%M%S)"
TARGET="$BACKUP_DIR/$STAMP"

trap mittwald_cleanup_ssh_wrapper EXIT

SSH_CMD="$(mittwald_build_ssh_cmd "$ROOT_DIR")"
SSH_TARGET="$(mittwald_ssh_target)"

mkdir -p "$TARGET"

echo "==> Backup to $TARGET"

rsync -avz \
  -e "$SSH_CMD" \
  "${SSH_TARGET}:${REMOTE_PATH}/payload.db" \
  "$TARGET/payload.db"

if rsync -avz \
  -e "$SSH_CMD" \
  "${SSH_TARGET}:${REMOTE_PATH}/media/" \
  "$TARGET/media/"; then
  echo "media/ backed up"
else
  echo "media/ backup skipped or empty"
fi

echo "==> Done: $TARGET"
