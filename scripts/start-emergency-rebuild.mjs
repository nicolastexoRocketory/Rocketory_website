import { spawn } from 'child_process'
import fs from 'fs'

const logPath = '/tmp/rocketory-deploy/build.log'
const pidPath = '/tmp/rocketory-deploy/pid'
fs.mkdirSync('/tmp/rocketory-deploy', { recursive: true })
fs.writeFileSync(logPath, 'START ' + new Date().toISOString() + '\n')
const out = fs.openSync(logPath, 'a')

const child = spawn(
  'bash',
  [
    '-c',
    [
      'cd /home/p-jscfah/html/rocketory',
      'export NODE_OPTIONS="--no-deprecation --max-old-space-size=4096"',
      'export NEXT_TELEMETRY_DISABLED=1',
      'npm run build',
      'echo BUILD_EXIT:$?',
      'mittnitectl job start node || mittnitectl job restart node || true',
      'sleep 5',
      'curl -s -o /dev/null -w "homepage:%{http_code}\\n" http://127.0.0.1:3000/ || true',
      'curl -s -o /dev/null -w "public:%{http_code}\\n" https://rocketory.de/ || true',
      'echo DONE $(date -Is)',
    ].join(' && '),
  ],
  {
    cwd: '/home/p-jscfah/html/rocketory',
    detached: true,
    stdio: ['ignore', out, out],
    env: process.env,
  },
)

fs.writeFileSync(pidPath, String(child.pid))
child.unref()
console.log('BUILD_PID=' + child.pid)
