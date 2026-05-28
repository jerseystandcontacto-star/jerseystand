import Link from 'next/link'
import { Shield, Star, Truck } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative bg-[#111410] text-white overflow-hidden min-h-[90vh] flex items-center">
      {/* Fondo con gradiente */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#111410] via-[#1a3a1f] to-[#0a1a10]"
        aria-hidden="true"
      />

      {/* Patrón decorativo */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 40px,
            #c9a227 40px,
            #c9a227 41px
          )`,
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Texto */}
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-[#1a5c2e] text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-[#c9a227] rounded-full animate-pulse" />
            Gear 100% Auténtico
          </div>

          <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl leading-none mb-6">
            TU EQUIPO,
            <br />
            <span className="text-[#c9a227]">TU JERSEY</span>
          </h1>

          <p className="text-white/70 text-lg sm:text-xl max-w-lg leading-relaxed mb-8">
            Los jerseys y gear deportivo más auténticos de México. Liga MX, Selección,
            Europa y más. Cada prenda, una historia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/productos"
              className="btn-secondary text-lg px-8 py-4 rounded-xl font-display tracking-wider"
            >
              VER CATÁLOGO
            </Link>
            <Link
              href="/productos?categoria=retro-vintage"
              className="btn-outline border-white/30 text-white hover:bg-white hover:text-[#111410] text-lg px-8 py-4 rounded-xl font-display tracking-wider"
            >
              RETRO & VINTAGE
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 mt-10">
            <div className="auth-badge bg-white/10 border-white/20 text-white/80">
              <Shield className="w-4 h-4 text-[#c9a227]" />
              Autenticidad garantizada
            </div>
            <div className="auth-badge bg-white/10 border-white/20 text-white/80">
              <Truck className="w-4 h-4 text-[#c9a227]" />
              Envío a todo México
            </div>
            <div className="auth-badge bg-white/10 border-white/20 text-white/80">
              <Star className="w-4 h-4 text-[#c9a227]" />
              Envío a todo México
            </div>
          </div>
        </div>

        {/* Visual */}
        <div className="order-first lg:order-last w-full">
          <div className="relative h-[250px] lg:h-[620px] w-full overflow-hidden rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a5c2e]/20 to-[#c9a227]/10 blur-3xl pointer-events-none" aria-hidden="true" />
            <img
              src="/stand.jpg"
              alt="Jersey Stand"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
        <p className="text-xs uppercase tracking-widest">Explorar</p>
        <div className="w-px h-8 bg-white/20 animate-pulse" />
      </div>
    </section>
  )
}
