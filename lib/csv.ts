// CSV parser + Google Forms column mapper — no external dependencies

export interface SheetRow {
  timestamp: string
  business_name: string
  tagline: string
  template_choice: string
  whatsapp: string
  phone: string
  email: string
  address: string
  operating_hours: string
  products: string
  instagram: string
  facebook: string
  tiktok: string
  hero_image_link: string
  logo_link: string
  gallery_links: string
  subdomain_pref_1: string
  subdomain_pref_2: string
  subdomain_pref_3: string
  subdomain_pref_4: string
  subdomain_pref_5: string
  notes: string
}

// Keyword rules to map any Google Form column header → SheetRow field
const COLUMN_MAP: Array<{ field: keyof SheetRow; keywords: string[] }> = [
  { field: 'timestamp',       keywords: ['timestamp', 'masa', 'tarikh'] },
  { field: 'business_name',   keywords: ['business name', 'nama bisnes', 'nama perniagaan', 'nama syarikat'] },
  { field: 'tagline',         keywords: ['tagline', 'slogan', 'motto'] },
  { field: 'template_choice', keywords: ['template', 'pilihan reka', 'design choice'] },
  { field: 'whatsapp',        keywords: ['whatsapp', 'wp', 'wa number', 'nombor whatsapp'] },
  { field: 'phone',           keywords: ['phone', 'telefon', 'tel ', 'nombor telefon', 'contact number'] },
  { field: 'email',           keywords: ['email', 'emel', 'e-mail'] },
  { field: 'address',         keywords: ['address', 'alamat', 'lokasi'] },
  { field: 'operating_hours', keywords: ['operating hours', 'waktu operasi', 'waktu buka', 'business hours'] },
  { field: 'products',        keywords: ['product', 'produk', 'service', 'servis', 'menu'] },
  { field: 'instagram',       keywords: ['instagram', 'ig '] },
  { field: 'facebook',        keywords: ['facebook', 'fb '] },
  { field: 'tiktok',          keywords: ['tiktok', 'tt '] },
  { field: 'hero_image_link', keywords: ['hero image', 'gambar hero', 'main image', 'cover image'] },
  { field: 'logo_link',       keywords: ['logo'] },
  { field: 'gallery_links',   keywords: ['gallery', 'galeri', 'additional image', 'gambar tambahan'] },
  { field: 'subdomain_pref_1',keywords: ['subdomain 1', 'subdomain preference 1', 'domain 1', 'nama domain 1'] },
  { field: 'subdomain_pref_2',keywords: ['subdomain 2', 'subdomain preference 2', 'domain 2'] },
  { field: 'subdomain_pref_3',keywords: ['subdomain 3', 'subdomain preference 3', 'domain 3'] },
  { field: 'subdomain_pref_4',keywords: ['subdomain 4', 'subdomain preference 4', 'domain 4'] },
  { field: 'subdomain_pref_5',keywords: ['subdomain 5', 'subdomain preference 5', 'domain 5'] },
  { field: 'notes',           keywords: ['note', 'nota', 'additional', 'tambahan', 'comment', 'komen'] },
]

function matchColumn(header: string): keyof SheetRow | null {
  const h = header.toLowerCase().trim()
  for (const { field, keywords } of COLUMN_MAP) {
    if (keywords.some((k) => h.includes(k))) return field
  }
  return null
}

// RFC 4180 CSV parser — handles quoted fields, embedded commas, newlines
function parseCSVRaw(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  let i = 0

  while (i < text.length) {
    const ch = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"'
        i += 2
      } else if (ch === '"') {
        inQuotes = false
        i++
      } else {
        cell += ch
        i++
      }
    } else {
      if (ch === '"') {
        inQuotes = true
        i++
      } else if (ch === ',') {
        row.push(cell.trim())
        cell = ''
        i++
      } else if (ch === '\r' && next === '\n') {
        row.push(cell.trim())
        rows.push(row)
        row = []
        cell = ''
        i += 2
      } else if (ch === '\n' || ch === '\r') {
        row.push(cell.trim())
        rows.push(row)
        row = []
        cell = ''
        i++
      } else {
        cell += ch
        i++
      }
    }
  }

  // last row
  if (cell || row.length) {
    row.push(cell.trim())
    if (row.some((c) => c !== '')) rows.push(row)
  }

  return rows
}

export interface ParseResult {
  rows: SheetRow[]
  unmappedHeaders: string[]
  totalRows: number
}

export function parseCSV(csvText: string): ParseResult {
  const raw = parseCSVRaw(csvText)
  if (raw.length < 2) return { rows: [], unmappedHeaders: [], totalRows: 0 }

  const headers = raw[0]
  const dataRows = raw.slice(1).filter((r) => r.some((c) => c !== ''))

  // Build index: column position → SheetRow field
  const colIndex: Array<keyof SheetRow | null> = headers.map(matchColumn)

  const unmappedHeaders = headers
    .filter((_, i) => colIndex[i] === null)
    .filter((h) => h.trim() !== '')

  const rows: SheetRow[] = dataRows.map((cells) => {
    const row: SheetRow = {
      timestamp: '', business_name: '', tagline: '', template_choice: '',
      whatsapp: '', phone: '', email: '', address: '', operating_hours: '',
      products: '', instagram: '', facebook: '', tiktok: '',
      hero_image_link: '', logo_link: '', gallery_links: '',
      subdomain_pref_1: '', subdomain_pref_2: '', subdomain_pref_3: '',
      subdomain_pref_4: '', subdomain_pref_5: '', notes: '',
    }
    cells.forEach((val, i) => {
      const field = colIndex[i]
      if (field) row[field] = val
    })
    return row
  })

  return { rows, unmappedHeaders, totalRows: rows.length }
}

export function rowKey(row: SheetRow): string {
  return `${row.timestamp}|${row.business_name}`
}

export function assessRow(row: SheetRow): {
  status: 'ready' | 'incomplete' | 'critical'
  missing: string[]
  filled: string[]
} {
  const required: Array<[keyof SheetRow, string]> = [
    ['business_name', 'Nama Bisnes'],
    ['whatsapp', 'WhatsApp'],
    ['phone', 'Telefon'],
    ['address', 'Alamat'],
    ['operating_hours', 'Waktu Operasi'],
    ['products', 'Produk/Servis'],
    ['hero_image_link', 'Hero Image'],
  ]

  const optional: Array<[keyof SheetRow, string]> = [
    ['tagline', 'Tagline'],
    ['email', 'Email'],
    ['instagram', 'Instagram'],
    ['facebook', 'Facebook'],
    ['logo_link', 'Logo'],
    ['gallery_links', 'Gallery'],
  ]

  const missing: string[] = []
  const filled: string[] = []

  for (const [field, label] of required) {
    if (!row[field]) missing.push(label)
    else filled.push(label)
  }
  for (const [field, label] of optional) {
    if (row[field]) filled.push(label)
  }

  const critical = ['Nama Bisnes', 'WhatsApp', 'Alamat']
  const status =
    missing.length === 0
      ? 'ready'
      : missing.some((m) => critical.includes(m))
      ? 'critical'
      : 'incomplete'

  return { status, missing, filled }
}
