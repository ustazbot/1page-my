// app/candidate/[subdomain]/layout.tsx
import { Playfair_Display, DM_Sans } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm',
  display: 'swap',
})

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${playfair.variable} ${dmSans.variable}`}>
      {children}
    </div>
  )
}
