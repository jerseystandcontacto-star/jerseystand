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
import { CATEGORIES, SIZES, PRODUCT_TYPES } from '@/types'

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    const res = await fetch('/api/admin/products')
    const data = await res.json()
    setProducts(data)
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
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

      {/* Lista de productos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {product.images[0] && (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#111410]">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.team}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 capitalize">
                      {CATEGORIES.find((c) => c.value === product.category)?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-[#1a5c2e]">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={product.active ? 'success' : 'default'}>
                      {product.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-gray-400 hover:text-[#1a5c2e] transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(product)}
                        className="p-2 text-gray-400 hover:text-[#1a5c2e] transition-colors"
                        title={product.active ? 'Desactivar' : 'Activar'}
                      >
                        {product.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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

      {/* Modal de formulario */}
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
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || 'liga-mx',
    team: product?.team || '',
    price: product?.price?.toString() || '',
    compare_price: product?.compare_price?.toString() || '',
    featured: product?.featured || false,
    active: product?.active ?? true,
  })
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>(
    product?.variants || [{ size: 'M', type: 'local', season: '2024/25', stock: 0 }]
  )
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [loading, setLoading] = useState(false)

  const addVariant = () => {
    setVariants((prev) => [...prev, { size: 'M', type: 'local', season: '2024/25', stock: 0 }])
  }

  const removeVariant = (i: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== i))
  }

  const updateVariant = (i: number, field: string, value: string | number) => {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
      images,
      variants,
    }

    const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
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
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-2xl text-[#111410]">
            {product ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Datos básicos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Nombre del producto"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <Input
              label="Equipo / Marca"
              value={formData.team}
              onChange={(e) => setFormData((f) => ({ ...f, team: e.target.value }))}
              required
            />
            <Select
              label="Categoría"
              value={formData.category}
              onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value as any }))}
              options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
            />
            <Input
              label="Precio (MXN)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData((f) => ({ ...f, price: e.target.value }))}
              required
            />
            <Input
              label="Precio anterior (opcional)"
              type="number"
              step="0.01"
              value={formData.compare_price}
              onChange={(e) => setFormData((f) => ({ ...f, compare_price: e.target.value }))}
            />
            <div className="col-span-2">
              <Textarea
                label="Descripción"
                value={formData.description}
                onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          {/* Opciones */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData((f) => ({ ...f, featured: e.target.checked }))}
                className="w-4 h-4 accent-[#1a5c2e]"
              />
              <span className="text-sm font-semibold">Producto destacado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData((f) => ({ ...f, active: e.target.checked }))}
                className="w-4 h-4 accent-[#1a5c2e]"
              />
              <span className="text-sm font-semibold">Producto activo</span>
            </label>
          </div>

          {/* Imágenes */}
          <div>
            <p className="text-sm font-semibold text-[#111410] mb-2">
              Imágenes{' '}
              <span className="font-normal text-gray-400">(arrastra para reordenar — la primera es la portada)</span>
            </p>
            <ImageUploader images={images} onChange={setImages} />
          </div>

          {/* Variantes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-[#111410]">Variantes (talla / tipo / stock)</p>
              <button type="button" onClick={addVariant} className="text-sm text-[#1a5c2e] font-semibold hover:underline">
                + Agregar
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {variants.map((variant, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <Select
                    label={i === 0 ? 'Talla' : ''}
                    value={variant.size || 'M'}
                    onChange={(e) => updateVariant(i, 'size', e.target.value)}
                    options={SIZES.map((s) => ({ value: s, label: s }))}
                  />
                  <Select
                    label={i === 0 ? 'Tipo' : ''}
                    value={variant.type || 'local'}
                    onChange={(e) => updateVariant(i, 'type', e.target.value)}
                    options={PRODUCT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                  />
                  <Input
                    label={i === 0 ? 'Temporada' : ''}
                    value={variant.season || ''}
                    onChange={(e) => updateVariant(i, 'season', e.target.value)}
                    placeholder="2024/25"
                  />
                  <Input
                    label={i === 0 ? 'Stock' : ''}
                    type="number"
                    min="0"
                    value={variant.stock?.toString() || '0'}
                    onChange={(e) => updateVariant(i, 'stock', parseInt(e.target.value) || 0)}
                    className="w-20"
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
