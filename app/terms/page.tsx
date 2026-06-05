import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terma & Syarat | 1page.my',
  description: 'Terma dan syarat penggunaan perkhidmatan 1page.my.',
}

export default function TermsPage() {
  return (
    <main
      style={{
        fontFamily: "'DM Sans', sans-serif",
        maxWidth: 760,
        margin: '0 auto',
        padding: 'clamp(40px, 8vw, 80px) clamp(20px, 5vw, 40px)',
      }}
    >
      <h1
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(28px, 5vw, 40px)',
          color: '#1C1917',
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}
      >
        Terma &amp; Syarat
      </h1>
      <p style={{ fontSize: 13, color: '#a8a29e', marginBottom: 40 }}>
        Dikemaskini: Jun 2026
      </p>

      <p
        style={{
          fontSize: 15,
          lineHeight: 1.8,
          color: '#57534E',
        }}
      >
        Kandungan terma dan syarat sedang dikemaskini. Untuk sebarang pertanyaan
        berkaitan penggunaan perkhidmatan 1page.my, sila hubungi kami di{' '}
        <a
          href="mailto:hello@1page.my"
          style={{ color: '#F97316', textDecoration: 'none' }}
        >
          hello@1page.my
        </a>
        .
      </p>
    </main>
  )
}
