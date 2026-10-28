#!/usr/bin/env bash
# Shared SSH helpers for Mittwald deploy scripts.
set -euo pipefail

mittwald_root_dir() {
  cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd
}

mittwald_resolve_ssh_key() {
  local root_dir="${1:-$(mittwald_root_dir)}"
  if [[ -n "${MITTWALD_SSH_KEY:-}" && -f "${MITTWALD_SSH_KEY}" ]]; then
    printf '%s' "$MITTWALD_SSH_KEY"
    return 0
  fi
  local candidate
  for candidate in \
    "$root_dir/.deploy-keys/mittwald_ed25519" \
    "$root_dir/../Rocketory Website/.deploy-keys/mittwald_ed25519"; do
    if [[ -f "$candidate" ]]; then
      printf '%s' "$candidate"
      return 0
    fi
  done
  return 1
}

mittwald_ssh_target() {
  printf '%s@%s' \
    "${MITTWALD_SSH_USER:-nicolas@viralista.de@a-fghqd3}" \
    "${MITTWALD_SSH_HOST:-ssh.lashorst.project.host}"
}

MITTWALD_SSH_WRAPPER=""
mittwald_cleanup_ssh_wrapper() {
  if [[ -n "$MITTWALD_SSH_WRAPPER" && -f "$MITTWALD_SSH_WRAPPER" ]]; then
    rm -f "$MITTWALD_SSH_WRAPPER"
  fi
}

mittwald_build_ssh_cmd() {
  local root_dir="${1:-$(mittwald_root_dir)}"
  local port="${MITTWALD_SSH_PORT:-22}"
  local key
  if key="$(mittwald_resolve_ssh_key "$root_dir")"; then
    MITTWALD_SSH_WRAPPER="$(mktemp)"
    cat >"$MITTWALD_SSH_WRAPPER" <<EOF
#!/usr/bin/env bash
exec ssh -i "$key" -o IdentitiesOnly=yes -p "$port" -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -o ServerAliveCountMax=120 "\$@"
EOF
    chmod +x "$MITTWALD_SSH_WRAPPER"
    printf '%s' "$MITTWALD_SSH_WRAPPER"
  elif [[ -n "${MITTWALD_SSH_PASS:-}" ]] && command -v sshpass >/dev/null 2>&1; then
    MITTWALD_SSH_WRAPPER="$(mktemp)"
    cat >"$MITTWALD_SSH_WRAPPER" <<EOF
#!/usr/bin/env bash
exec sshpass -p "$MITTWALD_SSH_PASS" ssh -p "$port" -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -o ServerAliveCountMax=120 "\$@"
EOF
    chmod +x "$MITTWALD_SSH_WRAPPER"
    printf '%s' "$MITTWALD_SSH_WRAPPER"
  else
    printf 'ssh -p %s -o StrictHostKeyChecking=accept-new' "$port"
  fi
}

mittwald_ssh() {
  local root_dir="${1:-$(mittwald_root_dir)}"
  shift || true
  local ssh_cmd
  ssh_cmd="$(mittwald_build_ssh_cmd "$root_dir")"
  "$ssh_cmd" "$(mittwald_ssh_target)" "$@"
}
