import Link from 'next/link'
import type { ProductCategory } from '@/types'

interface CategoryCard {
  value: ProductCategory
  label: string
  emoji: string
  description: string
  color: string
}

const categories: CategoryCard[] = [
  {
    value: 'liga-mx',
    label: 'Liga MX',
    emoji: '🦅',
    description: 'América, Chivas, Cruz Azul y más',
    color: 'from-green-900 to-green-700',
  },
  {
    value: 'seleccion-mexicana',
    label: 'Selección Mexicana',
    emoji: '🇲🇽',
    description: 'Viste los colores de El Tri',
    color: 'from-red-900 to-green-800',
  },
  {
    value: 'europa',
    label: 'Europa',
    emoji: '⭐',
    description: 'Real Madrid, Barcelona, PSG y más',
    color: 'from-blue-900 to-blue-700',
  },
  {
    value: 'retro-vintage',
    label: 'Retro & Vintage',
    emoji: '🏆',
    description: 'Clásicos que nunca pasan de moda',
    color: 'from-amber-900 to-amber-700',
  },
  {
    value: 'gear',
    label: 'Gear Deportivo',
    emoji: '👟',
    description: 'Sudaderas, playeras y accesorios',
    color: 'from-gray-800 to-gray-600',
  },
]

export function CategorySection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="font-display text-5xl sm:text-6xl text-[#111410]">
          EXPLORA POR <span className="text-[#1a5c2e]">CATEGORÍA</span>
        </h2>
        <p className="text-gray-500 mt-3 text-lg">
          Encuentra el jersey perfecto para tu equipo
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={`/productos?categoria=${cat.value}`}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.color} p-6 text-white hover:scale-105 transition-transform duration-300 cursor-pointer`}
          >
            <div className="text-4xl mb-3">{cat.emoji}</div>
            <h3 className="font-display text-xl leading-tight">{cat.label}</h3>
            <p className="text-white/60 text-xs mt-1 leading-snug">{cat.description}</p>

            <div className="mt-4 text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
              Ver todos →
            </div>

            {/* Efecto hover */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
          </Link>
        ))}
      </div>
    </section>
  )
}
