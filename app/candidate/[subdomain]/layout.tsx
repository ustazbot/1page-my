// app/candidate/[subdomain]/layout.tsx
import {
  Playfair_Display,
  DM_Sans,
  Source_Serif_4,
  Lora,
  Plus_Jakarta_Sans,
  Syne,
  Inter,
  Bebas_Neue,
} from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm',
  display: 'swap',
})
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
  display: 'swap',
})
const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
})
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})
const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
  display: 'swap',
})
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
})
const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
  display: 'swap',
})

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const fontVars = [
    playfair.variable, dmSans.variable, sourceSerif.variable,
    lora.variable, jakarta.variable, syne.variable, inter.variable,
    bebas.variable,
  ].join(' ')
  return <div className={fontVars}>{children}</div>
}
