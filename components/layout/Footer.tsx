import Link from 'next/link'
import { Mail, MapPin, Shield, Award, Truck } from 'lucide-react'
import { NewsletterInline } from '@/components/home/NewsletterInline'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}
const FOOTER_CATS = [
  { href: '/productos?categoria=liga-mx',   label: 'Liga MX' },
  { href: '/productos?categoria=seleccion', label: 'Selección Mexicana' },
  { href: '/productos?categoria=europa',    label: 'Europa' },
  { href: '/productos?categoria=retro',     label: 'Retro / Vintage' },
  { href: '/productos?categoria=gear',      label: 'Gear Deportivo' },
]

export function Footer() {
  return (
    <footer className="bg-[#111410] text-white/70 mt-20">
      {/* Badges de confianza */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#c9a227] shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm">Gear 100% Auténtico</p>
              <p className="text-xs">Productos verificados y originales</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-[#c9a227] shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm">Envío a Todo México</p>
              <p className="text-xs">Estándar y express disponibles</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-[#c9a227] shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm">Garantía de Calidad</p>
              <p className="text-xs">Satisfacción o te devolvemos tu dinero</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Logo y descripción */}
        <div className="lg:col-span-1">
          <Link href="/">
            <span className="font-display text-white text-3xl tracking-wide">
              JERSEY<span className="text-[#c9a227]">STAND</span>
            </span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed">
            La tienda de jerseys y gear deportivo auténtico más confiable de México.
            Tu equipo, tu identidad.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a
              href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/jerseystandcontacto/'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/80 hover:text-[#c9a227] transition-colors text-sm"
            >
              <InstagramIcon className="w-5 h-5" />
              @jerseystand
            </a>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-[#c9a227]" />
            <span>CDMX, México</span>
          </div>
        </div>

        {/* Categorías */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
            Tienda
          </h4>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/productos" className="text-sm hover:text-[#c9a227] transition-colors">
                Todos los productos
              </Link>
            </li>
            {FOOTER_CATS.map((cat) => (
              <li key={cat.href}>
                <Link href={cat.href} className="text-sm hover:text-[#c9a227] transition-colors">
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
            Ayuda
          </h4>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/rastrear" className="text-sm hover:text-[#c9a227] transition-colors">
                Rastrear pedido
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="text-sm hover:text-[#c9a227] transition-colors">
                Contáctanos
              </Link>
            </li>
            <li>
              <Link href="/cuenta" className="text-sm hover:text-[#c9a227] transition-colors">
                Mi cuenta
              </Link>
            </li>
            <li>
              <Link href="/cuenta/ordenes" className="text-sm hover:text-[#c9a227] transition-colors">
                Mis pedidos
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
            Newsletter
          </h4>
          <p className="text-sm mb-3">
            Sé el primero en conocer nuevos jerseys, descuentos y lanzamientos exclusivos.
          </p>
          <NewsletterInline />
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-[#c9a227]" />
            <a href="mailto:jerseystandcontacto@gmail.com" className="hover:text-[#c9a227] transition-colors">
              jerseystandcontacto@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Jersey Stand. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacidad" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Privacidad
            </Link>
            <Link href="/terminos" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Términos
            </Link>
            <p className="text-xs text-white/40">Hecho con ❤️ para los futboleros de México</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

