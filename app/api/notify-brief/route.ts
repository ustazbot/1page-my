import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const { name, kawasan, whatsapp, id } = await req.json()

  try {
    await sendTelegramMessage(
      `🗳️ *Brief Calon Baru*\n\n` +
      `Nama: ${name}\n` +
      `Kawasan: ${kawasan}\n` +
      `WhatsApp: ${whatsapp}\n` +
      `ID: #${(id as string).slice(0, 8).toUpperCase()}\n\n` +
      `Urus: https://1page.my/admin/candidates/${id}`
    )
  } catch {
    // Notification failure must not fail the response — submission already saved
  }

  return NextResponse.json({ ok: true })
}
