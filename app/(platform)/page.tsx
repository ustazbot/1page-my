import type { Metadata } from 'next'
import Navbar from '@/components/sales/Navbar'
import Hero from '@/components/sales/Hero'
import PainPoints from '@/components/sales/PainPoints'
import Testimonials from '@/components/sales/Testimonials'
import HowItWorks from '@/components/sales/HowItWorks'
import WhatYouGet from '@/components/sales/WhatYouGet'
import TemplateGallery from '@/components/sales/TemplateGallery'
import Pricing from '@/components/sales/Pricing'
import FAQ from '@/components/sales/FAQ'
import CTABanner from '@/components/sales/CTABanner'
import Footer from '@/components/sales/Footer'
import FloatingWhatsApp from '@/components/sales/FloatingWhatsApp'

export const metadata: Metadata = {
  title: '1page.my — Landing Page untuk Bisnes Anda',
  description:
    'Landing page professional untuk peniaga kecil Malaysia. Cepat, mudah, RM150. Preview percuma sebelum bayar. Siap dalam 24 jam bekerja.',
  metadataBase: new URL('https://1page.my'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '1page.my — Landing Page untuk Bisnes Anda',
    description: 'Landing page professional untuk peniaga kecil Malaysia. Preview percuma · Bayar lepas setuju · RM150',
    type: 'website',
    locale: 'ms_MY',
    url: 'https://1page.my',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '1page.my — Landing Page untuk Bisnes Anda',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '1page.my — Landing Page untuk Bisnes Anda',
    description: 'Landing page professional untuk peniaga kecil Malaysia. Preview percuma · Bayar lepas setuju · RM150',
    images: ['/og-image.png'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: '1page.my',
  description: 'Landing page professional untuk peniaga kecil Malaysia. Siap dalam 24 jam, RM150 sahaja.',
  url: 'https://1page.my',
  provider: {
    '@type': 'Organization',
    name: '1page.my',
    url: 'https://1page.my',
    sameAs: ['https://www.facebook.com/profile.php?id=61590152770680'],
  },
  areaServed: {
    '@type': 'Country',
    name: 'Malaysia',
  },
  offers: {
    '@type': 'Offer',
    price: '150',
    priceCurrency: 'MYR',
    description: '1 landing page professional, siap dalam 24 jam bekerja',
  },
  serviceType: 'Web Design',
}

export default function SalesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="sales-page">
        <Navbar />
        <Hero />
        <PainPoints />
        <Testimonials />
        <HowItWorks />
        <WhatYouGet />
        <TemplateGallery />
        <Pricing />
        <FAQ />
        <CTABanner />
        <Footer />
        <FloatingWhatsApp />
      </main>
    </>
  )
}
