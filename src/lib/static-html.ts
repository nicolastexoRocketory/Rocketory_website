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

const MENU_PANEL_MARKER = '<div class="rk-menu-panel"'

/** React 19 Dev: landmark tags in innerHTML werden bei Hydration entfernt. */
function adaptLandmarkHtml(html: string): string {
  return html
    .replace(
      /^<nav class="rk-nav"/,
      '<div class="rk-nav" role="navigation" aria-label="Hauptnavigation"',
    )
    .replace(/<\/nav>(\s*<div class="rk-menu-panel")/, '</div>$1')
    .replace(/<\/nav>\s*$/, '</div>')
    .replace(/^<footer class="rk-footer"/, '<div class="rk-footer" role="contentinfo"')
    .replace(/<\/footer>\s*$/, '</div>')
}

/** Nav-Leiste und Mobile-Menü getrennt — Legacy-Skripte dürfen nur #main-content mutieren. */
export function getNavParts(): { bar: string; menuPanel: string } {
  const full = getStaticComponentHtml('nav.html')
  const splitAt = full.indexOf(MENU_PANEL_MARKER)
  if (splitAt === -1) {
    return { bar: adaptLandmarkHtml(full), menuPanel: '' }
  }
  return {
    bar: adaptLandmarkHtml(full.slice(0, splitAt)),
    menuPanel: full.slice(splitAt),
  }
}

export function getFooterHtml(): string {
  return adaptLandmarkHtml(getStaticComponentHtml('footer.html'))
}
