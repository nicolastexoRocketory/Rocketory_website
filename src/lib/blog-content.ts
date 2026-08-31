import { getStaticComponentHtml } from './static-html'

const BODY_END_MARKERS = [
  '<footer class="rk-blog-footer">',
  '<aside class="rk-blog-sidebar"',
  '<aside ',
  '<div id="rk-blog-sidebar-mount">',
]

/** Nur den Artikel-Body aus Legacy-/CMS-HTML extrahieren. */
export function extractBlogBodyHtml(html: string): string {
  const startMarker = '<div class="rk-blog-content">'
  const start = html.indexOf(startMarker)
  if (start === -1) return ''

  const contentStart = start + startMarker.length
  let contentEnd = html.length

  for (const marker of BODY_END_MARKERS) {
    const index = html.indexOf(marker, contentStart)
    if (index !== -1 && index < contentEnd) contentEnd = index
  }

  return normalizeExtractedBody(html.slice(contentStart, contentEnd))
}

function normalizeExtractedBody(html: string): string {
  let content = html.trim()

  // Legacy-Markup schließt rk-blog-content oft vor dem Footer, nicht ins Template übernehmen
  if (content.endsWith('</div>')) {
    const opens = (content.match(/<div\b/gi) || []).length
    const closes = (content.match(/<\/div>/gi) || []).length
    if (closes > opens) {
      content = content.replace(/<\/div>\s*$/i, '').trim()
    }
  }

  return balanceFragmentDivs(content)
}

function extractBlogMainBody(html: string): string {
  const startMarker = '<div class="rk-blog-main">'
  const start = html.indexOf(startMarker)
  if (start === -1) return ''

  const contentStart = start + startMarker.length
  let contentEnd = html.length

  for (const marker of BODY_END_MARKERS) {
    const index = html.indexOf(marker, contentStart)
    if (index !== -1 && index < contentEnd) contentEnd = index
  }

  const mainInner = html.slice(contentStart, contentEnd).trim()
  if (mainInner.includes('class="rk-blog-content"')) {
    return extractBlogBodyHtml(mainInner)
  }

  return mainInner
}

function balanceFragmentDivs(html: string): string {
  let result = html.trim()
  let opens = (result.match(/<div\b/gi) || []).length
  let closes = (result.match(/<\/div>/gi) || []).length

  while (closes > opens) {
    const last = result.lastIndexOf('</div>')
    if (last === -1) break
    result = `${result.slice(0, last).trimEnd()}${result.slice(last + 6).trimStart()}`
    closes--
  }

  while (opens > closes) {
    result = `${result}</div>`
    closes++
  }

  return result
}

function stripBlogSidebarMarkup(html: string): string {
  let result = html
    .replace(/<aside class="rk-blog-sidebar"[\s\S]*?<\/aside>/gi, '')
    .replace(/<div id="rk-blog-sidebar-mount">\s*<\/div>/gi, '')

  const sidebarMarkers = [
    '<aside class="rk-blog-sidebar"',
    '<div class="rk-blog-sidebar-block',
    '<nav class="rk-blog-sidebar-block',
  ]

  for (const marker of sidebarMarkers) {
    const index = result.indexOf(marker)
    if (index !== -1) result = result.slice(0, index).trim()
  }

  return result
}

function stripOuterBlogWrappers(html: string): string {
  let result = html.trim()

  const wrappers = [
    /^<article[^>]*>/i,
    /<\/article>$/i,
    /^<div class="rk-blog-layout"[^>]*>/i,
    /<\/div>\s*$/i,
    /^<div class="rk-blog-main"[^>]*>/i,
    /^<div class="rk-blog-content"[^>]*>/i,
    /<\/div>\s*$/i,
    /<footer class="rk-blog-footer"[\s\S]*?<\/footer>/gi,
  ]

  let changed = true
  while (changed) {
    changed = false
    for (const pattern of wrappers) {
      const next = result.replace(pattern, '').trim()
      if (next !== result) {
        result = next
        changed = true
      }
    }
  }

  return result
}

/** CMS-/Legacy-HTML auf reinen Artikelinhalt normalisieren (ohne Sidebar/Layout). */
export function normalizeBlogArticleHtml(html: string): string {
  const trimmed = html.trim()
  if (!trimmed) return '<p>Noch kein Inhalt hinterlegt.</p>'

  const fromContentBlock = extractBlogBodyHtml(trimmed)
  const fromMainBlock = fromContentBlock ? '' : extractBlogMainBody(trimmed)
  const raw = fromContentBlock || fromMainBlock || stripOuterBlogWrappers(trimmed)
  const cleaned = balanceFragmentDivs(stripBlogSidebarMarkup(raw).trim())

  return cleaned || '<p>Noch kein Inhalt hinterlegt.</p>'
}

export function getBlogSidebarHtml(): string {
  return getStaticComponentHtml('blog-sidebar.html')
}

/** JSON-LD als HTML-Script (nicht als React-<script>, um RSC-Parse-Fehler zu vermeiden). */
export function buildJsonLdScript(jsonLd: Record<string, unknown> | null | undefined): string {
  if (!jsonLd) return ''
  const safe = JSON.stringify(jsonLd).replace(/</g, '\\u003c')
  return `<script type="application/ld+json">${safe}</script>`
}

/** Sidebar in rk-blog-layout verschieben, falls sie als Geschwister außerhalb gelandet ist. */
export function repairBlogLayout(html: string): string {
  return html.replace(
    /(<div class="rk-blog-layout"[^>]*>[\s\S]*?<\/div>\s*)\s*((?:<!--[\s\S]*?-->\s*)*<aside class="rk-blog-sidebar"[\s\S]*?<\/aside>)\s*(<\/div>\s*<\/article>)/i,
    '$1\n          $2\n        $3',
  )
}

/** Sidebar serverseitig in die Layout-Spalte einsetzen (ersetzt leeren Mount). */
export function injectBlogSidebar(html: string): string {
  if (html.includes('class="rk-blog-sidebar"')) {
    return repairBlogLayout(html)
  }

  const sidebar = getBlogSidebarHtml()

  if (html.includes('id="rk-blog-sidebar-mount"')) {
    return repairBlogLayout(
      html.replace(/<div id="rk-blog-sidebar-mount">\s*<\/div>/i, sidebar),
    )
  }

  return stripBlogSidebarMarkup(html)
}
