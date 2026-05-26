import { Plus_Jakarta_Sans, DM_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm',
  display: 'swap',
})

export default function BisnesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${jakarta.variable} ${dmSans.variable}`}>
      {children}
    </div>
  )
}
