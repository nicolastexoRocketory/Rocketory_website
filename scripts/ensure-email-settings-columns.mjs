#!/usr/bin/env node
/**
 * Non-interactive SQLite fix for Turnstile/form columns on email_settings.
 * Used on Mittwald when `payload migrate` would ask interactively.
 */
import path from 'path'
import { pathToFileURL } from 'url'
import { createClient } from '@libsql/client'

const dbFile = path.resolve(process.argv[2] || 'payload.db')
const client = createClient({ url: pathToFileURL(dbFile).href })

const needed = [
  ['kontakt_notification_email', 'text'],
  ['kontakt_turnstile_enabled', 'integer DEFAULT 1'],
  ['kontakt_turnstile_site_key', 'text'],
  ['kontakt_turnstile_secret_key', 'text'],
  ['ki_check_notification_email', 'text'],
  ['ki_check_turnstile_enabled', 'integer DEFAULT 1'],
  ['ki_check_turnstile_site_key', 'text'],
  ['ki_check_turnstile_secret_key', 'text'],
]

const info = await client.execute('PRAGMA table_info(email_settings)')
const cols = new Set(info.rows.map((r) => r.name ?? r[1]))

for (const [name, typedef] of needed) {
  if (!cols.has(name)) {
    await client.execute(`ALTER TABLE email_settings ADD COLUMN ${name} ${typedef}`)
    console.log('ADD', name)
  } else {
    console.log('OK', name)
  }
}

try {
  const migs = await client.execute('SELECT name FROM payload_migrations')
  const names = new Set(migs.rows.map((r) => r.name ?? r[0]))
  const mig = '20261028_email_settings_form_turnstile'
  if (!names.has(mig)) {
    await client.execute({
      sql: "INSERT INTO payload_migrations (name, batch, updated_at, created_at) VALUES (?, ?, datetime('now'), datetime('now'))",
      args: [mig, 1],
    })
    console.log('MARK', mig)
  }
} catch (error) {
  console.log('MIG_SKIP', error instanceof Error ? error.message : error)
}

console.log('DONE')
