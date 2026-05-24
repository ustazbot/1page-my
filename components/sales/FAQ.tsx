'use client'
import { useState } from 'react'
import AnimateIn from './AnimateIn'

const faqs = [
  {
    q: 'Berapa lama nak siap?',
    a: 'Preview siap dalam 24 jam bekerja. Lepas anda approve, deploy dalam masa sejam.',
  },
  {
    q: 'Boleh edit sendiri lepas deploy?',
    a: 'Sebelum deploy, anda akan terima preview untuk semak. Masa ni boleh minta ubah percuma. Selepas page live, sebarang edit dikenakan RM50 per sesi.',
  },
  {
    q: 'Hosting kat mana?',
    a: 'Cloudflare Pages — laju, selamat, dan percuma untuk anda. Anda tak perlu bayar hosting langsung.',
  },
  {
    q: 'Ada berapa template untuk pilih?',
    a: '5 template merangkumi pelbagai niche dan industri. Anda pilih, kami customize ikut bisnes anda.',
  },
  {
    q: 'Boleh guna domain sendiri?',
    a: 'Boleh. Setup domain anda sendiri dikenakan RM30 (one-time). Atau kami boleh uruskan domain baru pada RM120/tahun.',
  },
]

function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div
      style={{
        borderBottom: '1px solid #E7E5E4',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          padding: 'clamp(18px, 2.5vw, 24px) 0',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          gap: 16,
          textAlign: 'left',
        }}
      >
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            letterSpacing: '-0.02em',
            color: '#1C1917',
            lineHeight: 1.3,
          }}
        >
          {q}
        </span>
        <span
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: open ? '#F97316' : '#F8F6F1',
            border: `1.5px solid ${open ? '#F97316' : '#E7E5E4'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.25s ease, border-color 0.25s ease, transform 0.25s ease',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <line x1="6" y1="0" x2="6" y2="12" stroke={open ? 'white' : '#78716C'} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="0" y1="6" x2="12" y2="6" stroke={open ? 'white' : '#78716C'} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </span>
      </button>

      <div
        style={{
          maxHeight: open ? 300 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(14px, 1.7vw, 17px)',
            lineHeight: 1.7,
            color: '#78716C',
            margin: '0 0 24px',
            paddingRight: 44,
          }}
        >
          {a}
        </p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section
      style={{
        background: '#FFFFFF',
        padding: 'clamp(64px, 10vw, 112px) clamp(20px, 5vw, 60px)',
        position: 'relative',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          right: 0,
          height: 60,
          background: '#F97316',
          clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
        }}
      />

      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <AnimateIn>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#F97316',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Soal Jawab
          </p>
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 48px)',
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              color: '#1C1917',
              marginBottom: 'clamp(36px, 5vw, 56px)',
            }}
          >
            Soalan yang kerap ditanya.
          </h2>
        </AnimateIn>

        <AnimateIn delay={80}>
          <div>
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                q={faq.q}
                a={faq.a}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
