'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { formatPrice } from '@/lib/utils'
import type { Product, ProductVariant } from '@/types'
import { SIZES, BRANDS, LEAGUES, GENDERS, SEASON_TYPES } from '@/types'

// Derive legacy category from liga for backward compat with the public catalog
function ligaToCategory(liga: string) {
  if (liga === 'Liga MX') return 'liga-mx'
  if (liga === 'Selección Mexicana' || liga === 'Selección Internacional') return 'seleccion-mexicana'
  if (['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League'].includes(liga))
    return 'europa'
  if (liga === 'Retro' || liga === 'Vintage') return 'retro-vintage'
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
        <Button
          variant="primary"
          onClick={() => { setEditingProduct(null); setShowForm(true) }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </Button>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Marca</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Liga</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Año</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Temporada</th>
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
                  <td className="px-4 py-3 text-sm text-gray-600">{product.marca || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.liga || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.anio || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.temporada || '—'}</td>
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
    </div>
  )
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

const brandOptions   = BRANDS.map((b) => ({ value: b, label: b }))
const leagueOptions  = LEAGUES.map((l) => ({ value: l, label: l }))
const genderOptions  = GENDERS.map((g) => ({ value: g, label: g }))
const seasonOptions  = SEASON_TYPES.map((s) => ({ value: s, label: s }))
const sizeOptions    = SIZES.filter((s) => s !== 'XS').map((s) => ({ value: s, label: s }))

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
    name:          product?.name          || '',
    marca:         product?.marca         || '',
    liga:          product?.liga          || '',
    team:          product?.team          || '',
    anio:          product?.anio          || '',
    temporada:     product?.temporada     || '',
    genero:        product?.genero        || '',
    price:         product?.price?.toString()         || '',
    compare_price: product?.compare_price?.toString() || '',
    description:   product?.description   || '',
    featured:      product?.featured      || false,
    active:        product?.active        ?? true,
  })

  const [variants, setVariants] = useState<Partial<ProductVariant>[]>(
    product?.variants?.length
      ? product.variants
      : [{ size: 'M', stock: 0 }]
  )
  const [images, setImages]   = useState<string[]>(product?.images || [])
  const [loading, setLoading] = useState(false)

  const set = (field: string, value: unknown) =>
    setFormData((f) => ({ ...f, [field]: value }))

  const addVariant    = () => setVariants((v) => [...v, { size: 'M', stock: 0 }])
  const removeVariant = (i: number) => setVariants((v) => v.filter((_, idx) => idx !== i))
  const updateVariant = (i: number, field: string, value: string | number) =>
    setVariants((v) => v.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...formData,
      price:         parseFloat(formData.price),
      compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
      category:      ligaToCategory(formData.liga),
      images,
      variants: variants.map((v) => ({
        ...v,
        type:   'local',   // kept in DB schema but not shown in UI
        season: formData.anio || '',
      })),
    }

    const url    = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
    const method = product ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setLoading(false)
    onSave()
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

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Nombre */}
          <Input
            label="Nombre del producto"
            value={formData.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="Ej. Jersey América Local 2024-25"
          />

          {/* Marca + Liga */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Marca"
              value={formData.marca}
              onChange={(e) => set('marca', e.target.value)}
              options={[{ value: '', label: 'Seleccionar marca' }, ...brandOptions]}
            />
            <Select
              label="Liga"
              value={formData.liga}
              onChange={(e) => set('liga', e.target.value)}
              options={[{ value: '', label: 'Seleccionar liga' }, ...leagueOptions]}
            />
          </div>

          {/* Equipo + Año */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Equipo"
              value={formData.team}
              onChange={(e) => set('team', e.target.value)}
              placeholder="Ej. América, Real Madrid..."
              required
            />
            <Input
              label="Año"
              value={formData.anio}
              onChange={(e) => set('anio', e.target.value)}
              placeholder="Ej. 2024-25, 2023-24, 1998"
            />
          </div>

          {/* Temporada + Género */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Temporada"
              value={formData.temporada}
              onChange={(e) => set('temporada', e.target.value)}
              options={[{ value: '', label: 'Seleccionar temporada' }, ...seasonOptions]}
            />
            <Select
              label="Género"
              value={formData.genero}
              onChange={(e) => set('genero', e.target.value)}
              options={[{ value: '', label: 'Seleccionar género' }, ...genderOptions]}
            />
          </div>

          {/* Precio */}
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
              label="Precio anterior (opcional)"
              type="number"
              step="0.01"
              value={formData.compare_price}
              onChange={(e) => set('compare_price', e.target.value)}
              placeholder="Precio tachado"
            />
          </div>

          {/* Descripción */}
          <Textarea
            label="Descripción"
            value={formData.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="Detalles del jersey, material, características..."
          />

          {/* Opciones */}
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

          {/* Imágenes */}
          <div>
            <p className="text-sm font-semibold text-[#111410] mb-2">
              Fotos{' '}
              <span className="font-normal text-gray-400">(arrastra para reordenar — la primera es la portada)</span>
            </p>
            <ImageUploader images={images} onChange={setImages} />
          </div>

          {/* Variantes — solo talla y stock */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-[#111410]">Stock por talla</p>
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
