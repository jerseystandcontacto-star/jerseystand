import { Shield, Award, Truck, RefreshCw, Lock } from 'lucide-react'

const badges = [
  {
    icon: Shield,
    title: 'Autenticidad garantizada',
    desc: 'Todos nuestros productos son 100% originales. Te lo garantizamos.',
  },
  {
    icon: Award,
    title: 'Calidad premium',
    desc: 'Telas y bordados de la más alta calidad, igual que los que usan los jugadores.',
  },
  {
    icon: Truck,
    title: 'Envío rápido y seguro',
    desc: 'Empaque protegido y rastreo en tiempo real para que tu jersey llegue perfecto.',
  },
  {
    icon: RefreshCw,
    title: 'Cambios y devoluciones',
    desc: 'Si no es lo que esperabas, te ayudamos a cambiarlo o te devolvemos tu dinero.',
  },
  {
    icon: Lock,
    title: 'Pago seguro',
    desc: 'Tu información está protegida con encriptación de nivel bancario.',
  },
]

export function AuthBadges() {
  return (
    <section className="bg-[#111410] py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-display text-5xl text-white">
            POR QUÉ ELEGIR <span className="text-[#c9a227]">JERSEY STAND</span>
          </h2>
          <p className="text-white/60 mt-3 text-lg">
            Tu confianza es nuestra prioridad
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {badges.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#c9a227]/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#c9a227]/20 flex items-center justify-center">
                <Icon className="w-6 h-6 text-[#c9a227]" />
              </div>
              <h3 className="text-white font-semibold text-sm">{title}</h3>
              <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
