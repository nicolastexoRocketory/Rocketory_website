import { getPayload } from 'payload'

import { backfillMediaTitles, seedBlogCategories } from '../lib/seed-categories'
import config from '../payload.config'

async function seed() {
  const payload = await getPayload({ config })
  await seedBlogCategories(payload)
  await backfillMediaTitles(payload)
  console.log('Kategorien & Media-Titel aktualisiert.')
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
