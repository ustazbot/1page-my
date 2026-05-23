import { NextRequest, NextResponse } from 'next/server'
import { regenerateField } from '@/lib/claude'
import type { CopyBrief } from '@/lib/claude'

export async function POST(req: NextRequest) {
  const { fieldName, currentValue, brief, provider } = await req.json() as {
    fieldName: string
    currentValue: string
    brief: CopyBrief
    provider?: 'claude' | 'deepseek'
  }

  try {
    const result = await regenerateField(fieldName, currentValue, brief, provider)
    return NextResponse.json({ value: result.trim() })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Regen failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
