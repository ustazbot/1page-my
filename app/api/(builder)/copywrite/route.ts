import { NextRequest } from 'next/server'
import { streamCopy } from '@/lib/claude'
import type { CopyBrief } from '@/lib/claude'

export async function POST(req: NextRequest) {
  const { brief, provider } = await req.json() as {
    brief: CopyBrief
    provider?: 'claude' | 'deepseek'
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamCopy(brief, provider)) {
          controller.enqueue(new TextEncoder().encode(chunk))
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Stream error'
        controller.enqueue(new TextEncoder().encode(`\n__ERROR__${msg}`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
    },
  })
}
