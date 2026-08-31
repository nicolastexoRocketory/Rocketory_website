import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'

import type { Payload } from 'payload'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'])

const SKIP_DIR_NAMES = new Set(['node_modules', '.next', '.git', 'media'])

function humanizeFilename(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
}

function isImageFile(filePath: string): boolean {
  return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase())
}

function walkImages(dir: string, files: string[]) {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR_NAMES.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkImages(fullPath, files);
      continue;
    }

    if (entry.isFile() && isImageFile(fullPath)) {
      files.push(fullPath);
    }
  }
}

function normalizeAssetKey(filePath: string, cwd: string): string {
  const relative = path.relative(cwd, filePath).replace(/\\/g, '/');

  if (relative.startsWith('public/assets/')) {
    return relative.slice('public/'.length);
  }

  if (relative.startsWith('assets/')) {
    return relative;
  }

  return relative;
}

export function collectWebsiteImagePaths(cwd = process.cwd()): string[] {
  const roots = [path.join(cwd, 'public', 'assets'), path.join(cwd, 'assets')];
  const discovered: string[] = [];
  const seenKeys = new Set<string>();

  for (const root of roots) {
    walkImages(root, discovered);
  }

  const unique: string[] = [];

  for (const filePath of discovered) {
    const key = normalizeAssetKey(filePath, cwd);
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    unique.push(filePath);
  }

  return unique.sort();
}

function sitePathFromFilePath(filePath: string, cwd: string): string {
  const key = normalizeAssetKey(filePath, cwd)
  return `/${key}`
}

function hashFile(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null
  return createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')
}

function storedMediaFilePath(filename?: string | null): string | null {
  if (!filename?.trim()) return null
  const filePath = path.join(process.cwd(), 'media', filename)
  return fs.existsSync(filePath) ? filePath : null
}

function removeStoredMediaVariants(filename?: string | null) {
  if (!filename?.trim()) return

  const mediaDir = path.join(process.cwd(), 'media')
  if (!fs.existsSync(mediaDir)) return

  const stem = path.parse(filename).name
  for (const entry of fs.readdirSync(mediaDir)) {
    if (entry === filename || entry.startsWith(`${stem}-`)) {
      fs.unlinkSync(path.join(mediaDir, entry))
    }
  }
}

function sourceMatchesStoredMedia(sourcePath: string, filename?: string | null): boolean {
  const storedPath = storedMediaFilePath(filename)
  if (!storedPath) return false

  const sourceHash = hashFile(sourcePath)
  const storedHash = hashFile(storedPath)
  return Boolean(sourceHash && storedHash && sourceHash === storedHash)
}

export async function syncWebsiteMedia(payload: Payload) {
  const files = collectWebsiteImagePaths();
  const existing = await payload.find({
    collection: 'media',
    limit: 2000,
    pagination: false,
  });

  const byFilename = new Map(existing.docs.map((doc) => [doc.filename, doc]));
  const bySitePath = new Map(
    existing.docs
      .filter((doc) => doc.sitePath)
      .map((doc) => [doc.sitePath as string, doc]),
  );
  let created = 0;
  let skipped = 0;
  let updated = 0;

  for (const filePath of files) {
    const filename = path.basename(filePath);
    const title = humanizeFilename(filename);
    const sitePath = sitePathFromFilePath(filePath, process.cwd());

    const currentByPath = bySitePath.get(sitePath);
    if (currentByPath) {
      const patch: { title?: string; alt?: string } = {}
      let refreshedFile = false

      if (!sourceMatchesStoredMedia(filePath, currentByPath.filename)) {
        removeStoredMediaVariants(currentByPath.filename)
        removeStoredMediaVariants(filename)

        await payload.update({
          collection: 'media',
          id: currentByPath.id,
          data: {
            title,
            alt: title,
          },
          filePath,
        })
        refreshedFile = true
        updated += 1
        console.log(`Media-Datei aktualisiert: ${filename} (${sitePath})`)
      }

      if (!refreshedFile && !currentByPath.title?.trim()) {
        patch.title = title
        patch.alt = title
      }

      if (!refreshedFile && Object.keys(patch).length > 0) {
        await payload.update({
          collection: 'media',
          id: currentByPath.id,
          data: patch,
        });
        updated += 1;
        console.log(`Media-Titel ergänzt: ${title}`);
      } else if (!refreshedFile) {
        skipped += 1;
      }
      continue;
    }

    if (byFilename.has(filename)) {
      const current = byFilename.get(filename)!;
      const patch: { title?: string; sitePath?: string } = {};

      if (!current.sitePath) patch.sitePath = sitePath;
      if (!current.title?.trim()) patch.title = title;

      if (Object.keys(patch).length > 0) {
        await payload.update({
          collection: 'media',
          id: current.id,
          data: patch,
        });
        updated += 1;
        console.log(`Media verknüpft: ${filename} → ${sitePath}`);
      } else {
        skipped += 1;
      }
      continue;
    }

    const createdDoc = await payload.create({
      collection: 'media',
      data: {
        title,
        alt: title,
        sitePath,
      },
      filePath,
    });

    byFilename.set(filename, createdDoc);
    bySitePath.set(sitePath, createdDoc);
    created += 1;
    console.log(`Media importiert: ${filename} (${sitePath})`);
  }

  return { created, skipped, updated, total: files.length };
}
