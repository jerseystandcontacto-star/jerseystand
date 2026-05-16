'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, Menu, X, User, Search } from 'lucide-react'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}
import { useCartStore } from '@/store/cartStore'
import { CATEGORIES } from '@/types'
import { CartDrawer } from '@/components/cart/CartDrawer'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { getTotalItems, toggleCart } = useCartStore()
  const totalItems = getTotalItems()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#111410] shadow-lg' : 'bg-[#111410]'
        }`}
      >
        {/* Barra superior */}
        <div className="bg-[#1a5c2e] py-1.5 text-center">
          <p className="text-white text-xs font-medium">
            🚚 Envío gratis en pedidos mayores a $1,500 MXN &nbsp;|&nbsp;
            <Link href="/rastrear" className="underline hover:text-[#c9a227]">
              Rastrea tu pedido
            </Link>
          </p>
        </div>

        <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <span className="font-display text-white text-3xl tracking-wide">
              JERSEY<span className="text-[#c9a227]">STAND</span>
            </span>
          </Link>

          {/* Categorías — solo xl+ para que no se amontonen */}
          <ul className="hidden xl:flex items-center gap-5">
            <li>
              <Link
                href="/productos"
                className="text-white/80 hover:text-[#c9a227] text-sm font-semibold uppercase transition-colors whitespace-nowrap"
              >
                Todos
              </Link>
            </li>
            {CATEGORIES.map((cat) => (
              <li key={cat.value}>
                <Link
                  href={`/productos?categoria=${cat.value}`}
                  className="text-white/80 hover:text-[#c9a227] text-sm font-semibold uppercase transition-colors whitespace-nowrap"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Acciones + CTA */}
          <div className="flex items-center gap-2 shrink-0">
            {/* CTA — visible desde lg, nunca corta en dos líneas */}
            <Link
              href="/vendo-mi-jersey"
              className="hidden lg:flex items-center whitespace-nowrap bg-[#c9a227] text-[#111410] text-sm font-bold uppercase px-4 py-2 rounded-lg hover:bg-[#e8bc35] transition-colors"
            >
              Vendo mi jersey
            </Link>

            <Link
              href="/productos"
              className="text-white/70 hover:text-white transition-colors p-2"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </Link>

            <a
              href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/jerseystandcontacto/'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-[#c9a227] transition-colors p-2 hidden sm:block"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>

            <Link
              href="/cuenta"
              className="text-white/70 hover:text-white transition-colors p-2"
              aria-label="Mi cuenta"
            >
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={toggleCart}
              className="relative text-white/70 hover:text-white transition-colors p-2"
              aria-label="Carrito"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c9a227] text-[#111410] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* Hamburger — oculto en xl+ */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="xl:hidden text-white p-2"
              aria-label="Menú"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Menú mobile / tablet — visible bajo xl */}
        {menuOpen && (
          <div className="xl:hidden bg-[#111410] border-t border-white/10 pb-4">
            <ul className="flex flex-col">
              <li>
                <Link
                  href="/productos"
                  onClick={() => setMenuOpen(false)}
                  className="block px-6 py-3 text-white/80 hover:bg-white/5 hover:text-[#c9a227] font-semibold uppercase text-sm tracking-wide"
                >
                  Todos los productos
                </Link>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat.value}>
                  <Link
                    href={`/productos?categoria=${cat.value}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-6 py-3 text-white/80 hover:bg-white/5 hover:text-[#c9a227] font-semibold uppercase text-sm tracking-wide"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
              <li className="px-6 pt-3 border-t border-white/10 mt-2">
                <Link
                  href="/vendo-mi-jersey"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-[#c9a227] hover:text-[#e8bc35] font-bold text-sm"
                >
                  Vendo mi jersey
                </Link>
              </li>
              <li className="px-6">
                <Link
                  href="/cuenta"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-white/80 hover:text-white font-semibold text-sm"
                >
                  Mi cuenta
                </Link>
              </li>
              <li className="px-6">
                <Link
                  href="/rastrear"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-white/80 hover:text-white font-semibold text-sm"
                >
                  Rastrear pedido
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Espacio para el header fijo */}
      <div className="h-[104px]" />

      <CartDrawer />
    </>
  )
}
