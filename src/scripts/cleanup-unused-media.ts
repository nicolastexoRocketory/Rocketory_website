import fs from 'fs'
import path from 'path'

import { getPayload } from 'payload'

import {
  collectMediaUsageFromFilesystem,
  collectUsedMediaFilenames,
  collectUsedMediaIds,
} from '../lib/collect-used-media'
import config from '../payload.config'

const DEAD_PRODUCT_PATTERN = /(trustus|stagery)/i

function walkPublicImages(dir: string, files: string[]) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkPublicImages(fullPath, files)
      continue
    }
    if (entry.isFile() && /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(entry.name)) {
      files.push(fullPath)
    }
  }
}

async function main() {
  const payload = await getPayload({ config })
  const [{ assetPaths }, usedFilenames, usedIds] = await Promise.all([
    Promise.resolve(collectMediaUsageFromFilesystem()),
    collectUsedMediaFilenames(payload),
    collectUsedMediaIds(payload),
  ])

  const allMedia = await payload.find({
    collection: 'media',
    limit: 2000,
    pagination: false,
  })

  const toDelete = allMedia.docs.filter((doc) => {
    if (usedIds.has(doc.id)) return false
    if (doc.filename && usedFilenames.has(doc.filename)) return false
    if (doc.sitePath && assetPaths.has(doc.sitePath)) return false
    return true
  })

  const keepBySitePath = new Map(
    allMedia.docs
      .filter((doc) => !toDelete.some((dead) => dead.id === doc.id) && doc.sitePath)
      .map((doc) => [doc.sitePath as string, doc]),
  )

  if (toDelete.length === 0) {
    console.log(`Keine ungenutzten Medien gefunden (${usedFilenames.size} in Verwendung).`)
  } else {
    console.log(`Behalten (${allMedia.docs.length - toDelete.length}):`)
    for (const doc of allMedia.docs.filter((item) => !toDelete.some((dead) => dead.id === item.id))) {
      console.log(`  • ${doc.filename} (${doc.sitePath || 'ohne Webseiten-Pfad'})`)
    }

    console.log(`\nLöschen (${toDelete.length}):`)
    for (const doc of toDelete) {
      console.log(`  • ${doc.filename} (id ${doc.id}, ${doc.sitePath || 'ohne Website-Pfad'})`)
      await payload.delete({
        collection: 'media',
        id: doc.id,
      })
    }
  }

  const publicRoot = path.join(process.cwd(), 'public', 'assets', 'images')
  const publicFiles: string[] = []
  walkPublicImages(publicRoot, publicFiles)

  let publicDeleted = 0
  for (const filePath of publicFiles) {
    const sitePath = `/${path.relative(path.join(process.cwd(), 'public'), filePath).replace(/\\/g, '/')}`
    const isDeadProduct = DEAD_PRODUCT_PATTERN.test(sitePath)
    const isUsed = assetPaths.has(sitePath) || keepBySitePath.has(sitePath)

    if (!isDeadProduct && isUsed) continue

    fs.unlinkSync(filePath)
    publicDeleted += 1
    console.log(`Public-Datei entfernt: ${sitePath}`)
  }

  console.log(
    `\nFertig: ${toDelete.length} Media-Einträge und ${publicDeleted} Public-Dateien entfernt.`,
  )
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
