#!/usr/bin/env python3
import os
import subprocess
import sys
import tarfile
import tempfile
from pathlib import Path

import paramiko

ROOT = Path(__file__).resolve().parents[1]
HOST = os.environ.get("MITTWALD_SSH_HOST", "ssh.lashorst.project.host")
USER = os.environ.get("MITTWALD_SSH_USER", "nicolas@viralista.de@a-fghqd3")
PORT = int(os.environ.get("MITTWALD_SSH_PORT", "22"))
REMOTE_PATH = os.environ.get("MITTWALD_REMOTE_PATH", "/home/p-jscfah/html/rocketory")
PASSWORD = os.environ.get("MITTWALD_SSH_PASS", "")
KEY_PATH = os.environ.get("MITTWALD_SSH_KEY", "")

EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    ".env",
    "media",
    ".deploy-keys",
}
EXCLUDE_NAMES = {
    "payload.db",
    ".DS_Store",
}


def should_skip(path: Path) -> bool:
    rel = path.relative_to(ROOT)
    if any(part in EXCLUDE_DIRS for part in rel.parts):
        return True
    if path.name in EXCLUDE_NAMES:
        return True
    if path.name.startswith(".env"):
        return True
    if path.suffix == ".log":
        return True
    return False


def connect():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    kwargs = {
        "hostname": HOST,
        "port": PORT,
        "username": USER,
        "timeout": 30,
        "allow_agent": True,
        "look_for_keys": True,
    }
    if KEY_PATH and Path(KEY_PATH).is_file():
        kwargs["key_filename"] = KEY_PATH
        kwargs["allow_agent"] = False
        kwargs["look_for_keys"] = False
    elif PASSWORD:
        kwargs["password"] = PASSWORD
        kwargs["allow_agent"] = False
        kwargs["look_for_keys"] = False
    else:
        raise SystemExit("Set MITTWALD_SSH_PASS or MITTWALD_SSH_KEY")
    client.connect(**kwargs)
    return client


def run(client, cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    code = stdout.channel.recv_exit_status()
    if out:
        print(out, end="")
    if err:
        print(err, end="", file=sys.stderr)
    if code != 0:
        raise SystemExit(f"Remote command failed ({code}): {cmd}")


def create_tarball() -> Path:
    tmp = tempfile.NamedTemporaryFile(suffix=".tar.gz", delete=False)
    tmp_path = Path(tmp.name)
    tmp.close()
    print("==> Creating deploy archive")
    with tarfile.open(tmp_path, "w:gz") as tar:
        for path in ROOT.rglob("*"):
            if path.is_dir():
                continue
            if should_skip(path):
                continue
            arcname = path.relative_to(ROOT).as_posix()
            tar.add(path, arcname=arcname)
    print(f"   archive: {tmp_path} ({tmp_path.stat().st_size // 1024} KB)")
    return tmp_path


def main():
    archive = create_tarball()
    try:
        print("==> Connecting")
        client = connect()
        sftp = client.open_sftp()
        remote_archive = f"{REMOTE_PATH}/deploy-frontend.tar.gz"
        print("==> Uploading archive")
        sftp.put(str(archive), remote_archive)
        sftp.close()

        print("==> Extracting on server (payload.db + media untouched)")
        run(
            client,
            f"mkdir -p {REMOTE_PATH} && cd {REMOTE_PATH} && "
            f"tar xzf deploy-frontend.tar.gz && rm -f deploy-frontend.tar.gz",
        )

        print("==> Restarting Node app")
        run(
            client,
            f"cd {REMOTE_PATH} && "
            "(mittnitectl job restart node || mittnitectl job start node || true) && "
            "sleep 4 && "
            "curl -s -o /dev/null -w 'homepage:%{{http_code}}\\n' http://127.0.0.1:3000/ && "
            "curl -s http://127.0.0.1:3000/agentur | grep -o 'Nordrhein-Westfalen\\|Niedersachsen' | head -3 || true",
        )
        client.close()
        print("==> Done. Check https://rocketory.de/agentur")
    finally:
        archive.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
