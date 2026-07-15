import fs from 'fs'
import path from 'path'

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

export async function syncWebsiteMedia(payload: Payload) {
  const files = collectWebsiteImagePaths();
  const existing = await payload.find({
    collection: 'media',
    limit: 2000,
    pagination: false,
  });

  const byFilename = new Map(existing.docs.map((doc) => [doc.filename, doc]));
  let created = 0;
  let skipped = 0;

  for (const filePath of files) {
    const filename = path.basename(filePath);
    const title = humanizeFilename(filename);

    if (byFilename.has(filename)) {
      const current = byFilename.get(filename)!;
      if (!current.title?.trim()) {
        await payload.update({
          collection: 'media',
          id: current.id,
          data: { title },
        });
        console.log(`Media-Titel ergänzt: ${title}`);
      } else {
        skipped += 1;
      }
      continue;
    }

    await payload.create({
      collection: 'media',
      data: {
        title,
        alt: title,
      },
      filePath,
    });

    created += 1;
    console.log(`Media importiert: ${filename}`);
  }

  return { created, skipped, total: files.length };
}
