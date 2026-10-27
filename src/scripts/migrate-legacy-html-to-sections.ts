/**
 * Dekompiliert legacyHtml → contentIntro + contentSections für Posts und Projects.
 *
 * Usage:
 *   npx tsx --env-file=.env src/scripts/migrate-legacy-html-to-sections.ts --dry-run
 *   npx tsx --env-file=.env src/scripts/migrate-legacy-html-to-sections.ts
 */
import { getPayload } from 'payload'

import {
  legacyParseCoverage,
  parseLegacyArticleHtml,
} from '../lib/content-sections'
import config from '../payload.config'

const dryRun = process.argv.includes('--dry-run')
const force = process.argv.includes('--force')

type CollectionSlug = 'posts' | 'projects'

async function migrateCollection(collection: CollectionSlug) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection,
    limit: 200,
    pagination: false,
    depth: 0,
  })

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const doc of result.docs) {
    const slug = doc.slug
    const legacyHtml = (doc.legacyHtml || '').trim()
    const existingSections = Array.isArray(doc.contentSections) ? doc.contentSections : []

    if (!legacyHtml) {
      console.log(`SKIP  ${collection}/${slug}: kein legacyHtml`)
      skipped++
      continue
    }

    if (existingSections.length > 0 && !force) {
      console.log(`SKIP  ${collection}/${slug}: contentSections bereits gesetzt (${existingSections.length})`)
      skipped++
      continue
    }

    const parsed = parseLegacyArticleHtml(legacyHtml)
    const coverage = legacyParseCoverage(legacyHtml, parsed)

    console.log(
      `\n${dryRun ? 'DRY' : 'MIG'}  ${collection}/${slug}: ${parsed.sections.length} Abschnitte, intro=${parsed.intro.length} Zeichen`,
    )
    for (const warning of parsed.warnings) {
      console.log(`  warn: ${warning}`)
    }
    console.log(
      `  coverage: ${coverage.ok ? 'OK' : 'DIFF'} (orig=${coverage.originalChars}, rebuild=${coverage.rebuiltChars})`,
    )
    if (!coverage.ok) {
      console.log(`  sample: ${coverage.missingSample}`)
      failed++
      if (!force) {
        console.log('  → nicht geschrieben (Coverage-Diff). Mit --force trotzdem schreiben.')
        continue
      }
    }

    parsed.sections.forEach((section, index) => {
      console.log(`  ${String(index + 1).padStart(2, '0')}. ${section.title} (${section.body.length} Zeichen)`)
    })

    if (dryRun) {
      updated++
      continue
    }

    await payload.update({
      collection,
      id: doc.id,
      data: {
        contentIntro: parsed.intro,
        contentSections: parsed.sections.map((section) => ({
          title: section.title,
          body: section.body,
        })),
      },
      overrideAccess: true,
    })
    updated++
  }

  return { updated, skipped, failed }
}

async function main() {
  console.log(dryRun ? 'Dry-Run: keine Schreibvorgänge' : 'Schreibe contentIntro + contentSections …')
  if (force) console.log('Force: Coverage-Diffs werden trotzdem geschrieben')

  const posts = await migrateCollection('posts')
  const projects = await migrateCollection('projects')

  console.log('\nFertig.')
  console.log('posts   ', posts)
  console.log('projects', projects)

  if (posts.failed + projects.failed > 0 && !force) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
