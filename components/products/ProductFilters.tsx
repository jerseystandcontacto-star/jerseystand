'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { X } from 'lucide-react'
import { LEAGUES, GENDERS, BRANDS, TIPOS_PRODUCTO } from '@/types'

const PRICE_RANGES = [
  { label: '$0 – $500',        min: '',     max: '500'  },
  { label: '$500 – $1,000',    min: '500',  max: '1000' },
  { label: '$1,000 – $1,500',  min: '1000', max: '1500' },
  { label: '$1,500+',          min: '1500', max: ''     },
]

const FILTER_KEYS = ['liga', 'genero', 'marca', 'tipo', 'precioMin', 'precioMax', 'buscar']

export function ProductFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      router.push(`/productos?${next.toString()}`)
    },
    [params, router]
  )

  const clearAll = () => router.push('/productos')

  const activeCount = FILTER_KEYS.filter((k) => params.has(k)).length

  return (
    <aside className="flex flex-col gap-6">
      {/* Limpiar */}
      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-semibold"
        >
          <X className="w-4 h-4" />
          Limpiar filtros ({activeCount})
        </button>
      )}

      {/* Ordenar */}
      <FilterSection title="Ordenar por">
        <select
          value={params.get('orden') || ''}
          onChange={(e) => updateFilter('orden', e.target.value || null)}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5c2e]"
        >
          <option value="">Más recientes</option>
          <option value="precio_asc">Precio: menor a mayor</option>
          <option value="precio_desc">Precio: mayor a menor</option>
          <option value="oferta">Ofertas primero</option>
        </select>
      </FilterSection>

      {/* Liga */}
      <FilterSection title="Liga">
        {(LEAGUES as readonly string[]).map((liga) => (
          <FilterChip
            key={liga}
            label={liga}
            active={params.get('liga') === liga}
            onClick={() => updateFilter('liga', params.get('liga') === liga ? null : liga)}
          />
        ))}
      </FilterSection>

      {/* Género */}
      <FilterSection title="Género">
        {(GENDERS as readonly string[]).map((genero) => (
          <FilterChip
            key={genero}
            label={genero}
            active={params.get('genero') === genero}
            onClick={() => updateFilter('genero', params.get('genero') === genero ? null : genero)}
          />
        ))}
      </FilterSection>

      {/* Marca */}
      <FilterSection title="Marca">
        {(BRANDS as readonly string[]).map((marca) => (
          <FilterChip
            key={marca}
            label={marca}
            active={params.get('marca') === marca}
            onClick={() => updateFilter('marca', params.get('marca') === marca ? null : marca)}
          />
        ))}
      </FilterSection>

      {/* Tipo de producto */}
      <FilterSection title="Tipo">
        {(TIPOS_PRODUCTO as readonly string[]).map((tipo) => (
          <FilterChip
            key={tipo}
            label={tipo}
            active={params.get('tipo') === tipo}
            onClick={() => updateFilter('tipo', params.get('tipo') === tipo ? null : tipo)}
          />
        ))}
      </FilterSection>

      {/* Precio */}
      <FilterSection title="Precio">
        {PRICE_RANGES.map((range) => {
          const active =
            params.get('precioMin') === range.min &&
            params.get('precioMax') === range.max
          return (
            <button
              key={range.label}
              onClick={() => {
                const next = new URLSearchParams(params.toString())
                if (active) {
                  next.delete('precioMin')
                  next.delete('precioMax')
                } else {
                  if (range.min) next.set('precioMin', range.min); else next.delete('precioMin')
                  if (range.max) next.set('precioMax', range.max); else next.delete('precioMax')
                }
                next.delete('page')
                router.push(`/productos?${next.toString()}`)
              }}
              className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-all ${
                active
                  ? 'bg-[#1a5c2e] text-white font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {range.label}
            </button>
          )
        })}
      </FilterSection>
    </aside>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-[#111410] text-xs uppercase tracking-wider mb-2.5">
        {title}
      </h3>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function FilterChip({
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
        active ? 'text-[#1a5c2e] font-semibold bg-[#f0faf3]' : 'text-gray-600 hover:text-[#111410] hover:bg-gray-50'
      }`}
    >
      <span
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
          active ? 'border-[#1a5c2e] bg-[#1a5c2e]' : 'border-gray-300'
        }`}
      >
        {active && (
          <svg viewBox="0 0 12 12" className="w-3 h-3 fill-none stroke-white stroke-2" strokeLinecap="round">
            <path d="M2 6l3 3 5-5" />
          </svg>
        )}
      </span>
      {label}
    </button>
  )
}
