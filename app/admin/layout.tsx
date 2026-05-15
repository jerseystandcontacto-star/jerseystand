import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, Tag, Mail, TrendingDown, LogOut } from 'lucide-react'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', user.email!)
    .single()

  if (!adminUser) {
    // Sesión válida pero no es admin — cerrar sesión y mostrar error
    await supabase.auth.signOut()
    redirect('/admin/login?error=no_permission')
  }

  return user
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Leer pathname inyectado por el middleware para no proteger la página de login
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  await checkAdmin()

  const navLinks = [
    { href: '/admin',            label: 'Dashboard',  icon: LayoutDashboard },
    { href: '/admin/productos',  label: 'Productos',  icon: Package },
    { href: '/admin/ordenes',    label: 'Órdenes',    icon: ShoppingBag },
    { href: '/admin/cupones',    label: 'Cupones',    icon: Tag },
    { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
    { href: '/admin/compras',    label: 'Compras',    icon: TrendingDown },
  ]

  return (
    <div className="flex min-h-screen bg-[#f4f4f4]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111410] text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin">
            <span className="font-display text-2xl text-white">
              JERSEY<span className="text-[#c9a227]">STAND</span>
            </span>
          </Link>
          <p className="text-white/40 text-xs mt-1">Panel de administración</p>
        </div>

        <nav className="flex-1 py-4 px-3">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors mb-1 text-sm font-semibold"
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
          >
            Ver tienda →
          </Link>
          <form action="/api/auth/logout" method="post" className="mt-2">
            <button className="flex items-center gap-2 text-white/50 hover:text-red-400 text-sm transition-colors">
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
