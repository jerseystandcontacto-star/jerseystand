'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { BRANDS, GENDERS, TIPOS_PRODUCTO } from '@/types'

const COUNTRIES = [
  { code: 'México',          flag: '🇲🇽' },
  { code: 'España',          flag: '🇪🇸' },
  { code: 'Inglaterra',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'Alemania',        flag: '🇩🇪' },
  { code: 'Italia',          flag: '🇮🇹' },
  { code: 'Francia',         flag: '🇫🇷' },
  { code: 'Argentina',       flag: '🇦🇷' },
  { code: 'Brasil',          flag: '🇧🇷' },
  { code: 'Estados Unidos',  flag: '🇺🇸' },
  { code: 'Otros',           flag: '🌍' },
]

const SORT_OPTIONS = [
  { value: '',             label: 'Relevancia'      },
  { value: 'precio_asc',  label: 'Menor precio'    },
  { value: 'precio_desc', label: 'Mayor precio'    },
  { value: 'oferta',      label: 'Ofertas primero' },
]

const BADGE_LABELS: Record<string, string> = {
  pais:   'País',
  genero: 'Género',
  marca:  'Marca',
  tipo:   'Tipo',
  buscar: 'Buscar',
}

export function ProductFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const update = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      router.push(`/productos?${next.toString()}`)
    },
    [params, router]
  )

  const clearAll = () => {
    const cat = params.get('categoria')
    router.push(cat ? `/productos?categoria=${cat}` : '/productos')
  }

  const activeKeys = Object.keys(BADGE_LABELS).filter((k) => params.has(k))

  return (
    <div className="flex flex-col gap-3">
      {/* Dropdown row */}
      <div className="flex flex-wrap gap-2 items-center">
        <PaisDropdown
          value={params.get('pais') || ''}
          onChange={(v) => update('pais', v || null)}
        />

        <FilterSelect
          value={params.get('genero') || ''}
          onChange={(v) => update('genero', v || null)}
          options={[
            { value: '', label: 'Género' },
            ...(GENDERS as readonly string[]).map((g) => ({ value: g, label: g })),
          ]}
        />

        <FilterSelect
          value={params.get('marca') || ''}
          onChange={(v) => update('marca', v || null)}
          options={[
            { value: '', label: 'Marca' },
            ...(BRANDS as readonly string[]).map((b) => ({ value: b, label: b })),
          ]}
        />

        <FilterSelect
          value={params.get('tipo') || ''}
          onChange={(v) => update('tipo', v || null)}
          options={[
            { value: '', label: 'Tipo' },
            ...(TIPOS_PRODUCTO as readonly string[]).map((t) => ({ value: t, label: t })),
          ]}
        />

        <FilterSelect
          value={params.get('orden') || ''}
          onChange={(v) => update('orden', v || null)}
          options={SORT_OPTIONS}
        />

        {activeKeys.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Active filter badges */}
      {activeKeys.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeKeys.map((key) => {
            const val = params.get(key)!
            return (
              <span
                key={key}
                className="flex items-center gap-1 pl-3 pr-2 py-1 bg-[#1a5c2e]/10 text-[#1a5c2e] text-sm font-medium rounded-full"
              >
                {BADGE_LABELS[key]}: {key === 'buscar' ? `"${val}"` : val}
                <button
                  type="button"
                  onClick={() => update(key, null)}
                  className="ml-0.5 p-0.5 hover:bg-[#1a5c2e]/20 rounded-full transition-colors"
                  aria-label={`Quitar filtro ${BADGE_LABELS[key]}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── País dropdown with search ────────────────────────────────────────────────

function PaisDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const ref                 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = COUNTRIES.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  )
  const selected = COUNTRIES.find((c) => c.code === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch('') }}
        className={`flex items-center gap-2 px-4 py-2 border-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
          value
            ? 'border-[#1a5c2e] bg-[#1a5c2e]/5 text-[#1a5c2e]'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
        }`}
      >
        {selected ? `${selected.flag} ${selected.code}` : 'País de liga'}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar país..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a5c2e]"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {!search && (
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false) }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  !value ? 'text-[#1a5c2e] font-semibold' : 'text-gray-600'
                }`}
              >
                Todos los países
              </button>
            )}
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => { onChange(c.code); setOpen(false); setSearch('') }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 hover:bg-gray-50 transition-colors ${
                  value === c.code
                    ? 'text-[#1a5c2e] font-semibold bg-[#1a5c2e]/5'
                    : 'text-gray-700'
                }`}
              >
                <span className="text-base leading-none">{c.flag}</span>
                <span>{c.code}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-400 italic">Sin resultados</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Simple filter select ─────────────────────────────────────────────────────

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none pl-4 pr-8 py-2 border-2 rounded-xl text-sm font-medium cursor-pointer focus:outline-none transition-colors ${
          value
            ? 'border-[#1a5c2e] bg-[#1a5c2e]/5 text-[#1a5c2e]'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  )
}
