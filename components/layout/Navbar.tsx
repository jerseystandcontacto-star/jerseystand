'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ShoppingCart, Menu, X, User, Search, Package, LogOut, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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
import { CartDrawer } from '@/components/cart/CartDrawer'

const NAV_CATS = [
  { href: '/productos?categoria=liga-mx',   label: 'Liga MX' },
  { href: '/productos?categoria=seleccion', label: 'Selección Mexicana' },
  { href: '/productos?categoria=europa',    label: 'Europa' },
  { href: '/productos?categoria=retro',     label: 'Retro / Vintage' },
  { href: '/productos?categoria=gear',      label: 'Gear Deportivo' },
]

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { getTotalItems, toggleCart } = useCartStore()
  const totalItems = getTotalItems()
  const supabase = createClient()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Auth state tracking
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedIn(!!session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    setDropdownOpen(false)
    setMenuOpen(false)
    await supabase.auth.signOut()
    // Recarga completa para que el servidor vea las cookies limpias
    window.location.href = '/'
  }

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

          {/* Categorías */}
          <ul className="hidden xl:flex items-center gap-5">
            <li>
              <Link href="/productos" className="text-white/80 hover:text-[#c9a227] text-sm font-semibold uppercase transition-colors whitespace-nowrap">
                Todos
              </Link>
            </li>
            {NAV_CATS.map((cat) => (
              <li key={cat.href}>
                <Link
                  href={cat.href}
                  className="text-white/80 hover:text-[#c9a227] text-sm font-semibold uppercase transition-colors whitespace-nowrap"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Acciones */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/vendo-mi-jersey"
              className="hidden lg:flex items-center whitespace-nowrap bg-[#c9a227] text-[#111410] text-sm font-bold uppercase px-4 py-2 rounded-lg hover:bg-[#e8bc35] transition-colors"
            >
              Vendo mi jersey
            </Link>

            <Link href="/productos" className="text-white/70 hover:text-white transition-colors p-2" aria-label="Buscar">
              <Search className="w-5 h-5" />
            </Link>

            <a
              href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/jerseystandmx/'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-[#c9a227] transition-colors p-2 hidden sm:block"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>

            {/* User — dropdown si logueado, link si no */}
            {loggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 text-[#c9a227] hover:text-[#e8bc35] transition-colors p-2"
                  aria-label="Mi cuenta"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden lg:inline text-sm font-semibold">Mi cuenta</span>
                  <ChevronDown className={`hidden lg:inline w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-[#1a1c18] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <Link
                      href="/cuenta"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white text-sm transition-colors"
                    >
                      <User className="w-4 h-4 shrink-0" />
                      Mi cuenta
                    </Link>
                    <Link
                      href="/cuenta?tab=pedidos"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white text-sm transition-colors"
                    >
                      <Package className="w-4 h-4 shrink-0" />
                      Mis pedidos
                    </Link>
                    <div className="border-t border-white/10" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/10 text-sm transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/cuenta"
                className="flex items-center gap-1 text-white/70 hover:text-white transition-colors p-2"
                aria-label="Iniciar sesión"
              >
                <User className="w-5 h-5" />
                <span className="hidden lg:inline text-sm font-semibold">Iniciar sesión</span>
              </Link>
            )}

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

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="xl:hidden text-white p-2"
              aria-label="Menú"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Menú mobile */}
        {menuOpen && (
          <div className="xl:hidden bg-[#111410] border-t border-white/10 pb-4">
            <ul className="flex flex-col">
              <li>
                <Link href="/productos" onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-white/80 hover:bg-white/5 hover:text-[#c9a227] font-semibold uppercase text-sm tracking-wide">
                  Todos los productos
                </Link>
              </li>
              {NAV_CATS.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-6 py-3 text-white/80 hover:bg-white/5 hover:text-[#c9a227] font-semibold uppercase text-sm tracking-wide"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
              <li className="px-6 pt-3 border-t border-white/10 mt-2">
                <Link href="/vendo-mi-jersey" onClick={() => setMenuOpen(false)} className="block py-2 text-[#c9a227] hover:text-[#e8bc35] font-bold text-sm">
                  Vendo mi jersey
                </Link>
              </li>
              {loggedIn ? (
                <>
                  <li className="px-6">
                    <Link href="/cuenta" onClick={() => setMenuOpen(false)} className="block py-2 text-white/80 hover:text-white font-semibold text-sm">
                      Mi cuenta
                    </Link>
                  </li>
                  <li className="px-6">
                    <Link href="/cuenta?tab=pedidos" onClick={() => setMenuOpen(false)} className="block py-2 text-white/80 hover:text-white font-semibold text-sm">
                      Mis pedidos
                    </Link>
                  </li>
                  <li className="px-6">
                    <button onClick={handleSignOut} className="block py-2 text-red-400 font-semibold text-sm text-left w-full">
                      Cerrar sesión
                    </button>
                  </li>
                </>
              ) : (
                <li className="px-6">
                  <Link href="/cuenta" onClick={() => setMenuOpen(false)} className="block py-2 text-white/80 hover:text-white font-semibold text-sm">
                    Iniciar sesión
                  </Link>
                </li>
              )}
              <li className="px-6">
                <Link href="/rastrear" onClick={() => setMenuOpen(false)} className="block py-2 text-white/80 hover:text-white font-semibold text-sm">
                  Rastrear pedido
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      <div className="h-[104px]" />
      <CartDrawer />
    </>
  )
}
