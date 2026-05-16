import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gold'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    gold: 'bg-[#c9a227] text-[#111410]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// Badge de estado de orden
export function OrderStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    pendiente: { label: 'Pendiente de pago', variant: 'warning' },
    pagado: { label: 'Pagado', variant: 'success' },
    preparando: { label: 'Preparando', variant: 'info' },
    enviado: { label: 'Enviado', variant: 'info' },
    entregado: { label: 'Entregado', variant: 'success' },
    cancelado: { label: 'Cancelado', variant: 'error' },
    prueba: { label: '🧪 Prueba', variant: 'gold' },
  }

  const cfg = config[status] || { label: status, variant: 'default' as const }

  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}
