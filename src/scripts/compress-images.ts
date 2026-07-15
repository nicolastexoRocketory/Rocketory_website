import fs from 'fs/promises'
import path from 'path'

import sharp from 'sharp'

const ROOT = process.cwd()
const TARGET_DIRS = [
  path.join(ROOT, 'public', 'assets', 'images'),
  path.join(ROOT, 'media'),
]

const MAX_WIDTH = 1920
const JPEG_QUALITY = 82
const WEBP_QUALITY = 82
const WEBP_ALPHA_QUALITY = 80
const MIN_BYTES_TO_PROCESS = 40_000
const MIN_SAVINGS_RATIO = 0.08

type Conversion = {
  from: string
  to: string
}

type Result = {
  file: string
  before: number
  after: number
  action: string
}

async function walkImages(dir: string, files: string[]): Promise<void> {
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walkImages(fullPath, files)
      continue
    }

    if (!entry.isFile()) continue
    const ext = path.extname(entry.name).toLowerCase()
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue
    files.push(fullPath)
  }
}

function rel(filePath: string): string {
  return path.relative(ROOT, filePath).replace(/\\/g, '/')
}

async function compressRaster(filePath: string): Promise<{ result: Result; conversion?: Conversion }> {
  const before = (await fs.stat(filePath)).size
  if (before < MIN_BYTES_TO_PROCESS) {
    return {
      result: { file: rel(filePath), before, after: before, action: 'skip-small' },
    }
  }

  const input = await fs.readFile(filePath)
  const meta = await sharp(input).metadata()
  const ext = path.extname(filePath).toLowerCase()
  const inMedia = filePath.includes(`${path.sep}media${path.sep}`)

  let pipeline = sharp(input, { animated: false })
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true })
  }

  if (ext === '.webp') {
    const output = await pipeline.webp({ quality: WEBP_QUALITY, effort: 6 }).toBuffer()
    if (output.length >= before * (1 - MIN_SAVINGS_RATIO)) {
      return { result: { file: rel(filePath), before, after: before, action: 'skip-no-gain' } }
    }
    await fs.writeFile(filePath, output)
    return { result: { file: rel(filePath), before, after: output.length, action: 'webp-in-place' } }
  }

  if (ext === '.jpg' || ext === '.jpeg') {
    const output = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer()
    if (output.length >= before * (1 - MIN_SAVINGS_RATIO)) {
      return { result: { file: rel(filePath), before, after: before, action: 'skip-no-gain' } }
    }
    await fs.writeFile(filePath, output)
    return { result: { file: rel(filePath), before, after: output.length, action: 'jpeg-in-place' } }
  }

  if (ext === '.png') {
    const webpOutput = await pipeline
      .webp({
        quality: WEBP_QUALITY,
        alphaQuality: WEBP_ALPHA_QUALITY,
        effort: 6,
      })
      .toBuffer()

    if (!inMedia && webpOutput.length <= before * (1 - MIN_SAVINGS_RATIO)) {
      const webpPath = filePath.replace(/\.png$/i, '.webp')
      await fs.writeFile(webpPath, webpOutput)
      await fs.unlink(filePath)
      return {
        result: {
          file: rel(filePath),
          before,
          after: webpOutput.length,
          action: 'png-to-webp',
        },
        conversion: {
          from: path.basename(filePath),
          to: path.basename(webpPath),
        },
      }
    }

    const pngOutput = await pipeline
      .png({ compressionLevel: 9, palette: !meta.hasAlpha && before > 250_000 })
      .toBuffer()

    if (pngOutput.length >= before * (1 - MIN_SAVINGS_RATIO)) {
      return { result: { file: rel(filePath), before, after: before, action: 'skip-no-gain' } }
    }

    await fs.writeFile(filePath, pngOutput)
    return { result: { file: rel(filePath), before, after: pngOutput.length, action: 'png-in-place' } }
  }

  return { result: { file: rel(filePath), before, after: before, action: 'skip-unknown' } }
}

async function updateReferences(conversions: Conversion[]): Promise<number> {
  if (conversions.length === 0) return 0

  const filesToScan: string[] = []
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.next') continue
        await walk(fullPath)
        continue
      }
      if (!/\.(html|ts|tsx|css|js|json)$/.test(entry.name)) continue
      filesToScan.push(fullPath)
    }
  }

  await walk(path.join(ROOT, 'legacy'))
  await walk(path.join(ROOT, 'src'))

  let updatedFiles = 0

  for (const filePath of filesToScan) {
    let content = await fs.readFile(filePath, 'utf8')
    let changed = false

    for (const { from, to } of conversions) {
      if (!content.includes(from)) continue
      content = content.split(from).join(to)
      changed = true
    }

    if (changed) {
      await fs.writeFile(filePath, content)
      updatedFiles += 1
    }
  }

  return updatedFiles
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

async function main() {
  const files: string[] = []
  for (const dir of TARGET_DIRS) {
    await walkImages(dir, files)
  }

  const results: Result[] = []
  const conversions: Conversion[] = []

  for (const filePath of files.sort()) {
    const { result, conversion } = await compressRaster(filePath)
    results.push(result)
    if (conversion) conversions.push(conversion)
  }

  const updatedFiles = await updateReferences(conversions)

  const processed = results.filter((r) => !r.action.startsWith('skip'))
  const beforeTotal = processed.reduce((sum, r) => sum + r.before, 0)
  const afterTotal = processed.reduce((sum, r) => sum + r.after, 0)
  const saved = beforeTotal - afterTotal

  console.log(`Verarbeitet: ${processed.length} von ${results.length} Bildern`)
  if (saved > 0) {
    console.log(`Gespart: ${formatBytes(saved)} (${Math.round((saved / beforeTotal) * 100)}%)`)
  }
  console.log(`Referenzen aktualisiert in ${updatedFiles} Dateien`)

  for (const result of processed.sort((a, b) => b.before - b.after - (a.before - a.after))) {
    const delta = result.before - result.after
    if (delta <= 0) continue
    console.log(
      `- ${result.file}: ${formatBytes(result.before)} → ${formatBytes(result.after)} (${result.action}, -${Math.round((delta / result.before) * 100)}%)`,
    )
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
