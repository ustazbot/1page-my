import { NextRequest, NextResponse } from 'next/server'
import { buildAndSavePage } from '@/lib/templates'
import type { ClientData } from '@/types/client'

export async function POST(req: NextRequest) {
  const data = await req.json() as ClientData
  try {
    const { outputPath, warnings } = await buildAndSavePage(data)
    return NextResponse.json({ outputPath, warnings })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Build failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
