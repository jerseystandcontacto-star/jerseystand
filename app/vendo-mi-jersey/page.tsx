'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, CheckCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { JERSEY_CONDITIONS } from '@/types'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export default function VendoMiJerseyPage() {
  const [form, setForm] = useState({
    customer_name: '',
    email: '',
    whatsapp: '',
    team: '',
    size: '',
    season: '',
    condition: '',
    asking_price: '',
    description: '',
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/compras/fotos', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        setPhotos((p) => [...p, data.url])
      }
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const removePhoto = (idx: number) =>
    setPhotos((p) => p.filter((_, i) => i !== idx))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (photos.length < 2) {
      setError('Sube al menos 2 fotos del jersey.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, asking_price: parseFloat(form.asking_price), photos }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al enviar la solicitud'); return }
      setSuccess(true)
    } catch {
      setError('Error de red. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <CheckCircle className="w-16 h-16 text-[#1a5c2e] mx-auto mb-4" />
        <h1 className="font-display text-4xl text-[#111410] mb-3">¡SOLICITUD ENVIADA!</h1>
        <p className="text-gray-600 mb-6">
          Revisaremos tu jersey y te contactaremos en menos de 24 horas con una oferta.
        </p>
        <Button variant="primary" onClick={() => { setSuccess(false); setForm({ customer_name: '', email: '', whatsapp: '', team: '', size: '', season: '', condition: '', asking_price: '', description: '' }); setPhotos([]) }}>
          Enviar otra solicitud
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-display text-5xl text-[#111410] mb-3">VENDO MI JERSEY</h1>
        <p className="text-gray-600">
          Cuéntanos sobre tu jersey y te hacemos una oferta justa en menos de 24 horas.
        </p>
      </div>

      {/* Cómo funciona */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { n: '1', title: 'Llena el formulario', desc: 'Describe tu jersey y sube fotos.' },
          { n: '2', title: 'Recibe una oferta', desc: 'Te contactamos en 24 horas.' },
          { n: '3', title: '¡Listo!', desc: 'Acordamos la venta y te pagamos.' },
        ].map((step) => (
          <div key={step.n} className="text-center">
            <div className="w-10 h-10 rounded-full bg-[#1a5c2e] text-white font-display text-lg flex items-center justify-center mx-auto mb-2">
              {step.n}
            </div>
            <p className="font-semibold text-sm text-[#111410]">{step.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Datos de contacto */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-[#111410]">Tus datos de contacto</h2>
          <Input
            label="Nombre completo"
            value={form.customer_name}
            onChange={(e) => set('customer_name', e.target.value)}
            required
            placeholder="Juan García"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required
              placeholder="juan@email.com"
            />
            <Input
              label="WhatsApp"
              type="tel"
              value={form.whatsapp}
              onChange={(e) => set('whatsapp', e.target.value)}
              required
              placeholder="55 0000 0000"
            />
          </div>
        </div>

        {/* Datos del jersey */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-[#111410]">Datos del jersey</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Equipo"
              value={form.team}
              onChange={(e) => set('team', e.target.value)}
              required
              placeholder="Ej. América, Barcelona..."
            />
            <Input
              label="Temporada / Año"
              value={form.season}
              onChange={(e) => set('season', e.target.value)}
              required
              placeholder="Ej. 2022-23, 1998..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Talla"
              value={form.size}
              onChange={(e) => set('size', e.target.value)}
              options={[{ value: '', label: 'Seleccionar talla' }, ...SIZES.map((s) => ({ value: s, label: s }))]}
              required
            />
            <Input
              label="Precio que pides (MXN)"
              type="number"
              min="1"
              step="1"
              value={form.asking_price}
              onChange={(e) => set('asking_price', e.target.value)}
              required
              placeholder="Ej. 500"
            />
          </div>

          {/* Condición */}
          <div>
            <p className="text-sm font-semibold text-[#111410] mb-2">Condición del jersey <span className="text-red-500">*</span></p>
            <div className="grid grid-cols-2 gap-2">
              {JERSEY_CONDITIONS.map((c) => (
                <label
                  key={c.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.condition === c.value
                      ? 'border-[#1a5c2e] bg-[#f0faf3]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="condition"
                    value={c.value}
                    checked={form.condition === c.value}
                    onChange={(e) => set('condition', e.target.value)}
                    className="sr-only"
                    required
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="font-semibold text-sm">{c.label}</span>
                      <span className="text-[#c9a227] text-xs">{'★'.repeat(c.stars)}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-tight">{c.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Textarea
            label="Descripción adicional (opcional)"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            placeholder="Detalles extra: bordado, parches, detalles de uso..."
          />
        </div>

        {/* Fotos */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-[#111410]">Fotos del jersey</h2>
              <p className="text-xs text-gray-500 mt-0.5">Mínimo 2 fotos • JPG, PNG o WebP • Máx. 5 MB c/u</p>
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-[#1a5c2e] text-[#1a5c2e] text-sm font-semibold hover:bg-[#f0faf3] transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Subiendo...' : 'Subir fotos'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handlePhoto}
            />
          </div>

          {photos.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {photos.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                  <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center text-gray-400 cursor-pointer hover:border-[#1a5c2e] hover:text-[#1a5c2e] transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Haz clic para subir fotos</p>
              <p className="text-xs mt-1">Frente, reverso y etiquetas</p>
            </div>
          )}
        </div>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="font-display text-lg tracking-wider">
          ENVIAR SOLICITUD
        </Button>
      </form>
    </div>
  )
}
