import { NextRequest, NextResponse } from 'next/server'
import { processImage } from '@/lib/images'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const { sourcePath, targetSlot, slug } = await req.json()

    if (!sourcePath || !targetSlot || !slug) {
      return NextResponse.json({ error: 'sourcePath, targetSlot, slug required' }, { status: 400 })
    }

    // Read existing processed image from public/
    const absolutePath = path.join(process.cwd(), 'public', sourcePath)
    const buffer = await fs.readFile(absolutePath)
    const originalName = path.basename(absolutePath)

    const result = await processImage(buffer, targetSlot, slug, originalName)

    return NextResponse.json({
      publicPath: result.publicPath,
      originalSize: result.originalSize,
      processedSize: result.processedSize,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Reuse failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
