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
    'Landing page professional untuk bisnes anda. Cepat, mudah, RM150. Preview percuma sebelum bayar. Siap dalam 24 jam bekerja.',
  openGraph: {
    title: '1page.my — Landing Page untuk Bisnes Anda',
    description: 'Landing page professional untuk bisnes anda. Preview percuma · Bayar lepas setuju · RM150',
    type: 'website',
    locale: 'ms_MY',
  },
}

export default function SalesPage() {
  return (
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
  )
}
