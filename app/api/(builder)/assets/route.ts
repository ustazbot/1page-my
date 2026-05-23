import { NextRequest, NextResponse } from 'next/server'
import { processImage } from '@/lib/images'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const slot = form.get('slot') as string | null
    const slug = form.get('slug') as string | null

    if (!file || !slot || !slug) {
      return NextResponse.json({ error: 'file, slot, slug required' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await processImage(buffer, slot, slug, file.name)

    return NextResponse.json({
      publicPath: result.publicPath,
      originalSize: result.originalSize,
      processedSize: result.processedSize,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Processing failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
