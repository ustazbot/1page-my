// app/candidate/[subdomain]/types.ts

export interface CandidateBrief {
  id: string
  full_name: string
  preferred_name: string | null
  kawasan: string
  kawasan_jenis: string
  parti_name: string
  tagline: string | null
  photo_url: string | null
  parti_logo_url: string | null
  kawasan_image_url: string | null
  galeri_urls: string[]
  fokus: string[]
  isu_kawasan: { masalah: string; penyelesaian: string }[]
  profil_ringkas: string | null
  pencapaian: string[]
  quote_peribadi: string | null
  mengapa_bertanding: string | null
  testimoni: { quote: string; nama: string; kawasan_asal: string }[]
  whatsapp: string | null
  facebook_url: string | null
  instagram_url: string | null
  tiktok_url: string | null
  subdomain: string
  warna_utama: string | null
  bahasa: string
  is_live: boolean
  ai_copy: { tagline?: string; mengapa_bertanding?: string; ayat_penutup?: string } | null
  // new fields
  template_id: string
  umur: number | null
  bilangan_anak: number | null
  tahun_pengalaman: number | null
  nama_syarikat: string | null
}
