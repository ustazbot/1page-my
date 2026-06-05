import Anthropic from '@anthropic-ai/sdk'
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

export interface CTAVariant {
  id: number
  tone: 'direct' | 'soft' | 'value'
  cta_button_text: string
  cta_subtext: string
  cta_wa_message: string
}

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

const CTA_SYSTEM_PROMPT = `You are a Malaysian conversion copywriter specializing in WhatsApp-based small business landing pages.

Generate 3 CTA variants based on business info.

LANGUAGE RULES:
- Traditional/religious/herbal/food → Melayu tulen
- Modern services/tech/fashion → Melayu + English
- Professional services → formal Melayu or English
- If unsure → default Melayu

TONE by business type:
- Makanan & minuman → warm, jemputan
- Herba & kesihatan → tenang, amanah, no pressure
- Perkhidmatan → confident, hasil-focused
- Fesyen → aspirasi, lifestyle
- Pendidikan → nilai jangka panjang
- Runcit/hardware → praktikal, terus

PROHIBITED words (never use):
terbaik, eksklusif, terhad, percuma, sekarang, murah, luar biasa, amazing, jom, jangan tunggu, jangan lepaskan, last chance

OUTPUT: Valid JSON only. No markdown, no explanation.
{
  "cta_variants": [
    { "id": 1, "tone": "direct", "cta_button_text": "max 5 words", "cta_subtext": "max 12 words or empty string", "cta_wa_message": "natural 1-2 sentence opener" },
    { "id": 2, "tone": "soft",   "cta_button_text": "max 5 words", "cta_subtext": "max 12 words or empty string", "cta_wa_message": "natural 1-2 sentence opener" },
    { "id": 3, "tone": "value",  "cta_button_text": "max 5 words", "cta_subtext": "max 12 words or empty string", "cta_wa_message": "natural 1-2 sentence opener" }
  ]
}

Tone definitions:
- direct: action-forward, confident, no fluff
- soft: low pressure, conversational
- value: outcome/benefit focused, not urgency`

export async function generateCTA(brief: CopyBrief): Promise<CTAVariant[]> {
  const userPrompt = `Bisnes: ${brief.business_name}
Jenis bisnes: ${brief.industry}
Produk/servis utama: ${brief.products}
Target pelanggan: ${brief.target_audience}
Lokasi: ${brief.location}`

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    system: CTA_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('No text response from Claude')

  const cleaned = block.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned) as { cta_variants: CTAVariant[] }
  return parsed.cta_variants
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
