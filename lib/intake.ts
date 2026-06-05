import type { SheetRow } from './csv'
import type { ClientData, TemplateId } from '@/types/client'

export type SupabaseOrder = {
  id: string
  created_at: string
  nama_bisnes: string
  tagline?: string
  jenis_bisnes?: string
  cerita_bisnes?: string
  produk_servis?: string
  target_pelanggan?: string
  nama_owner: string
  whatsapp: string
  telefon?: string
  email?: string
  alamat?: string
  waktu_operasi?: string
  google_maps_link?: string
  instagram?: string
  facebook?: string
  tiktok?: string
  banner_atas_url?: string
  logo_url?: string
  gallery_urls?: string[]
  template_pilihan?: string
  domain_pref_1?: string
  domain_pref_2?: string
  domain_pref_3?: string
  catatan?: string
}

const TEMPLATE_MAP: Record<string, TemplateId> = {
  'bold minimal': 'bold_minimal',
  'bold_minimal': 'bold_minimal',
  'warm heritage': 'warm_heritage',
  'warm_heritage': 'warm_heritage',
  'cool professional': 'cool_professional',
  'cool_professional': 'cool_professional',
  'fresh editorial': 'fresh_editorial',
  'fresh_editorial': 'fresh_editorial',
  'dark mode': 'dark_mode',
  'dark_mode': 'dark_mode',
}

function resolveTemplate(raw: string): TemplateId {
  const key = raw.toLowerCase().trim()
  return TEMPLATE_MAP[key] ?? 'bold_minimal'
}

function formatWhatsApp(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  const normalized = digits.startsWith('0') ? '6' + digits.slice(1) : digits
  return `https://wa.me/${normalized}`
}

function formatPhone(raw: string): string {
  // normalize to +60XXXXXXXXX
  const digits = raw.replace(/\D/g, '')
  return digits.startsWith('0') ? '+6' + digits : '+' + digits
}

function parseProducts(raw: string): ClientData['products']['items'] {
  // Try JSON first
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 6).map((item, i) => ({
        id: i + 1,
        name: String(item.name ?? item),
        desc: String(item.desc ?? item.description ?? ''),
        price: item.price ? String(item.price) : undefined,
        image: item.image ?? undefined,
      }))
    }
  } catch {}

  // Fallback: split by newline or comma
  const lines = raw
    .split(/\n|,/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 6)

  return lines.map((line, i) => ({
    id: i + 1,
    name: line,
    desc: '',
  }))
}

function buildGoogleMapsEmbed(link: string, address: string): string {
  if (!link && !address) return ''
  // Already an embed URL
  if (link && (link.includes('google.com/maps/embed') || link.includes('output=embed'))) return link
  // Extract coordinates from standard Google Maps URL (@lat,lng)
  if (link) {
    const coord = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (coord) return `https://maps.google.com/maps?q=${coord[1]},${coord[2]}&output=embed&z=17`
  }
  // Fallback: use address search (always works for any address)
  const q = address || link
  return q ? `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed` : ''
}

function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

export function sheetRowToClientData(row: SheetRow): ClientData {
  const slug = row.subdomain_pref_1
    ? generateSlug(row.subdomain_pref_1)
    : generateSlug(row.business_name)

  const subdomain = slug.replace(/-/g, '')
  const template = resolveTemplate(row.template_choice)

  return {
    _meta: {
      schema_version: '1.0.0',
      template,
    },
    project: {
      slug,
      subdomain,
      page_url: `https://${subdomain}.${process.env.NEXT_PUBLIC_LIVE_DOMAIN ?? '1page.my'}`,
      status: 'draft',
      created_at: row.timestamp || new Date().toISOString().split('T')[0],
    },
    seo: {
      business_name: row.business_name,
      tagline: row.tagline || '',
      seo_description: '',
      seo_keywords: '',
      og_image: row.hero_image_link || '',
      current_year: String(new Date().getFullYear()),
    },
    hero: {
      hero_headline_part1: '',
      hero_headline_part2: '',
      hero_image: row.hero_image_link || '',
      hero_image_alt: row.business_name,
      logo_image: row.logo_link || undefined,
      logo_alt: row.business_name,
    },
    about: {
      about_title: 'Tentang Kami',
      about_paragraph_1: '',
    },
    stats: {},
    products: {
      products_title: 'Produk & Servis',
      items: row.products ? parseProducts(row.products) : [],
    },
    gallery: {
      images: row.gallery_links
        ? row.gallery_links
            .split(/\n|,/)
            .map((url, i) => ({ id: i + 1, url: url.trim(), alt: '' }))
            .filter((img) => img.url)
            .slice(0, 6)
        : [],
      enabled: !!row.gallery_links,
    },
    testimonials: {
      enabled: false,
      items: [],
    },
    location: {
      location_short: '',
      address_street: '',
      address_locality: '',
      address_region: '',
      address_postal: '',
      full_address: row.address || '',
      operating_hours: row.operating_hours || '',
      hours_short: row.operating_hours || '',
      enabled: !!row.address,
    },
    contact: {
      contact_phone: row.phone ? formatPhone(row.phone) : '',
      contact_phone_display: row.phone || '',
      contact_email: row.email || undefined,
      whatsapp_link: row.whatsapp ? formatWhatsApp(row.whatsapp) : '',
      whatsapp_message: `Saya berminat untuk bertanya tentang servis ${row.business_name}.`,
    },
    cta: {
      cta_title: 'Hubungi Kami',
      cta_primary_text: 'WhatsApp Kami Sekarang',
      cta_button_text: 'Hubungi Kami',
    },
    social: {
      links: {
        instagram: row.instagram || undefined,
        facebook: row.facebook || undefined,
        tiktok: row.tiktok || undefined,
      },
      embed: {
        enabled: false,
        type: 'none',
      },
    },
  }
}

export function orderToClientData(order: SupabaseOrder): ClientData {
  const slug = order.domain_pref_1
    ? generateSlug(order.domain_pref_1)
    : generateSlug(order.nama_bisnes)

  const subdomain = slug.replace(/-/g, '')
  const template = resolveTemplate(order.template_pilihan ?? '')

  const galleryImages: ClientData['gallery']['images'] = (order.gallery_urls ?? [])
    .filter(Boolean)
    .slice(0, 6)
    .map((url, i) => ({ id: i + 1, url, alt: '' }))

  return {
    _meta: {
      schema_version: '1.0.0',
      template,
      order_id: order.id,
      jenis_bisnes: order.jenis_bisnes || undefined,
      cerita_bisnes: order.cerita_bisnes || undefined,
      target_pelanggan: order.target_pelanggan || undefined,
    },
    project: {
      slug,
      subdomain,
      page_url: `https://${subdomain}.${process.env.NEXT_PUBLIC_LIVE_DOMAIN ?? '1page.my'}`,
      status: 'draft',
      created_at: order.created_at.split('T')[0],
    },
    seo: {
      business_name: order.nama_bisnes,
      tagline: order.tagline || '',
      seo_description: '',
      seo_keywords: '',
      og_image: order.banner_atas_url || '',
      current_year: String(new Date().getFullYear()),
    },
    hero: {
      hero_headline_part1: '',
      hero_headline_part2: '',
      hero_image: order.banner_atas_url || '',
      hero_image_alt: order.nama_bisnes,
      logo_image: order.logo_url || undefined,
      logo_alt: order.nama_bisnes,
    },
    about: {
      about_title: 'Tentang Kami',
      about_paragraph_1: order.cerita_bisnes || '',
    },
    stats: {},
    products: {
      products_title: 'Produk & Servis',
      items: order.produk_servis ? parseProducts(order.produk_servis) : [],
    },
    gallery: {
      images: galleryImages,
      enabled: galleryImages.length > 0,
    },
    testimonials: {
      enabled: false,
      items: [],
    },
    location: {
      location_short: '',
      address_street: '',
      address_locality: '',
      address_region: '',
      address_postal: '',
      full_address: order.alamat || '',
      google_maps_embed: buildGoogleMapsEmbed(order.google_maps_link || '', order.alamat || '') || undefined,
      waze_link: order.google_maps_link || undefined,
      operating_hours: order.waktu_operasi || '',
      hours_short: order.waktu_operasi || '',
      enabled: !!(order.alamat || order.waktu_operasi),
    },
    contact: {
      contact_phone: order.telefon ? formatPhone(order.telefon) : '',
      contact_phone_display: order.telefon || '',
      contact_email: order.email || undefined,
      whatsapp_link: order.whatsapp ? formatWhatsApp(order.whatsapp) : '',
      whatsapp_message: `Saya berminat untuk bertanya tentang servis ${order.nama_bisnes}.`,
    },
    cta: {
      cta_title: 'Hubungi Kami',
      cta_primary_text: 'WhatsApp Kami Sekarang',
      cta_button_text: 'Hubungi Kami',
    },
    social: {
      links: {
        instagram: order.instagram || undefined,
        facebook: order.facebook || undefined,
        tiktok: order.tiktok || undefined,
      },
      embed: {
        enabled: false,
        type: 'none',
      },
    },
  }
}
