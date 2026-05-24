import 'server-only'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

export type ImageSlot =
  | 'hero'
  | 'logo'
  | 'og'
  | 'about'
  | `gallery_${1 | 2 | 3 | 4 | 5 | 6}`
  | `product_${1 | 2 | 3 | 4 | 5 | 6}`

interface ProcessConfig {
  width: number
  height?: number
  format: 'webp' | 'png' | 'jpeg'
  quality: number
  fit?: keyof sharp.FitEnum
}

const SLOT_CONFIG: Record<string, ProcessConfig> = {
  hero: { width: 1200, format: 'webp', quality: 85 },
  logo: { width: 400, format: 'png', quality: 100 },
  og: { width: 1200, height: 630, format: 'jpeg', quality: 90, fit: 'cover' },
  about: { width: 800, format: 'webp', quality: 85 },
}

for (let i = 1; i <= 6; i++) {
  SLOT_CONFIG[`gallery_${i}`] = { width: 800, format: 'webp', quality: 80 }
  SLOT_CONFIG[`product_${i}`] = { width: 600, format: 'webp', quality: 80 }
}

export async function processImage(
  inputBuffer: Buffer,
  slot: string,
  slug: string,
  originalName: string
): Promise<{
  outputPath: string
  publicPath: string
  originalSize: number
  processedSize: number
}> {
  const config = SLOT_CONFIG[slot] ?? { width: 1200, format: 'webp', quality: 85 }
  const outputDir = path.join(process.cwd(), 'public', 'clients', slug, 'assets')
  await fs.mkdir(outputDir, { recursive: true })

  const ext = config.format === 'png' ? 'png' : config.format === 'jpeg' ? 'jpg' : 'webp'
  const filename = `${slot}.${ext}`
  const outputPath = path.join(outputDir, filename)

  let pipeline = sharp(inputBuffer).resize({
    width: config.width,
    height: config.height,
    fit: config.fit ?? 'inside',
    withoutEnlargement: true,
  })

  if (config.format === 'webp') {
    pipeline = pipeline.webp({ quality: config.quality })
  } else if (config.format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality: config.quality })
  } else {
    pipeline = pipeline.png({ compressionLevel: 9 })
  }

  const outputBuffer = await pipeline.toBuffer()
  await fs.writeFile(outputPath, outputBuffer)

  return {
    outputPath,
    publicPath: `/clients/${slug}/assets/${filename}`,
    originalSize: inputBuffer.length,
    processedSize: outputBuffer.length,
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function reductionPercent(original: number, processed: number): number {
  return Math.round((1 - processed / original) * 100)
}
