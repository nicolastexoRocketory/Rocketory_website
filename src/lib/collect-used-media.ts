import fs from 'fs'
import path from 'path'

import type { Payload } from 'payload'

const SCAN_ROOTS = ['legacy', 'src', 'public/js']
const SKIP_DIR_NAMES = new Set(['node_modules', '.next', '.git'])

const MEDIA_FILE_PATTERN = /\/api\/media\/file\/([^?"'\s#<>]+)/g
const ASSET_IMAGE_PATTERN = /(?:\/|\.\.\/)?assets\/images\/[^\s"'#<>]+/g

function normalizeAssetSitePath(href: string): string {
  const cleaned = href.split('?')[0].split('#')[0].replace(/^(\.\.\/)+/, '')
  const withSlash = cleaned.startsWith('/') ? cleaned : `/${cleaned}`
  return withSlash.startsWith('/assets/images/') ? withSlash : ''
}

function walkTextFiles(dir: string, files: string[]) {
  if (!fs.existsSync(dir)) return

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR_NAMES.has(entry.name)) continue

    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkTextFiles(fullPath, files)
      continue
    }

    if (!entry.isFile()) continue
    if (!/\.(html|tsx?|jsx?|json|md|css)$/i.test(entry.name)) continue
    files.push(fullPath)
  }
}

export function collectAssetSitePathsFromText(text: string, used: Set<string>) {
  for (const match of text.matchAll(ASSET_IMAGE_PATTERN)) {
    const path = normalizeAssetSitePath(match[0])
    if (path) used.add(path)
  }
}

export function collectMediaFilenamesFromText(text: string, used: Set<string>) {
  for (const match of text.matchAll(MEDIA_FILE_PATTERN)) {
    used.add(decodeURIComponent(match[1]))
  }
}

export function collectMediaUsageFromFilesystem(cwd = process.cwd()): {
  filenames: Set<string>
  assetPaths: Set<string>
} {
  const filenames = new Set<string>()
  const assetPaths = new Set<string>()
  const files: string[] = []

  for (const root of SCAN_ROOTS) {
    walkTextFiles(path.join(cwd, root), files)
  }

  for (const filePath of files) {
    const text = fs.readFileSync(filePath, 'utf-8')
    collectMediaFilenamesFromText(text, filenames)
    collectAssetSitePathsFromText(text, assetPaths)
  }

  return { filenames, assetPaths }
}

export function collectMediaFilenamesFromFilesystem(cwd = process.cwd()): Set<string> {
  return collectMediaUsageFromFilesystem(cwd).filenames
}

export async function collectUsedMediaFilenames(payload: Payload): Promise<Set<string>> {
  const { filenames: used, assetPaths } = collectMediaUsageFromFilesystem()

  const [posts, projects, mediaWithSitePath] = await Promise.all([
    payload.find({ collection: 'posts', limit: 1000, pagination: false, depth: 1 }),
    payload.find({ collection: 'projects', limit: 1000, pagination: false, depth: 1 }),
    assetPaths.size > 0
      ? payload.find({
          collection: 'media',
          where: { sitePath: { in: [...assetPaths] } },
          limit: 2000,
          pagination: false,
          depth: 0,
        })
      : Promise.resolve({ docs: [] as { filename?: string | null }[] }),
  ])

  for (const doc of mediaWithSitePath.docs) {
    if (doc.filename) used.add(doc.filename)
  }

  for (const doc of [...posts.docs, ...projects.docs]) {
    if (doc.legacyHtml) {
      collectMediaFilenamesFromText(doc.legacyHtml, used)
      collectAssetSitePathsFromText(doc.legacyHtml, assetPaths)
    }

    if ('contentIntro' in doc && doc.contentIntro) {
      collectMediaFilenamesFromText(doc.contentIntro, used)
      collectAssetSitePathsFromText(doc.contentIntro, assetPaths)
    }

    for (const section of doc.contentSections || []) {
      if (!section?.body) continue
      collectMediaFilenamesFromText(section.body, used)
      collectAssetSitePathsFromText(section.body, assetPaths)
    }

    const heroImage = doc.heroImage
    if (heroImage && typeof heroImage === 'object' && heroImage.filename) {
      used.add(heroImage.filename)
    }

    const seo = 'seo' in doc ? doc.seo : null
    const ogImage = seo && typeof seo === 'object' && 'ogImage' in seo ? seo.ogImage : null
    if (ogImage && typeof ogImage === 'object' && ogImage.filename) {
      used.add(ogImage.filename)
    }
  }

  return used
}

export async function collectUsedMediaIds(payload: Payload): Promise<Set<number>> {
  const ids = new Set<number>()
  const [posts, projects] = await Promise.all([
    payload.find({ collection: 'posts', limit: 1000, pagination: false, depth: 0 }),
    payload.find({ collection: 'projects', limit: 1000, pagination: false, depth: 0 }),
  ])

  for (const doc of [...posts.docs, ...projects.docs]) {
    if (typeof doc.heroImage === 'number') ids.add(doc.heroImage)
    const seo = 'seo' in doc ? doc.seo : null
    const ogImage = seo && typeof seo === 'object' && 'ogImage' in seo ? seo.ogImage : null
    if (typeof ogImage === 'number') ids.add(ogImage)
  }

  return ids
}
