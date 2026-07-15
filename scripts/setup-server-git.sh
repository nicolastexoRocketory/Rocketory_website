#!/usr/bin/env bash
# One-time: connect Mittwald server to the private GitHub repo.
# After running, add the printed deploy key in GitHub:
#   Repo → Settings → Deploy keys → Add deploy key (read-only)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/mittwald-ssh.sh
source "$ROOT_DIR/scripts/lib/mittwald-ssh.sh"

REMOTE_PATH="${MITTWALD_REMOTE_PATH:-/home/p-jscfah/html/rocketory}"
GIT_REMOTE="${MITTWALD_GIT_REMOTE:-git@github.com:nicolastexo/Rocketory-Landingpage.git}"
GIT_BRANCH="${MITTWALD_GIT_BRANCH:-main}"
GITHUB_DEPLOY_KEY="${MITTWALD_GITHUB_DEPLOY_KEY:-$HOME/.ssh/github_rocketory}"

trap mittwald_cleanup_ssh_wrapper EXIT

echo "==> Setting up git on Mittwald server"
mittwald_ssh "$ROOT_DIR" bash -s <<REMOTE
set -euo pipefail
REMOTE_PATH=$(printf %q "$REMOTE_PATH")
GIT_REMOTE=$(printf %q "$GIT_REMOTE")
GIT_BRANCH=$(printf %q "$GIT_BRANCH")
GITHUB_DEPLOY_KEY=$(printf %q "$GITHUB_DEPLOY_KEY")

mkdir -p "\$HOME/.ssh"
chmod 700 "\$HOME/.ssh"

if [[ ! -f "\$GITHUB_DEPLOY_KEY" ]]; then
  ssh-keygen -t ed25519 -f "\$GITHUB_DEPLOY_KEY" -N "" -C "rocketory-mittwald-deploy"
fi
chmod 600 "\$GITHUB_DEPLOY_KEY"
chmod 644 "\${GITHUB_DEPLOY_KEY}.pub"

cd "\$REMOTE_PATH"

if [[ ! -d .git ]]; then
  git init -b "\$GIT_BRANCH"
  git remote add origin "\$GIT_REMOTE"
fi

git config --local safe.directory "\$REMOTE_PATH"
export GIT_SSH_COMMAND="ssh -i \$GITHUB_DEPLOY_KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"

echo ""
echo "=== ADD THIS DEPLOY KEY ON GITHUB (read-only) ==="
cat "\${GITHUB_DEPLOY_KEY}.pub"
echo "=== GitHub → Rocketory-Landingpage → Settings → Deploy keys ==="
echo ""

git fetch origin "\$GIT_BRANCH"
git checkout "\$GIT_BRANCH" 2>/dev/null || git checkout -b "\$GIT_BRANCH"
git reset --hard "origin/\$GIT_BRANCH"

echo "Server git setup complete at \$REMOTE_PATH on branch \$GIT_BRANCH"
REMOTE

echo ""
echo "Next steps:"
echo "  1. Add the deploy key on GitHub (if not done yet)"
echo "  2. Push your latest code: git push"
echo "  3. Deploy: ./scripts/deploy-production.sh"
