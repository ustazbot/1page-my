import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/ai'

const SYSTEM = `Kamu adalah penulis kempen politik Malaysia yang mahir menulis teks autentik dan impactful untuk calon pilihanraya. Gaya penulisan kamu:
- Natural Bahasa Malaysia, boleh campur sedikit English jika sesuai
- Ikhlas dan genuine — tidak over-the-top atau plastik
- Emosional tapi bermaruah — sentuh hati pengundi tanpa hiperbola
- Kekal nada dan personaliti asal calon
Jangan tambah fakta, nombor, atau klaim yang tidak ada dalam teks asal.`

export async function POST(req: NextRequest) {
  let body: { teks: string; nama?: string; kawasan?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak sah' }, { status: 400 })
  }

  const { teks, nama = '', kawasan = '' } = body
  if (!teks?.trim()) {
    return NextResponse.json({ error: 'Teks diperlukan' }, { status: 400 })
  }

  const prompt = `Perbaiki teks berikut untuk ruangan "Mengapa Saya Bertanding" supaya lebih marketable dan impactful untuk kempen pilihanraya. Kekalkan nada asli dan keikhlasan calon.

Nama calon: ${nama || '(tidak dinyatakan)'}
Kawasan: ${kawasan || '(tidak dinyatakan)'}

Teks asal:
${teks}

Hasilkan HANYA teks yang diperbaiki. Tiada penjelasan. Tiada petikan. Tiada label.`

  try {
    const hasil = await generateText(SYSTEM, prompt)
    return NextResponse.json({ hasil: hasil.trim() })
  } catch (err) {
    console.error('[improve-text] error:', err)
    return NextResponse.json({ error: 'Gagal jana teks. Cuba lagi.' }, { status: 500 })
  }
}
