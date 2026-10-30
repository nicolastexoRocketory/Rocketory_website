#!/usr/bin/env node
/**
 * Non-interactive SQLite fix for KI-Check reply fields on contact_inquiries.
 * Used on Mittwald when `payload migrate` would ask interactively.
 */
import path from 'path'
import { pathToFileURL } from 'url'
import { createClient } from '@libsql/client'

const dbFile = path.resolve(process.argv[2] || 'payload.db')
const client = createClient({ url: pathToFileURL(dbFile).href })

const needed = [
  ['reply_recipient_email', 'text'],
  ['reply_recipient_name', 'text'],
  ['reply_subject', 'text'],
  ['reply_website', 'text'],
  ['reply_ai_assessment', 'text'],
  ['reply_labeling_assessment', 'text'],
  ['reply_report_body', 'text'],
  ['reply_next_step', 'text'],
  ['reply_sent_at', 'text'],
  ['reply_sent_to', 'text'],
]

const info = await client.execute('PRAGMA table_info(contact_inquiries)')
const cols = new Set(info.rows.map((r) => r.name ?? r[1]))

for (const [name, typedef] of needed) {
  if (!cols.has(name)) {
    await client.execute(`ALTER TABLE contact_inquiries ADD COLUMN ${name} ${typedef}`)
    console.log('ADD', name)
  } else {
    console.log('OK', name)
  }
}

try {
  const migs = await client.execute('SELECT name FROM payload_migrations')
  const names = new Set(migs.rows.map((r) => r.name ?? r[0]))
  const mig = '20261030_contact_inquiry_reply_fields'
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
