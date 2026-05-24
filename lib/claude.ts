import { generateText, streamText } from './ai'
import type { CopyOutput } from '@/types/client'

const SYSTEM_PROMPT = `You are a Malaysian copywriter specialising in landing pages for small local businesses.
Write in natural Bahasa Malaysia mixed with English where appropriate (Manglish-aware but professional).
All copy must be:
- Honest: never invent metrics, testimonials, or claims not given in the brief
- Concise: headlines max 8 words, subheadlines max 20 words
- Local: use Malaysian context, not generic Western marketing language
- Action-oriented: every section should push toward the WhatsApp/call CTA

Return ONLY valid JSON matching the requested structure. No markdown. No explanation.`

export interface CopyBrief {
  business_name: string
  industry: string
  products: string
  target_audience: string
  location: string
  usp: string
  tone: 'Profesional' | 'Mesra' | 'Bold' | 'Warm'
  language: 'BM' | 'BM+English'
}

export async function generateCopy(
  brief: CopyBrief,
  provider?: 'claude' | 'deepseek'
): Promise<CopyOutput> {
  const userPrompt = buildCopyPrompt(brief)
  const raw = await generateText(SYSTEM_PROMPT, userPrompt, provider)

  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned) as CopyOutput
}

export async function* streamCopy(
  brief: CopyBrief,
  provider?: 'claude' | 'deepseek'
): AsyncGenerator<string> {
  const userPrompt = buildCopyPrompt(brief)
  yield* streamText(SYSTEM_PROMPT, userPrompt, provider)
}

export async function regenerateField(
  fieldName: string,
  currentValue: string,
  brief: CopyBrief,
  provider?: 'claude' | 'deepseek'
): Promise<string> {
  const prompt = `Tulis semula field "${fieldName}" untuk bisnes berikut.
Nilai semasa: "${currentValue}"
Bisnes: ${brief.business_name}
Industri: ${brief.industry}
USP: ${brief.usp}
Tone: ${brief.tone}
Bahasa: ${brief.language}

Return ONLY the new value as plain text. No JSON. No explanation.`

  return generateText(SYSTEM_PROMPT, prompt, provider)
}

function buildCopyPrompt(brief: CopyBrief): string {
  return `Hasilkan copy landing page untuk bisnes berikut:

Nama Bisnes: ${brief.business_name}
Industri/Kategori: ${brief.industry}
Servis/Produk Utama: ${brief.products}
Target Pelanggan: ${brief.target_audience}
Lokasi: ${brief.location}
Unique Selling Point: ${brief.usp}
Tone: ${brief.tone}
Bahasa: ${brief.language}

Return JSON dengan struktur tepat seperti ini:
{
  "hero_headline_part1": "",
  "hero_headline_part2": "",
  "hero_badge": "",
  "tagline": "",
  "about_title": "",
  "about_paragraph_1": "",
  "about_paragraph_2": "",
  "products_title": "",
  "products_subtitle": "",
  "gallery_title": "",
  "gallery_subtitle": "",
  "location_title": "",
  "location_subtitle": "",
  "social_title": "",
  "social_subtitle": "",
  "cta_title": "",
  "cta_desc": "",
  "cta_primary_text": "",
  "cta_button_text": "",
  "seo_description": "",
  "seo_keywords": ""
}`
}
