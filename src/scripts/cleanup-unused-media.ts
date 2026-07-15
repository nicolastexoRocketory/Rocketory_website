import { getPayload } from 'payload'

import { collectUsedMediaFilenames } from '../lib/collect-used-media'
import config from '../payload.config'

async function main() {
  const payload = await getPayload({ config })
  const usedFilenames = await collectUsedMediaFilenames(payload)

  const allMedia = await payload.find({
    collection: 'media',
    limit: 2000,
    pagination: false,
  })

  const toDelete = allMedia.docs.filter((doc) => doc.filename && !usedFilenames.has(doc.filename))

  if (toDelete.length === 0) {
    console.log(`Keine ungenutzten Medien gefunden (${usedFilenames.size} in Verwendung).`)
    process.exit(0)
  }

  console.log(`Behalten (${usedFilenames.size}):`)
  for (const filename of [...usedFilenames].sort()) {
    console.log(`  • ${filename}`)
  }

  console.log(`\nLöschen (${toDelete.length}):`)
  for (const doc of toDelete) {
    console.log(`  • ${doc.filename} (id ${doc.id})`)
    await payload.delete({
      collection: 'media',
      id: doc.id,
    })
  }

  console.log(`\nFertig: ${toDelete.length} Medium/Medien entfernt.`)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
