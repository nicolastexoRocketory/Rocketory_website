#!/usr/bin/env node
/**
 * Starts `npm run build` detached on the Mittwald host and writes
 * /tmp/rocketory-deploy/build.log + pid. Used by deploy-production.sh.
 */
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const remotePath = process.argv[2] || process.cwd()
const deployDir = '/tmp/rocketory-deploy'
const logPath = path.join(deployDir, 'build.log')
const pidPath = path.join(deployDir, 'pid')

fs.mkdirSync(deployDir, { recursive: true })
fs.writeFileSync(logPath, 'START ' + new Date().toISOString() + '\n')
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
