export type TemplateId =
  | 'bold_minimal'
  | 'warm_heritage'
  | 'cool_professional'
  | 'fresh_editorial'
  | 'dark_mode'

export type ClientStatus = 'draft' | 'preview' | 'live'

export interface ClientData {
  _meta: {
    schema_version: string
    template: TemplateId
    // raw intake fields preserved for copywrite module
    jenis_bisnes?: string
    cerita_bisnes?: string
    target_pelanggan?: string
    order_id?: string
  }
  project: {
    slug: string
    subdomain: string
    page_url: string
    status: ClientStatus
    created_at: string
  }
  seo: {
    business_name: string
    tagline: string
    seo_description: string
    seo_keywords: string
    og_image: string
    favicon?: string
    current_year: string
    opening_hours_schema?: string
    geo_lat?: string
    geo_lng?: string
    price_range?: string
  }
  hero: {
    hero_headline_part1: string
    hero_headline_part2: string
    hero_badge?: string
    hero_badge_bottom?: string
    hero_image: string
    hero_image_alt: string
    logo_image?: string
    logo_alt?: string
  }
  about: {
    about_title: string
    about_paragraph_1: string
    about_paragraph_2?: string
    about_image?: string
    about_image_alt?: string
    rating_text?: string
  }
  stats: {
    stat_1_number?: string; stat_1_label?: string
    stat_2_number?: string; stat_2_label?: string
    stat_3_number?: string; stat_3_label?: string
    stat_4_number?: string; stat_4_label?: string
  }
  products: {
    products_title: string
    products_subtitle?: string
    items: Array<{
      id: number
      name: string
      desc: string
      price?: string
      image?: string
    }>
  }
  gallery: {
    gallery_title?: string
    gallery_subtitle?: string
    images: Array<{ id: number; url: string; alt: string }>
    enabled: boolean
  }
  testimonials: {
    enabled: boolean
    items: Array<{ id: number; quote: string; name: string; business?: string }>
  }
  location: {
    location_title?: string
    location_subtitle?: string
    location_short: string
    address_street: string
    address_locality: string
    address_region: string
    address_postal: string
    full_address: string
    google_maps_embed?: string
    waze_link?: string
    geo_lat?: string
    geo_lng?: string
    operating_hours: string
    hours_short: string
    enabled: boolean
  }
  contact: {
    contact_phone: string
    contact_phone_display: string
    contact_email?: string
    whatsapp_link: string
    whatsapp_message?: string
    cta_email?: string
  }
  cta: {
    cta_title: string
    cta_desc?: string
    cta_primary_text: string
    cta_secondary_text?: string
    cta_button_text: string
    cta_call_text?: string
  }
  social: {
    social_title?: string
    social_subtitle?: string
    links: {
      instagram?: string
      facebook?: string
      tiktok?: string
    }
    embed: {
      enabled: boolean
      type: 'none' | 'facebook_page' | 'instagram_post' | 'tiktok_video'
      facebook_page?: { enabled: boolean; page_url?: string; embed_html?: string }
      instagram_post?: { enabled: boolean; post_url?: string; embed_html?: string }
      tiktok_video?: { enabled: boolean; video_url?: string; embed_html?: string }
    }
  }
  design?: {
    accent_color?: string
    accent_color_hover?: string
    custom_css?: string
  }
}

export type CopyOutput = {
  hero_headline_part1: string
  hero_headline_part2: string
  hero_badge: string
  tagline: string
  about_title: string
  about_paragraph_1: string
  about_paragraph_2: string
  products_title: string
  products_subtitle: string
  gallery_title: string
  gallery_subtitle: string
  location_title: string
  location_subtitle: string
  social_title: string
  social_subtitle: string
  cta_title: string
  cta_desc: string
  cta_primary_text: string
  cta_button_text: string
  seo_description: string
  seo_keywords: string
}

export type ModuleStatus = 'idle' | 'in_progress' | 'complete'

export interface AppState {
  activeClient: ClientData | null
  moduleStatus: {
    intake: ModuleStatus
    assets: ModuleStatus
    copywrite: ModuleStatus
    build: ModuleStatus
    preview: ModuleStatus
    deploy: ModuleStatus
  }
}
