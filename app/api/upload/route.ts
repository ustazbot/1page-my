import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2, deleteFromR2 } from '@/lib/r2'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif']

export async function POST(req: NextRequest) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak sah.' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) || 'misc'

  if (!file) return NextResponse.json({ error: 'Tiada fail dipilih.' }, { status: 400 })
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'Saiz fail terlalu besar (maks 5MB). Kompres gambar dahulu jika perlu.' },
      { status: 400 },
    )
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_EXT.includes(ext)) {
    return NextResponse.json(
      { error: 'Format tidak disokong. Guna JPG, PNG, atau WEBP.' },
      { status: 400 },
    )
  }

  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = await file.arrayBuffer()

  try {
    const url = await uploadToR2(key, buffer, file.type)
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[upload] R2 error:', err)
    return NextResponse.json({ error: 'Upload gagal. Cuba lagi.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  let body: { url?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: true })
  }
  if (body.url) await deleteFromR2(body.url)
  return NextResponse.json({ ok: true })
}
