import fs from 'fs'
import path from 'path'

import { transformAssets, transformLinks } from './static-html'
import { normalizeLegacySpacedUrls } from './normalize-external-url'

export type LegacyPageData = {
  title: string
  content: string
  scripts: string[]
  styles: string[]
  pageClass?: string
}

function normalizeAssetPath(href: string): string {
  return href
    .replace(/^(\.\.\/)+assets\//, '/assets/')
    .replace(/^assets\//, '/assets/')
    .replace(/\?v=\d+/, '')
}

function normalizeScriptPath(src: string): string {
  return src
    .replace(/^(\.\.\/)+js\//, '/js/')
    .replace(/^js\//, '/js/')
    .replace(/\?v=\d+/, '')
}

function extractPageClass(html: string): string | undefined {
  const match = html.match(/<div class="rk\s+([^"]+)"/)
  const extra = match?.[1]?.trim()
  return extra || undefined
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

export function extractLegacyLead(html: string): string | undefined {
  const match = html.match(/<p class="rk-page-lead[^"]*">([\s\S]*?)<\/p>/i)
  if (!match) return undefined

  return decodeHtmlEntities(match[1].replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .trim()
}

export function getLegacyPageLead(relativePath: string): string | undefined {
  const filePath = path.join(process.cwd(), 'legacy', relativePath)
  if (!fs.existsSync(filePath)) return undefined
  const html = fs.readFileSync(filePath, 'utf-8')
  return extractLegacyLead(html)
}

export function getLegacyPage(relativePath: string): LegacyPageData {
  const filePath = path.join(process.cwd(), 'legacy', relativePath)
  const html = fs.readFileSync(filePath, 'utf-8')

  const titleMatch = html.match(/<title>([^<]*)<\/title>/i)
  const title = decodeHtmlEntities(titleMatch?.[1]?.trim() || 'Rocketory')

  const navMarker = '<div id="rk-nav-mount"></div>'
  const footerMarker = '<div id="rk-footer-mount"></div>'
  const navEnd = html.indexOf(navMarker)
  const footerStart = html.indexOf(footerMarker)

  let content = html
  if (navEnd !== -1 && footerStart !== -1) {
    content = html.slice(navEnd + navMarker.length, footerStart)
  } else {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    content = bodyMatch?.[1] || html
  }

  content = normalizeLegacySpacedUrls(transformAssets(transformLinks(content))).trim()

  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)]
    .map((match) => normalizeScriptPath(match[1]))
    .filter(
      (src) =>
        !src.includes('includes.js') &&
        !src.includes('components/nav.js') &&
        !src.includes('lenis'),
    )

  const styles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((match) =>
    normalizeAssetPath(match[1]),
  )

  return { title, content, scripts, styles, pageClass: extractPageClass(html) }
}

export const BLOG_SLUGS = [
  'human-in-the-loop-qualitaetskontrolle-webdesign',
  'eu-ai-act-ki-verordnung-webdesign',
  'zusammenarbeit-individueller-fahrplan',
  'wordpress-2026-schlank-schnell-richtig',
  'limbic-map-farben-zielgruppengerechtes-design',
  'wie-eine-lokale-website-mehr-anfragen-bringt',
  'statisches-html-maximale-performance',
  'wordpress-flexibles-cms',
] as const

export type BlogSlug = (typeof BLOG_SLUGS)[number]

export function getBlogLegacyPage(slug: string): LegacyPageData | null {
  const filePath = path.join(process.cwd(), 'legacy', 'blog', `${slug}.html`)
  if (!fs.existsSync(filePath)) return null
  return getLegacyPage(`blog/${slug}.html`)
}
