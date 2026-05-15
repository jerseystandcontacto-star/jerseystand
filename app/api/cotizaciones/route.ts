import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendQuoteConfirmation, sendAdminQuoteNotification } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      customer_name,
      email,
      phone,
      city,
      product_type,
      quantity_range,
      team_name,
      colors,
      has_logo,
      player_names,
      numbers,
      deadline,
      budget_range,
      notes,
      sizes_breakdown,
    } = body

    if (!customer_name || !email || !phone || !city || !product_type || !quantity_range) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('quote_requests')
      .insert({
        customer_name,
        email,
        phone,
        city,
        product_type,
        quantity_range,
        team_name: team_name || null,
        colors: colors || null,
        has_logo: has_logo ?? false,
        player_names: player_names || null,
        numbers: numbers || null,
        deadline: deadline || null,
        budget_range: budget_range || null,
        notes: notes || null,
        sizes_breakdown: sizes_breakdown || null,
        reference_images: [],
        status: 'nuevo',
      })
      .select()
      .single()

    if (error) {
      console.error('Error guardando cotización:', error)
      return NextResponse.json({ error: 'Error al guardar la solicitud' }, { status: 500 })
    }

    // Enviar emails de forma asíncrona (no bloqueante)
    Promise.all([
      sendQuoteConfirmation({ customer_name, email, product_type, quantity_range }),
      sendAdminQuoteNotification({ customer_name, email, phone, city, product_type, quantity_range, team_name, budget_range, notes }),
    ]).catch(console.error)

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Error en /api/cotizaciones:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
