#!/usr/bin/env bash
set -euo pipefail
cd /home/p-jscfah/html/rocketory

# Platzhalter auf dem App-Port, damit der Container während des Builds nicht neu gestartet wird.
node -e "require('http').createServer((q,s)=>{s.writeHead(200,{'content-type':'text/html; charset=utf-8','x-robots-tag':'noindex','cache-control':'no-store','retry-after':'120'});s.end('<!doctype html><meta charset=utf-8><meta name=robots content=noindex><title>Rocketory</title><p style=\"font-family:sans-serif;text-align:center;margin-top:20vh\">Die Seite wird gerade aktualisiert und ist in wenigen Minuten wieder erreichbar.</p>')}).listen(process.env.PORT||3000,()=>console.log('[recover] placeholder listening'))" &
HOLD=$!
trap 'kill "$HOLD" 2>/dev/null || true' EXIT

if [[ ! -x ./node_modules/.bin/next ]]; then
  echo '[recover] npm ci --ignore-scripts'
  npm ci --ignore-scripts
  npm install sharp@0.34.5 --save-exact --no-fund --no-audit --ignore-scripts || true
fi
if [[ -f scripts/ensure-email-settings-columns.mjs ]]; then node scripts/ensure-email-settings-columns.mjs ./payload.db || true; fi
if [[ -f scripts/ensure-contact-inquiry-reply-columns.mjs ]]; then node scripts/ensure-contact-inquiry-reply-columns.mjs ./payload.db || true; fi

echo '[recover] next build'
NODE_OPTIONS='--no-deprecation --max-old-space-size=3072' ./node_modules/.bin/next build
echo '[recover] build ok'

node <<'NODE'
const fs = require('fs')
const src = fs.existsSync('package.json.bak-deploy') ? 'package.json.bak-deploy' : 'package.json'
const pkg = JSON.parse(fs.readFileSync(src, 'utf8'))
pkg.scripts.start = 'NODE_OPTIONS=--no-deprecation ./node_modules/.bin/next start'
pkg.scripts.build = 'NODE_OPTIONS=--no-deprecation ./node_modules/.bin/next build'
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
try { fs.unlinkSync('package.json.bak-deploy') } catch {}
console.log('[recover] package.json restored')
NODE

kill "$HOLD" 2>/dev/null || true
wait "$HOLD" 2>/dev/null || true
trap - EXIT
echo '[recover] next start'
exec env NODE_OPTIONS=--no-deprecation ./node_modules/.bin/next start
