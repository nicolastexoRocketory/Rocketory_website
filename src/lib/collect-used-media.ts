import fs from 'fs'
import path from 'path'

import type { Payload } from 'payload'

const SCAN_ROOTS = ['legacy', 'src', 'public/js']
const SKIP_DIR_NAMES = new Set(['node_modules', '.next', '.git'])

const MEDIA_FILE_PATTERN = /\/api\/media\/file\/([^?"'\s#<>]+)/g

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
    if (!/\.(html|tsx?|jsx?|json|md)$/i.test(entry.name)) continue
    files.push(fullPath)
  }
}

export function collectMediaFilenamesFromText(text: string, used: Set<string>) {
  for (const match of text.matchAll(MEDIA_FILE_PATTERN)) {
    used.add(decodeURIComponent(match[1]))
  }
}

export function collectMediaFilenamesFromFilesystem(cwd = process.cwd()): Set<string> {
  const used = new Set<string>()
  const files: string[] = []

  for (const root of SCAN_ROOTS) {
    walkTextFiles(path.join(cwd, root), files)
  }

  for (const filePath of files) {
    collectMediaFilenamesFromText(fs.readFileSync(filePath, 'utf-8'), used)
  }

  return used
}

export async function collectUsedMediaFilenames(payload: Payload): Promise<Set<string>> {
  const used = collectMediaFilenamesFromFilesystem()

  const [posts, projects] = await Promise.all([
    payload.find({ collection: 'posts', limit: 1000, pagination: false, depth: 1 }),
    payload.find({ collection: 'projects', limit: 1000, pagination: false, depth: 1 }),
  ])

  for (const doc of [...posts.docs, ...projects.docs]) {
    if (doc.legacyHtml) {
      collectMediaFilenamesFromText(doc.legacyHtml, used)
    }

    const heroImage = doc.heroImage
    if (heroImage && typeof heroImage === 'object' && heroImage.filename) {
      used.add(heroImage.filename)
    }
  }

  return used
}
