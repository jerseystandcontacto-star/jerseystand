import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendAdminCompraNotification } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customer_name, email, whatsapp, team, size, season, condition, asking_price, photos, description } = body

    if (!customer_name || !email || !whatsapp || !team || !size || !season || !condition || !asking_price) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }
    if (!photos || photos.length < 2) {
      return NextResponse.json({ error: 'Sube al menos 2 fotos del jersey' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('jersey_compras')
      .insert({
        customer_name,
        email,
        whatsapp,
        team,
        size,
        season,
        condition,
        asking_price: parseFloat(asking_price),
        photos,
        description: description || null,
        status: 'pendiente',
      })
      .select()
      .single()

    if (error) {
      console.error('Error guardando compra:', error)
      return NextResponse.json({ error: 'Error al guardar la solicitud' }, { status: 500 })
    }

    Promise.all([
      sendAdminCompraNotification({ customer_name, email, whatsapp, team, size, season, condition, asking_price: parseFloat(asking_price), description, photos }),
    ]).catch(console.error)

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Error en /api/compras:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
