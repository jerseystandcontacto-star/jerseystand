import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendNewsletterConfirmation } from '@/lib/resend'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)

    const supabase = createAdminClient()

    // Verificar si ya está suscrito
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, active')
      .eq('email', email)
      .single()

    if (existing) {
      if (existing.active) {
        return NextResponse.json({ message: 'Ya estás suscrito' }, { status: 200 })
      }
      // Reactivar suscripción
      await supabase
        .from('newsletter_subscribers')
        .update({ active: true })
        .eq('email', email)
    } else {
      // Nuevo suscriptor
      await supabase.from('newsletter_subscribers').insert({ email })
    }

    // Enviar email de bienvenida
    try {
      await sendNewsletterConfirmation(email)
    } catch (err) {
      console.error('Error enviando email newsletter:', err)
    }

    return NextResponse.json({ message: 'Suscripción exitosa' })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }
    console.error('Error newsletter:', err)
    return NextResponse.json({ error: 'Error al procesar suscripción' }, { status: 500 })
  }
}
