// app/bisnes/[subdomain]/types.ts

export interface BisnesOrder {
  id: string
  nama_bisnes: string
  tagline: string | null
  jenis_bisnes: string | null
  cerita_bisnes: string | null
  produk_servis: string
  target_pelanggan: string | null
  nama_owner: string
  whatsapp: string
  telefon: string
  email: string | null
  alamat: string
  waktu_operasi: string
  google_maps_link: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  banner_atas_url: string
  logo_url: string | null
  gallery_urls: string[] | null
  template_pilihan: string
  slug: string
  status: string
  stats_bar: { nilai: string; label: string }[] | null
  usp:       { tajuk: string; huraian: string }[] | null
  pakej:     { nama: string; harga: string; ciri: string[]; popular?: boolean }[] | null
  testimoni: { nama: string; dari: string; ulasan: string }[] | null
  faq:       { soalan: string; jawapan: string }[] | null
}
