import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, kawasan, whatsapp, id } = await req.json()

  if (process.env.MAKE_WEBHOOK_URL) {
    await fetch(process.env.MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, kawasan, whatsapp, id }),
    })
  }

  return NextResponse.json({ ok: true })
}
