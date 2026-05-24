import fs from 'fs/promises'
import path from 'path'
import type { ClientData, TemplateId } from '@/types/client'

export async function loadTemplate(templateId: TemplateId): Promise<string> {
  const filePath = path.join(process.cwd(), 'templates', `${templateId}.html`)
  return fs.readFile(filePath, 'utf-8')
}

export function flattenClientData(data: ClientData): Record<string, string> {
  const flat: Record<string, string> = {}

  const walk = (obj: unknown, prefix = '') => {
    if (obj === null || obj === undefined) return
    if (typeof obj !== 'object') {
      if (prefix) flat[prefix] = String(obj)
      return
    }
    if (Array.isArray(obj)) return
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      walk(v, prefix ? `${prefix}_${k}` : k)
    }
  }

  walk(data.seo)
  walk(data.hero)
  walk(data.about)
  walk(data.stats)
  walk(data.location)
  walk(data.contact)
  walk(data.cta)

  flat['products_title'] = data.products.products_title
  if (data.products.products_subtitle)
    flat['products_subtitle'] = data.products.products_subtitle

  for (const item of data.products.items) {
    flat[`product_${item.id}_name`] = item.name
    flat[`product_${item.id}_desc`] = item.desc
    if (item.price) flat[`product_${item.id}_price`] = item.price
    if (item.image) flat[`product_${item.id}_image`] = item.image
  }

  if (data.gallery.gallery_title)
    flat['gallery_title'] = data.gallery.gallery_title
  if (data.gallery.gallery_subtitle)
    flat['gallery_subtitle'] = data.gallery.gallery_subtitle

  for (const img of data.gallery.images) {
    if (img.url) flat[`gallery_${img.id}_image`] = img.url
    if (img.alt) flat[`gallery_${img.id}_alt`] = img.alt
  }

  if (data.social.social_title) flat['social_title'] = data.social.social_title
  if (data.social.social_subtitle) flat['social_subtitle'] = data.social.social_subtitle
  flat['social_instagram'] = data.social.links.instagram ?? ''
  flat['social_facebook'] = data.social.links.facebook ?? ''
  flat['social_tiktok'] = data.social.links.tiktok ?? ''

  flat['page_url'] = data.project.page_url
  flat['slug'] = data.project.slug

  return flat
}

const SECTION_TOGGLES: Array<{
  key: keyof ClientData
  subKey: string
  startMarker: string
  endMarker: string
}> = [
  {
    key: 'gallery',
    subKey: 'enabled',
    startMarker: '<!-- GALLERY_START -->',
    endMarker: '<!-- GALLERY_END -->',
  },
  {
    key: 'testimonials',
    subKey: 'enabled',
    startMarker: '<!-- TESTIMONIALS_START -->',
    endMarker: '<!-- TESTIMONIALS_END -->',
  },
  {
    key: 'location',
    subKey: 'enabled',
    startMarker: '<!-- LOCATION_START -->',
    endMarker: '<!-- LOCATION_END -->',
  },
]

export function injectTemplate(html: string, data: ClientData): {
  result: string
  warnings: string[]
} {
  let result = html
  const warnings: string[] = []

  for (const toggle of SECTION_TOGGLES) {
    const section = data[toggle.key] as Record<string, unknown>
    const enabled = section[toggle.subKey] as boolean

    if (!enabled) {
      const start = result.indexOf(toggle.startMarker)
      const end = result.indexOf(toggle.endMarker)
      if (start !== -1 && end !== -1) {
        result =
          result.slice(0, start) +
          result.slice(end + toggle.endMarker.length)
      }
    }
  }

  if (data.social.embed.enabled && data.social.embed.type !== 'none') {
    // Has embed: hide plain links, inject embed HTML
    const type = data.social.embed.type
    const embedData = data.social.embed[type]
    const embedHtml = embedData?.embed_html
      ? `<div class="social-embed">${embedData.embed_html}</div>`
      : ''

    // Remove plain links block
    result = result.replace(
      /<!-- SOCIAL_LINKS_START -->[\s\S]*?<!-- SOCIAL_LINKS_END -->/,
      ''
    )
    result = result.replace('<!-- SOCIAL_EMBED_HTML -->', embedHtml)
  } else {
    // No embed: keep plain links, remove markers only
    result = result.replace('<!-- SOCIAL_LINKS_START -->', '')
    result = result.replace('<!-- SOCIAL_LINKS_END -->', '')
    result = result.replace('<!-- SOCIAL_EMBED_HTML -->', '')
  }

  const flat = flattenClientData(data)

  if (data.design?.accent_color) {
    result = result.replace(
      /--color-accent:\s*[^;]+;/g,
      `--color-accent: ${data.design.accent_color};`
    )
  }
  if (data.design?.accent_color_hover) {
    result = result.replace(
      /--color-accent-hover:\s*[^;]+;/g,
      `--color-accent-hover: ${data.design.accent_color_hover};`
    )
  }

  if (data.design?.custom_css) {
    result = result.replace(
      '</style>',
      `/* custom */\n${data.design.custom_css}\n</style>`
    )
  }

  for (const [key, value] of Object.entries(flat)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
    result = result.replace(regex, value)
  }

  result = result.replace(/\{\{\s*logo_image\s*\}\}/g, data.hero.logo_image ?? '')
  result = result.replace(/\{\{\s*logo_alt\s*\}\}/g, data.hero.logo_alt ?? data.seo.business_name)

  if (!data.hero.logo_image) {
    const initials = data.seo.business_name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
    result = result.replace(
      '<!-- LOGO_FALLBACK -->',
      `<div class="logo-fallback">${initials}</div>`
    )
  }

  const remaining = [...result.matchAll(/\{\{\s*(\w+)\s*\}\}/g)]
  for (const match of remaining) {
    warnings.push(`Unfilled variable: {{ ${match[1]} }}`)
  }

  return { result, warnings }
}

export async function buildAndSavePage(data: ClientData): Promise<{
  outputPath: string
  warnings: string[]
}> {
  const html = await loadTemplate(data._meta.template)
  const { result, warnings } = injectTemplate(html, data)

  const outputDir = path.join(
    process.cwd(),
    'public',
    'clients',
    data.project.slug
  )
  await fs.mkdir(outputDir, { recursive: true })

  const outputPath = path.join(outputDir, 'index.html')
  await fs.writeFile(outputPath, result, 'utf-8')

  return { outputPath, warnings }
}
