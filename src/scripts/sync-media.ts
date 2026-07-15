import { getPayload } from 'payload'

import { syncWebsiteMedia } from '../lib/sync-website-media'
import config from '../payload.config'

async function main() {
  const payload = await getPayload({ config })
  const result = await syncWebsiteMedia(payload)
  console.log(
    `Fertig: ${result.created} neu importiert, ${result.skipped} bereits vorhanden (${result.total} Bilder im Projektordner).`,
  )
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
