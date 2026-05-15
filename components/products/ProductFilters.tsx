'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { X } from 'lucide-react'
import { CATEGORIES, SIZES, PRODUCT_TYPES } from '@/types'

export function ProductFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const current = new URLSearchParams(params.toString())
      if (value) {
        current.set(key, value)
      } else {
        current.delete(key)
      }
      current.delete('page')
      router.push(`/productos?${current.toString()}`)
    },
    [params, router]
  )

  const clearAll = () => router.push('/productos')

  const activeFilters = ['categoria', 'talla', 'tipo', 'equipo', 'precioMin', 'precioMax'].filter(
    (k) => params.has(k)
  )

  return (
    <aside className="flex flex-col gap-6">
      {/* Limpiar filtros */}
      {activeFilters.length > 0 && (
        <button
          onClick={clearAll}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-semibold"
        >
          <X className="w-4 h-4" />
          Limpiar filtros ({activeFilters.length})
        </button>
      )}

      {/* Ordenar */}
      <div>
        <h3 className="font-semibold text-[#111410] text-sm uppercase tracking-wide mb-3">
          Ordenar por
        </h3>
        <select
          value={params.get('orden') || ''}
          onChange={(e) => updateFilter('orden', e.target.value || null)}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5c2e]"
        >
          <option value="">Más recientes</option>
          <option value="precio_asc">Precio: menor a mayor</option>
          <option value="precio_desc">Precio: mayor a menor</option>
          <option value="destacados">Destacados</option>
        </select>
      </div>

      {/* Categoría */}
      <FilterGroup title="Categoría">
        {CATEGORIES.map((cat) => (
          <FilterOption
            key={cat.value}
            label={cat.label}
            active={params.get('categoria') === cat.value}
            onClick={() =>
              updateFilter(
                'categoria',
                params.get('categoria') === cat.value ? null : cat.value
              )
            }
          />
        ))}
      </FilterGroup>

      {/* Tipo */}
      <FilterGroup title="Tipo">
        {PRODUCT_TYPES.map((type) => (
          <FilterOption
            key={type.value}
            label={type.label}
            active={params.get('tipo') === type.value}
            onClick={() =>
              updateFilter(
                'tipo',
                params.get('tipo') === type.value ? null : type.value
              )
            }
          />
        ))}
      </FilterGroup>

      {/* Talla */}
      <FilterGroup title="Talla">
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() =>
                updateFilter('talla', params.get('talla') === size ? null : size)
              }
              className={`py-2 text-sm font-semibold rounded-lg border-2 transition-all ${
                params.get('talla') === size
                  ? 'border-[#1a5c2e] bg-[#1a5c2e] text-white'
                  : 'border-gray-200 hover:border-[#1a5c2e]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Precio */}
      <FilterGroup title="Precio">
        <div className="flex flex-col gap-2">
          {[
            { label: 'Menos de $500', min: '', max: '500' },
            { label: '$500 – $800', min: '500', max: '800' },
            { label: '$800 – $1,200', min: '800', max: '1200' },
            { label: 'Más de $1,200', min: '1200', max: '' },
          ].map((range) => {
            const active =
              params.get('precioMin') === range.min &&
              params.get('precioMax') === range.max
            return (
              <button
                key={range.label}
                onClick={() => {
                  if (active) {
                    updateFilter('precioMin', null)
                    updateFilter('precioMax', null)
                  } else {
                    const next = new URLSearchParams(params.toString())
                    if (range.min) next.set('precioMin', range.min)
                    else next.delete('precioMin')
                    if (range.max) next.set('precioMax', range.max)
                    else next.delete('precioMax')
                    next.delete('page')
                    router.push(`/productos?${next.toString()}`)
                  }
                }}
                className={`text-left text-sm py-2 px-3 rounded-lg transition-all ${
                  active
                    ? 'bg-[#1a5c2e] text-white font-semibold'
                    : 'hover:bg-gray-100'
                }`}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </FilterGroup>
    </aside>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-[#111410] text-sm uppercase tracking-wide mb-3">
        {title}
      </h3>
      {children}
    </div>
  )
}

function FilterOption({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full text-left text-sm py-1.5 px-2 rounded-lg transition-all ${
        active ? 'text-[#1a5c2e] font-semibold' : 'text-gray-600 hover:text-[#111410]'
      }`}
    >
      <span
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
          active ? 'border-[#1a5c2e] bg-[#1a5c2e]' : 'border-gray-300'
        }`}
      >
        {active && (
          <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-current">
            <path d="M10 3L5 8.5L2 5.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )}
      </span>
      {label}
    </button>
  )
}
