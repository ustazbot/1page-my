// app/daftar-calon/page.tsx
'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase'

const PARTI_LIST = [
  'UMNO', 'BN', 'PKR', 'DAP', 'AMANAH', 'BERSATU',
  'PAS', 'GPS', 'GRS', 'MUDA', 'Bebas', 'Lain-lain',
]

const KAWASAN_JENIS = ['DUN', 'Parlimen']

export default function DaftarCalonPage() {
  const supabase = supabaseBrowser()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submittedId, setSubmittedId] = useState<string | null>(null)

  const [form, setForm] = useState({
    full_name: '',
    preferred_name: '',
    kawasan_jenis: 'DUN',
    kawasan: '',
    parti_name: '',
    tagline: '',
    profil_ringkas: '',
    quote_peribadi: '',
    whatsapp: '',
    facebook_url: '',
    instagram_url: '',
    tiktok_url: '',
    bahasa: 'BM',
    warna_utama: '#1e3a5f',
    subdomain: '',
  })

  const [fokus, setFokus] = useState(['', '', ''])
  const [isu, setIsu] = useState([
    { masalah: '', penyelesaian: '' },
    { masalah: '', penyelesaian: '' },
    { masalah: '', penyelesaian: '' },
  ])
  const [pencapaian, setPencapaian] = useState(['', '', ''])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [partiLogoFile, setPartiLogoFile] = useState<File | null>(null)

  const handleNameChange = (val: string) => {
    setForm(prev => ({
      ...prev,
      full_name: val,
      subdomain: val
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-'),
    }))
  }

  const uploadFile = async (file: File, type: 'photo' | 'parti-logo'): Promise<string> => {
    const subdomain = form.subdomain || `temp-${Date.now()}`
    const fd = new FormData()
    fd.append('file', file)
    fd.append('subdomain', subdomain)
    fd.append('type', type)

    const res = await fetch('/api/r2-upload', { method: 'POST', body: fd })
    const { publicUrl } = await res.json()
    return publicUrl
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      let photo_url: string | null = null
      let parti_logo_url: string | null = null

      if (photoFile) photo_url = await uploadFile(photoFile, 'photo')
      if (partiLogoFile) parti_logo_url = await uploadFile(partiLogoFile, 'parti-logo')

      const fokus_clean = fokus.filter(f => f.trim())
      const isu_clean = isu.filter(i => i.masalah.trim())
      const pencapaian_clean = pencapaian.filter(p => p.trim())

      const payload = {
        ...form,
        photo_url,
        parti_logo_url,
        fokus: fokus_clean,
        isu_kawasan: isu_clean,
        pencapaian: pencapaian_clean,
      }

      // candidate_briefs is not in generated Supabase types yet — suppress until types are generated
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: _data, error } = await (supabase as any)
        .from('candidate_briefs')
        .insert(payload)
        .select('id')
        .single()

      if (error) throw error

      const record = _data as { id: string }

      await fetch('/api/notify-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.full_name,
          kawasan: form.kawasan,
          whatsapp: form.whatsapp,
          id: record.id,
        }),
      })

      setSubmittedId(record.id)
      setStep(2)
    } catch (err) {
      alert('Ralat semasa hantar. Cuba semula.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-6">
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl font-bold text-gray-900">Borang Berjaya Dihantar!</h1>
          <p className="text-gray-600">
            Terima kasih <strong>{form.preferred_name || form.full_name}</strong>.
            Pasukan kami akan menghubungi anda dalam masa 24 jam.
          </p>
          <div className="border-2 border-orange-200 rounded-xl p-4 bg-orange-50">
            <p className="text-sm font-semibold text-orange-800 mb-2">Bayar Sekarang (Online)</p>
            <p className="text-xs text-orange-700 mb-3">RM800 — One-time payment</p>
            <a
              href={`https://toyyibpay.com/1page-special?ref=${submittedId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Bayar via ToyyibPay →
            </a>
          </div>
          <div className="text-sm text-gray-500">
            <p className="font-medium text-gray-700 mb-1">Atau bayar manual:</p>
            <p>DuitNow / Bank Transfer</p>
            <p className="text-xs mt-1">Pasukan kami akan hantar butiran via WhatsApp</p>
          </div>
          <p className="text-xs text-gray-400">Rujukan: #{submittedId?.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Daftar Laman Calon</h1>
          <p className="text-gray-500 mt-2">Landing page profesional untuk calon pilihanraya — RM800</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">

          {/* A: Maklumat Calon */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">A. Maklumat Calon</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Penuh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Cth: Hafiz bin Abdul Rahman"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Panggilan / Gelaran</label>
                <input
                  type="text"
                  value={form.preferred_name}
                  onChange={e => setForm(p => ({ ...p, preferred_name: e.target.value }))}
                  placeholder="Cth: YB Hafiz / Dr. Siti"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Kawasan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.kawasan_jenis}
                    onChange={e => setForm(p => ({ ...p, kawasan_jenis: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    {KAWASAN_JENIS.map(j => <option key={j}>{j}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Kawasan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.kawasan}
                    onChange={e => setForm(p => ({ ...p, kawasan: e.target.value }))}
                    placeholder="Cth: Bukit Gombak"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parti <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.parti_name}
                  onChange={e => setForm(p => ({ ...p, parti_name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">-- Pilih Parti --</option>
                  {PARTI_LIST.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tagline Peribadi
                  <span className="text-gray-400 text-xs ml-2">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))}
                  placeholder="Cth: Untuk Rakyat Bukit Gombak"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain yang dikehendaki</label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-orange-400">
                  <input
                    type="text"
                    value={form.subdomain}
                    onChange={e => setForm(p => ({ ...p, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    placeholder="hafiz-gombak"
                    className="flex-1 px-4 py-2.5 text-sm focus:outline-none"
                  />
                  <span className="bg-gray-50 px-3 py-2.5 text-sm text-gray-500 border-l border-gray-200">.1page.my</span>
                </div>
              </div>
            </div>
          </section>

          {/* B: Gambar & Logo */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">B. Gambar & Logo</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto Calon <span className="text-red-500">*</span>
                  <span className="text-gray-400 text-xs ml-2">(JPG/PNG, muka jelas)</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={e => setPhotoFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo Parti
                  <span className="text-gray-400 text-xs ml-2">(PNG transparent)</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={e => setPartiLogoFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
                <p className="text-xs text-gray-400 mt-1">Anda bertanggungjawab memastikan penggunaan logo parti adalah sah.</p>
              </div>
            </div>
          </section>

          {/* C: Fokus & Misi */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">C. Fokus & Misi</h2>
            <p className="text-xs text-gray-500 mb-3">Nyatakan 3-5 perkara utama yang anda fokuskan</p>
            <div className="space-y-2">
              {fokus.map((f, i) => (
                <input
                  key={i}
                  type="text"
                  value={f}
                  onChange={e => {
                    const updated = [...fokus]
                    updated[i] = e.target.value
                    setFokus(updated)
                  }}
                  placeholder={`Fokus ${i + 1} — cth: Kemudahan infrastruktur kawasan`}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              ))}
              {fokus.length < 5 && (
                <button type="button" onClick={() => setFokus([...fokus, ''])} className="text-sm text-orange-500 hover:text-orange-700">
                  + Tambah fokus
                </button>
              )}
            </div>
          </section>

          {/* D: Isu Kawasan */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">D. Isu Kawasan & Penyelesaian</h2>
            <div className="space-y-4">
              {isu.map((item, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Isu {i + 1}</p>
                  <input
                    type="text"
                    value={item.masalah}
                    onChange={e => {
                      const updated = [...isu]
                      updated[i] = { ...updated[i], masalah: e.target.value }
                      setIsu(updated)
                    }}
                    placeholder="Masalah — cth: Jalan rosak di Taman Maju"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  />
                  <input
                    type="text"
                    value={item.penyelesaian}
                    onChange={e => {
                      const updated = [...isu]
                      updated[i] = { ...updated[i], penyelesaian: e.target.value }
                      setIsu(updated)
                    }}
                    placeholder="Penyelesaian — cth: Lobi peruntukan JKR dalam 6 bulan pertama"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* E: Profil */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">E. Profil Ringkas</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latar Belakang <span className="text-red-500">*</span>
                  <span className="text-gray-400 text-xs ml-2">(pendidikan, kerjaya, pengalaman)</span>
                </label>
                <textarea
                  rows={4}
                  value={form.profil_ringkas}
                  onChange={e => setForm(p => ({ ...p, profil_ringkas: e.target.value }))}
                  placeholder="Cth: Graduan Universiti Malaya dalam bidang Undang-undang..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pencapaian / Kelayakan <span className="text-gray-400 text-xs ml-2">(optional)</span>
                </label>
                <div className="space-y-2">
                  {pencapaian.map((p, i) => (
                    <input
                      key={i}
                      type="text"
                      value={p}
                      onChange={e => {
                        const updated = [...pencapaian]
                        updated[i] = e.target.value
                        setPencapaian(updated)
                      }}
                      placeholder={`Pencapaian ${i + 1}`}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quote Peribadi <span className="text-gray-400 text-xs ml-2">(optional — satu ayat impactful)</span>
                </label>
                <input
                  type="text"
                  value={form.quote_peribadi}
                  onChange={e => setForm(p => ({ ...p, quote_peribadi: e.target.value }))}
                  placeholder="Cth: Saya bertanding bukan untuk jawatan, tapi untuk rakyat."
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          </section>

          {/* F: Hubungan */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">F. Maklumat Hubungan</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombor WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))}
                  placeholder="601XXXXXXXX"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              {[
                { key: 'facebook_url', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
                { key: 'instagram_url', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
                { key: 'tiktok_url', label: 'TikTok URL', placeholder: 'https://tiktok.com/@...' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    type="url"
                    value={form[field.key as keyof typeof form] as string}
                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* G: Pilihan Laman */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">G. Pilihan Laman</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bahasa Laman</label>
                <select
                  value={form.bahasa}
                  onChange={e => setForm(p => ({ ...p, bahasa: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="BM">Bahasa Melayu</option>
                  <option value="EN">English</option>
                  <option value="Kedua-dua">BM + English</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warna Utama <span className="text-gray-400 text-xs ml-1">(optional)</span>
                </label>
                <input
                  type="color"
                  value={form.warna_utama}
                  onChange={e => setForm(p => ({ ...p, warna_utama: e.target.value }))}
                  className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !form.full_name || !form.kawasan || !form.parti_name || !form.whatsapp || !form.subdomain}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-base transition"
            >
              {loading ? 'Menghantar...' : 'Hantar Borang →'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Dengan menghantar borang ini, anda bersetuju dengan{' '}
              <a href="/terms" className="underline">Terma Perkhidmatan</a> 1page.my
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
