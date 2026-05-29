// lib/candidate-colors.ts

export interface Palette {
  primary: string
  accent: string
  surface: string
  text_on_primary: string
}

export function generatePalette(warna_utama: string | null, parti_name: string): Palette {
  if (parti_name === 'Bebas' || !warna_utama) {
    return {
      primary: '#0d1f3c',
      accent: '#F0A500',
      surface: '#F8F6F1',
      text_on_primary: '#ffffff',
    }
  }
  const isDark = isColorDark(warna_utama)
  return {
    primary: warna_utama,
    accent: isDark ? '#C9A84C' : '#0d1f3c',
    surface: isDark ? '#F8F6F1' : '#0d1f3c',
    text_on_primary: '#ffffff',
  }
}

function isColorDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.5
}
