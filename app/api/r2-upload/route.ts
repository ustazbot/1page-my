import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2 } from '@/lib/r2'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const subdomain = formData.get('subdomain') as string | null
    const type = formData.get('type') as string | null // 'photo' | 'parti-logo'

    if (!file || !subdomain || !type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const key = `candidates/${subdomain}/${type}.${ext}`
    const buffer = await file.arrayBuffer()

    const publicUrl = await uploadToR2(key, buffer, file.type)

    return NextResponse.json({ publicUrl })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
