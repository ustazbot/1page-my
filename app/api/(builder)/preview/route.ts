import { NextRequest, NextResponse } from 'next/server'
import { deployToPreview } from '@/lib/cloudflare'

export async function POST(req: NextRequest) {
  const { slug } = await req.json() as { slug: string }

  if (!slug) {
    return NextResponse.json({ error: 'slug diperlukan' }, { status: 400 })
  }

  try {
    const url = await deployToPreview(slug)
    return NextResponse.json({ url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Deploy gagal'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
