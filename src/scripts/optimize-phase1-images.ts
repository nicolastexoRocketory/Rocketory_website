import fs from 'fs/promises'
import path from 'path'

import sharp from 'sharp'

const ROOT = process.cwd()
const IMAGES = path.join(ROOT, 'public', 'assets', 'images')

type Job = {
  input: string
  output: string
  width?: number
  height?: number
  quality?: number
}

const jobs: Job[] = [
  { input: 'team-raketenstart.png', output: 'team-raketenstart.webp', width: 1024, quality: 82 },
  { input: 'angebote-teaser-astronaut.png', output: 'angebote-teaser-astronaut.webp', width: 1024, quality: 82 },
  { input: 'angebote-tech-stack.png', output: 'angebote-tech-stack.webp', width: 1024, quality: 82 },
  { input: 'ki-vo-bridge-bg.png', output: 'ki-vo-bridge-bg.webp', width: 1024, quality: 82 },
  { input: 'team-rocketory.png', output: 'team-rocketory.webp', width: 1024, quality: 82 },
  { input: 'nasa-earth-space.jpg', output: 'nasa-earth-space.webp', width: 1920, quality: 80 },
  {
    input: 'ansprechpartner-nicolas-zhigalov.png',
    output: 'ansprechpartner-nicolas-zhigalov.webp',
    width: 192,
    height: 192,
    quality: 82,
  },
  { input: 'rocketory-o-icon.png', output: 'rocketory-o-icon.webp', quality: 90 },
]

async function optimizeJob(job: Job): Promise<void> {
  const inputPath = path.join(IMAGES, job.input)
  const outputPath = path.join(IMAGES, job.output)

  let pipeline = sharp(await fs.readFile(inputPath))
  if (job.width || job.height) {
    pipeline = pipeline.resize({
      width: job.width,
      height: job.height,
      fit: job.height ? 'cover' : 'inside',
      withoutEnlargement: true,
    })
  }

  const output = await pipeline.webp({ quality: job.quality ?? 82, effort: 6 }).toBuffer()
  await fs.writeFile(outputPath, output)

  const [before, after] = await Promise.all([fs.stat(inputPath), fs.stat(outputPath)])
  console.log(
    `${job.input} → ${job.output}: ${Math.round(before.size / 1024)} KB → ${Math.round(after.size / 1024)} KB`,
  )
}

async function main() {
  for (const job of jobs) {
    await optimizeJob(job)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
