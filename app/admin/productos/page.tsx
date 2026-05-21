'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Edit, Trash2, Eye, EyeOff, X, Upload, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { formatPrice } from '@/lib/utils'
import type { Product, ProductVariant } from '@/types'
import { SIZES, BRANDS, GENDERS, TIPOS_PRODUCTO } from '@/types'

function paisToCategory(pais: string): string {
  const p = pais.toLowerCase().trim()
  if (!p || p.includes('méx') || p.includes('mex')) return 'liga-mx'
  const europa = ['españa', 'spain', 'england', 'inglat', 'germany', 'aleman', 'france', 'franc', 'italy', 'ital', 'portug', 'nether', 'belgi']
  if (europa.some((c) => p.includes(c))) return 'europa'
  if (p.includes('selecci')) return 'seleccion-mexicana'
  return 'liga-mx'
}

function totalStock(product: Product) {
  return product.variants?.reduce((s, v) => s + (v.stock ?? 0), 0) ?? 0
}

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showImport, setShowImport] = useState(false)

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    const res = await fetch('/api/admin/products')
    const data = await res.json()
    setProducts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const toggleActive = async (product: Product) => {
    await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !product.active }),
    })
    fetchProducts()
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    fetchProducts()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-4xl text-[#111410]">PRODUCTOS</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowImport(true)}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Importar Excel
          </Button>
          <Button
            variant="primary"
            onClick={() => { setEditingProduct(null); setShowForm(true) }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo producto
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">No hay productos aún</p>
            <Button variant="primary" onClick={() => setShowForm(true)}>
              Agregar primer producto
            </Button>
          </div>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Marca</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">País</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Año</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Equipación</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Género</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {product.images[0] && (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#111410] leading-tight">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.team}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.tipo_producto || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.marca || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.pais || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.anio || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.equipacion || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.genero || '—'}</td>
                  <td className="px-4 py-3 font-bold text-sm text-[#1a5c2e]">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{totalStock(product)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={product.active ? 'success' : 'default'}>
                      {product.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingProduct(product); setShowForm(true) }}
                        className="p-1.5 text-gray-400 hover:text-[#1a5c2e] transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(product)}
                        className="p-1.5 text-gray-400 hover:text-[#1a5c2e] transition-colors"
                        title={product.active ? 'Desactivar' : 'Activar'}
                      >
                        {product.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); fetchProducts() }}
        />
      )}

      {showImport && (
        <ExcelImportModal
          onClose={() => setShowImport(false)}
          onDone={fetchProducts}
        />
      )}
    </div>
  )
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

const genderOptions = GENDERS.map((g) => ({ value: g, label: g }))
const sizeOptions   = SIZES.filter((s) => s !== 'XS').map((s) => ({ value: s, label: s }))
const brandOptions  = [{ value: '', label: 'Seleccionar marca' }, ...BRANDS.map((b) => ({ value: b, label: b }))]

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="text-xs font-bold tracking-widest uppercase text-gray-400 pb-2 border-b border-gray-100 -mb-1">
      {label}
    </p>
  )
}

function ProductFormModal({
  product,
  onClose,
  onSave,
}: {
  product: Product | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name:                product?.name                || '',
    tipo_producto:       product?.tipo_producto       || 'Jersey',
    marca:               product?.marca               || '',
    pais:                product?.pais                || '',
    team:                product?.team                || '',
    anio:                product?.anio                || '',
    genero:              product?.genero              || '',
    price:               product?.price?.toString()         || '',
    compare_price:       product?.compare_price?.toString() || '',
    description:         product?.description         || '',
    featured:            product?.featured            || false,
    active:              product?.active              ?? true,
    equipacion:          product?.equipacion          || '',
    version:             product?.version             || '',
    tipografia:          product?.tipografia          || '',
    hecho_en:            product?.hecho_en            || '',
    codigo_autenticidad: product?.codigo_autenticidad || '',
    condicion:           product?.condicion           || '',
  })

  const [variants, setVariants] = useState<Partial<ProductVariant>[]>(
    product?.variants?.length
      ? product.variants
      : [{ size: 'M', stock: 0 }]
  )
  const [images, setImages]   = useState<string[]>(product?.images || [])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (field: string, value: unknown) =>
    setFormData((f) => ({ ...f, [field]: value }))

  const addVariant    = () => setVariants((v) => [...v, { size: 'M', stock: 0 }])
  const removeVariant = (i: number) => setVariants((v) => v.filter((_, idx) => idx !== i))
  const updateVariant = (i: number, field: string, value: string | number) =>
    setVariants((v) => v.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        price:               parseFloat(formData.price),
        compare_price:       formData.compare_price ? parseFloat(formData.compare_price) : null,
        category:            paisToCategory(formData.pais),
        pais:                formData.pais                || null,
        equipacion:          formData.equipacion          || null,
        version:             formData.version             || null,
        tipografia:          formData.tipografia          || null,
        hecho_en:            formData.hecho_en            || null,
        codigo_autenticidad: formData.codigo_autenticidad || null,
        condicion:           formData.condicion           || null,
        images,
        variants: variants.map((v) => ({
          size:  v.size  || 'M',
          stock: Number(v.stock) || 0,
        })),
      }

      const url    = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = product ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || `Error ${res.status}: no se pudo guardar el producto`)
        return
      }

      onSave()
    } catch (err) {
      console.error('[handleSubmit] error de red:', err)
      setError('Error de red: no se pudo conectar con el servidor. Revisa tu conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-2xl text-[#111410]">
            {product ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-medium">
              {error}
            </div>
          )}

          {/* ── 1. Información del producto ── */}
          <SectionHeader label="Información del producto" />

          <Input
            label="Nombre del producto"
            value={formData.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="Ej. Jersey América Local 2024-25"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Equipo"
              value={formData.team}
              onChange={(e) => set('team', e.target.value)}
              placeholder="Ej. América, Real Madrid..."
              required
            />
            <Input
              label="País"
              value={formData.pais}
              onChange={(e) => set('pais', e.target.value)}
              placeholder="Ej. México, España, England..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Marca"
              value={formData.marca}
              onChange={(e) => set('marca', e.target.value)}
              options={brandOptions}
            />
            <Input
              label="Año"
              value={formData.anio}
              onChange={(e) => set('anio', e.target.value)}
              placeholder="Ej. 2024-25, 2023-24, 1998"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Equipación"
              value={formData.equipacion}
              onChange={(e) => set('equipacion', e.target.value)}
              options={[
                { value: '',                 label: 'Seleccionar' },
                { value: 'Local',            label: 'Local' },
                { value: 'Visitante',        label: 'Visitante' },
                { value: 'Tercero',          label: 'Tercero' },
                { value: 'Portero',          label: 'Portero' },
                { value: 'Edición Especial', label: 'Edición Especial' },
                { value: 'Retro',            label: 'Retro' },
                { value: 'N/A',              label: 'N/A' },
              ]}
            />
            <Select
              label="Género"
              value={formData.genero}
              onChange={(e) => set('genero', e.target.value)}
              options={[{ value: '', label: 'Seleccionar género' }, ...genderOptions]}
            />
          </div>

          <Select
            label="Tipo de producto"
            value={formData.tipo_producto}
            onChange={(e) => set('tipo_producto', e.target.value)}
            options={TIPOS_PRODUCTO.map((t) => ({ value: t, label: t }))}
          />

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="w-4 h-4 accent-[#1a5c2e]"
              />
              <span className="text-sm font-semibold">Producto destacado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => set('active', e.target.checked)}
                className="w-4 h-4 accent-[#1a5c2e]"
              />
              <span className="text-sm font-semibold">Producto activo</span>
            </label>
          </div>

          {/* ── 2. Detalles de autenticidad ── */}
          <SectionHeader label="Detalles de autenticidad" />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipografía"
              value={formData.tipografia}
              onChange={(e) => set('tipografia', e.target.value)}
              options={[
                { value: '',    label: 'Seleccionar' },
                { value: 'Sí', label: 'Sí' },
                { value: 'No', label: 'No' },
              ]}
            />
            <Select
              label="Versión"
              value={formData.version}
              onChange={(e) => set('version', e.target.value)}
              options={[
                { value: '',           label: 'Seleccionar' },
                { value: 'Aficionado', label: 'Aficionado' },
                { value: 'Jugador',    label: 'Jugador' },
                { value: 'Auténtico',  label: 'Auténtico' },
                { value: 'N/A',        label: 'N/A' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hecho en"
              value={formData.hecho_en}
              onChange={(e) => set('hecho_en', e.target.value)}
              placeholder="Ej. México, Thailand, Indonesia..."
            />
            <Input
              label="Código de autenticidad"
              value={formData.codigo_autenticidad}
              onChange={(e) => set('codigo_autenticidad', e.target.value)}
              placeholder="Ej. ABC-123456"
            />
          </div>

          <Textarea
            label="Condición"
            value={formData.condicion}
            onChange={(e) => set('condicion', e.target.value)}
            rows={2}
            placeholder="Ej. Nuevo con etiquetas, sin uso..."
          />

          {/* ── 3. Precio ── */}
          <SectionHeader label="Precio" />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio (MXN)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => set('price', e.target.value)}
              required
            />
            <Input
              label="Precio anterior (tachado)"
              type="number"
              step="0.01"
              value={formData.compare_price}
              onChange={(e) => set('compare_price', e.target.value)}
              placeholder="Opcional"
            />
          </div>

          {/* ── 4. Descripción ── */}
          <SectionHeader label="Descripción" />

          <Textarea
            label=""
            value={formData.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="Detalles del jersey, material, características..."
          />

          {/* ── 5. Imágenes ── */}
          <SectionHeader label="Imágenes" />

          <div>
            <p className="text-xs text-gray-400 mb-2">Arrastra para reordenar — la primera es la portada</p>
            <ImageUploader images={images} onChange={setImages} />
          </div>

          {/* ── 6. Variantes y stock ── */}
          <SectionHeader label="Variantes y stock" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Stock por talla</p>
              <button
                type="button"
                onClick={addVariant}
                className="text-sm text-[#1a5c2e] font-semibold hover:underline"
              >
                + Agregar talla
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {variants.map((variant, i) => (
                <div key={i} className="flex gap-3 items-end">
                  <Select
                    label={i === 0 ? 'Talla' : ''}
                    value={variant.size || 'M'}
                    onChange={(e) => updateVariant(i, 'size', e.target.value)}
                    options={sizeOptions}
                  />
                  <Input
                    label={i === 0 ? 'Stock' : ''}
                    type="number"
                    min="0"
                    value={variant.stock?.toString() || '0'}
                    onChange={(e) => updateVariant(i, 'stock', parseInt(e.target.value) || 0)}
                    className="w-28"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="pb-1 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" loading={loading} className="flex-1">
              {product ? 'Guardar cambios' : 'Crear producto'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Excel Import ─────────────────────────────────────────────────────────────

const EUROPA_LEAGUES = new Set([
  'La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1', 'MLS', 'SuperLiga Argentina',
])

function deriveCategory(liga: string): string {
  if (liga === 'Liga MX') return 'liga-mx'
  if (EUROPA_LEAGUES.has(liga)) return 'europa'
  if (liga === 'Selección Mexicana' || liga === 'FIFA') return 'seleccion'
  return 'gear'
}

function parseTipoProducto(raw: string): string {
  if (!raw) return 'Jersey'
  const lower = raw.toLowerCase()
  if (lower.includes('retro')) return 'Jersey Retro'
  if (lower === 'jersey') return 'Jersey'
  if (lower === 'entrenamiento') return 'Entrenamiento'
  if (lower === 'sudadera') return 'Sudadera'
  return 'Otro'
}

function parseSizes(raw: string): string[] {
  if (!raw) return []
  const norm = raw.trim().toLowerCase()
  if (norm === 'única' || norm === 'unica') return ['Única']
  return raw.split(/[,/;|\s]+/).map((s) => s.trim()).filter(Boolean)
}

interface ParsedProduct {
  name:                string
  team:                string
  liga:                string
  anio:                string
  marca:               string
  tipo_producto:       string
  genero:              string
  price:               number
  compare_price:       number | null
  featured:            boolean
  description:         string
  category:            string
  sizes:               string[]
  stock_per_size:      number
  equipacion:          string
  version:             string
  tipografia:          string
  hecho_en:            string
  codigo_autenticidad: string
  condicion:           string
}

function parseExcelRow(raw: Record<string, unknown>): ParsedProduct | null {
  const row: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(raw)) row[k.trim()] = v

  const name = String(row['Nombre'] ?? '').trim()
  if (!name) return null

  const toNum = (v: unknown): number | null => {
    if (v == null || v === '') return null
    if (typeof v === 'number') return v
    const n = parseFloat(String(v).replace(/[$,\s]/g, ''))
    return isNaN(n) ? null : n
  }

  const liga        = String(row['Liga'] ?? '').trim()
  const sizesRaw    = String(row['Tallas disponibles'] ?? '').trim()
  const sizes       = parseSizes(sizesRaw)
  const stockTotal  = toNum(row['Stock total']) ?? 0
  const stockPerSize = sizes.length > 0 ? Math.max(1, Math.floor(stockTotal / sizes.length)) : Math.max(1, stockTotal)

  const desc = String(row['Descripción'] ?? '').trim()
  const hist = String(row['Historia'] ?? '').trim()
  const dest = String(row['Destacado'] ?? '').trim().toLowerCase()

  return {
    name,
    team:                String(row['Equipo'] ?? '').trim(),
    liga,
    anio:                String(row['Temporada / Año'] ?? '').trim(),
    marca:               String(row['Marca'] ?? '').trim(),
    tipo_producto:       parseTipoProducto(String(row['Tipo'] ?? '').trim()),
    genero:              String(row['Género'] ?? '').trim(),
    price:               toNum(row['Precio (MXN)']) ?? 0,
    compare_price:       toNum(row['Precio original']),
    featured:            dest === 'sí' || dest === 'si' || dest === 'true' || dest === '1',
    description:         [desc, hist].filter(Boolean).join('\n\n'),
    category:            deriveCategory(liga),
    sizes,
    stock_per_size:      stockPerSize,
    equipacion:          String(row['Equipación'] ?? '').trim(),
    version:             String(row['Versión'] ?? '').trim(),
    tipografia:          String(row['Tipografía'] ?? '').trim(),
    hecho_en:            String(row['Hecho en'] ?? '').trim(),
    codigo_autenticidad: String(row['Código de autenticidad'] ?? '').trim(),
    condicion:           String(row['Condición'] ?? '').trim(),
  }
}

// ─── ExcelImportModal ─────────────────────────────────────────────────────────

function ExcelImportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [products, setProducts]     = useState<ParsedProduct[]>([])
  const [selected, setSelected]     = useState<Set<number>>(new Set())
  const [dragging, setDragging]     = useState(false)
  const [fileName, setFileName]     = useState('')
  const [parseError, setParseError] = useState('')
  const [importing, setImporting]   = useState(false)
  const [progress, setProgress]     = useState({ current: 0, total: 0 })
  const [result, setResult]         = useState<{ success: number; skipped: number; errors: string[] } | null>(null)

  const loadFile = async (file: File) => {
    setParseError('')
    setProducts([])
    setResult(null)
    setFileName(file.name)
    try {
      const XLSX = await import('xlsx')
      const buf  = await file.arrayBuffer()
      const wb   = XLSX.read(buf, { type: 'array' })
      const ws   = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[]
      const parsed = rows.map(parseExcelRow).filter(Boolean) as ParsedProduct[]
      if (parsed.length === 0) {
        setParseError('No se detectaron productos. Verifica que los encabezados del Excel sean correctos.')
        return
      }
      setProducts(parsed)
      setSelected(new Set(parsed.map((_, i) => i)))
    } catch (err: any) {
      setParseError('Error al leer el archivo: ' + err.message)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && /\.(xlsx|xls)$/i.test(file.name)) {
      loadFile(file)
    } else {
      setParseError('Solo se aceptan archivos .xlsx o .xls')
    }
  }

  const toggleOne = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  const toggleAll = () =>
    setSelected(selected.size === products.length ? new Set() : new Set(products.map((_, i) => i)))

  const handleImport = async () => {
    const toImport = products.filter((_, i) => selected.has(i))
    if (!toImport.length) return
    setImporting(true)
    setProgress({ current: 0, total: toImport.length })

    let success = 0
    let skipped = 0
    const errors: string[] = []

    for (let i = 0; i < toImport.length; i++) {
      setProgress({ current: i + 1, total: toImport.length })
      try {
        const res  = await fetch('/api/admin/products/bulk-import', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ products: [toImport[i]] }),
        })
        const data = await res.json()
        success += data.success ?? 0
        skipped += data.skipped ?? 0
        if (data.errors?.length) errors.push(...data.errors)
      } catch (err: any) {
        errors.push(`${toImport[i].name}: ${err.message}`)
      }
    }

    setResult({ success, skipped, errors })
    setImporting(false)
    if (success > 0) onDone()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-2xl text-[#111410]">IMPORTAR DESDE EXCEL</h2>
          {!importing && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Drop zone */}
          {products.length === 0 && !result && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragging ? 'border-[#1a5c2e] bg-[#1a5c2e]/5' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-600 mb-1">Arrastra tu archivo .xlsx aquí</p>
              <p className="text-sm text-gray-400 mb-4">o haz clic para seleccionar</p>
              <label className="cursor-pointer">
                <span className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                  Seleccionar archivo
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f) }}
                />
              </label>
            </div>
          )}

          {parseError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {parseError}
            </div>
          )}

          {/* Preview table */}
          {products.length > 0 && !result && !importing && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-[#111410]">{products.length}</span> productos detectados en{' '}
                  <span className="font-medium">{fileName}</span>
                </p>
                <button
                  type="button"
                  onClick={() => { setProducts([]); setFileName('') }}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  Cambiar archivo
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2.5 text-left w-8">
                          <input
                            type="checkbox"
                            checked={selected.size === products.length && products.length > 0}
                            onChange={toggleAll}
                            className="w-4 h-4 accent-[#1a5c2e]"
                          />
                        </th>
                        {['Nombre', 'Equipo', 'Liga', 'Precio', 'Tallas', 'Dest.'].map((h) => (
                          <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((p, i) => (
                        <tr
                          key={i}
                          onClick={() => toggleOne(i)}
                          className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                            selected.has(i) ? '' : 'opacity-40'
                          }`}
                        >
                          <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selected.has(i)}
                              onChange={() => toggleOne(i)}
                              className="w-4 h-4 accent-[#1a5c2e]"
                            />
                          </td>
                          <td className="px-3 py-2 font-medium text-[#111410] max-w-[200px] truncate">{p.name}</td>
                          <td className="px-3 py-2 text-gray-600">{p.team || '—'}</td>
                          <td className="px-3 py-2 text-gray-600">{p.liga || '—'}</td>
                          <td className="px-3 py-2 font-semibold text-[#1a5c2e]">{formatPrice(p.price)}</td>
                          <td className="px-3 py-2 text-gray-500 text-xs">{p.sizes.join(', ') || '—'}</td>
                          <td className="px-3 py-2">
                            {p.featured
                              ? <span className="px-1.5 py-0.5 bg-[#c9a227]/20 text-[#c9a227] text-xs rounded font-medium">Sí</span>
                              : <span className="text-gray-300 text-xs">No</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Progress */}
          {importing && (
            <div className="text-center py-10">
              <div className="w-12 h-12 border-4 border-[#1a5c2e]/20 border-t-[#1a5c2e] rounded-full animate-spin mx-auto mb-4" />
              <p className="font-semibold text-[#111410] text-lg">
                Importando {progress.current} de {progress.total}...
              </p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="flex flex-col gap-3">
              {result.success > 0 && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  <p className="font-semibold text-green-800">
                    {result.success} producto{result.success !== 1 ? 's' : ''} importado{result.success !== 1 ? 's' : ''} correctamente
                  </p>
                </div>
              )}
              {result.skipped > 0 && (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <span className="shrink-0 text-lg">⚠️</span>
                  <p className="text-yellow-800 text-sm">
                    {result.skipped} producto{result.skipped !== 1 ? 's' : ''} saltado{result.skipped !== 1 ? 's' : ''} — ya existen con el mismo nombre
                  </p>
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="font-semibold text-red-800 text-sm mb-2">
                    {result.errors.length} error{result.errors.length !== 1 ? 'es' : ''}:
                  </p>
                  <ul className="text-red-700 text-xs space-y-1">
                    {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!importing && (
          <div className="flex items-center justify-between p-6 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>
              {result ? 'Cerrar' : 'Cancelar'}
            </Button>
            {products.length > 0 && !result && (
              <Button
                type="button"
                variant="primary"
                onClick={handleImport}
                disabled={selected.size === 0}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Importar {selected.size} producto{selected.size !== 1 ? 's' : ''}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
