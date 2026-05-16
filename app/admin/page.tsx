export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/server'
import { ShoppingBag, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { SandboxToggle } from '@/components/admin/SandboxToggle'
import Link from 'next/link'

async function getSandboxMode(): Promise<boolean> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'modo_prueba')
      .single()
    return data?.value === 'true'
  } catch {
    return false
  }
}

async function getDashboardData() {
  const supabase = createAdminClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    { count: ordersToday },
    { data: recentOrders },
    { data: lowStockVariants },
    { data: allOrders },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),

    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('product_variants')
      .select('*, product:products(name)')
      .lte('stock', 5)
      .gt('stock', 0)
      .order('stock', { ascending: true })
      .limit(5),

    supabase
      .from('orders')
      .select('total, status, created_at')
      .neq('status', 'cancelado'),
  ])

  const totalRevenue = allOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0
  const revenueToday =
    allOrders
      ?.filter((o) => new Date(o.created_at) >= today)
      .reduce((sum, o) => sum + (o.total || 0), 0) || 0

  return { ordersToday, recentOrders, lowStockVariants, totalRevenue, revenueToday }
}

export default async function AdminDashboard() {
  const [
    { ordersToday, recentOrders, lowStockVariants, totalRevenue, revenueToday },
    sandboxMode,
  ] = await Promise.all([getDashboardData(), getSandboxMode()])

  const metrics = [
    { label: 'Órdenes hoy', value: ordersToday || 0, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Ingresos hoy', value: formatPrice(revenueToday), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Ingresos totales', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-[#1a5c2e]', bg: 'bg-[#1a5c2e]/10' },
    { label: 'Poco stock', value: lowStockVariants?.length || 0, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl text-[#111410]">DASHBOARD</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="sm:w-80 shrink-0">
          <SandboxToggle initial={sandboxMode} />
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metrics.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
              <div className={`${bg} rounded-xl p-3`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Órdenes recientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="font-semibold text-[#111410]">Órdenes recientes</h2>
            <Link href="/admin/ordenes" className="text-sm text-[#1a5c2e] font-semibold hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders?.length === 0 && (
              <p className="text-center text-gray-400 py-10 text-sm">No hay órdenes aún</p>
            )}
            {recentOrders?.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-semibold text-sm text-[#111410]">{order.order_number}</p>
                  <p className="text-xs text-gray-400">{order.customer_name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-bold text-sm">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Poco stock */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="font-semibold text-[#111410] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Poco stock
            </h2>
            <Link href="/admin/productos" className="text-sm text-[#1a5c2e] font-semibold hover:underline">
              Gestionar →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {lowStockVariants?.length === 0 && (
              <p className="text-center text-gray-400 py-10 text-sm">¡Todo en stock! ✅</p>
            )}
            {lowStockVariants?.map((v: any) => (
              <div key={v.id} className="px-6 py-4">
                <p className="text-sm font-semibold text-[#111410] truncate">{v.product?.name}</p>
                <p className="text-xs text-gray-400">
                  {v.size} · {v.type}
                </p>
                <p className="text-sm font-bold text-orange-500">{v.stock} pieza{v.stock !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
