import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  code: z.string(),
  subtotal: z.number(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, subtotal } = schema.parse(body)

    const supabase = createAdminClient()

    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single()

    if (!coupon) {
      return NextResponse.json({ error: 'Cupón no válido o inactivo' }, { status: 404 })
    }

    // Verificar expiración
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Este cupón ya expiró' }, { status: 400 })
    }

    // Verificar usos máximos
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ error: 'Este cupón ya fue utilizado el máximo de veces' }, { status: 400 })
    }

    // Verificar compra mínima
    if (coupon.min_purchase && subtotal < coupon.min_purchase) {
      return NextResponse.json(
        { error: `Compra mínima de $${coupon.min_purchase} MXN para usar este cupón` },
        { status: 400 }
      )
    }

    // Calcular descuento
    let discount = 0
    if (coupon.type === 'percentage') {
      discount = Math.round(subtotal * (coupon.value / 100) * 100) / 100
    } else {
      discount = Math.min(coupon.value, subtotal)
    }

    return NextResponse.json({
      coupon_id: coupon.id,
      discount,
      type: coupon.type,
      value: coupon.value,
    })
  } catch (err) {
    console.error('Error validando cupón:', err)
    return NextResponse.json({ error: 'Error al validar cupón' }, { status: 500 })
  }
}
