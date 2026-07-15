import fs from 'fs'
import path from 'path'

import { transformLinks } from './legacy-routes'

export { resolveLegacyHref, transformLinks } from './legacy-routes'

export function transformAssets(html: string): string {
  return html
    .replace(/(\.\.\/)?assets\//g, '/assets/')
    .replace(/srcset="(\.\.\/)?assets\//g, 'srcset="/assets/')
}

export function getStaticComponentHtml(filename: string): string {
  const filePath = path.join(process.cwd(), 'legacy', 'components', filename)
  const html = fs.readFileSync(filePath, 'utf-8')
  return transformAssets(transformLinks(html))
}
