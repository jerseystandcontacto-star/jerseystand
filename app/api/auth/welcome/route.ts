import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    await sendWelcomeEmail(email, name || 'amigo')
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[auth/welcome]', err)
    return NextResponse.json({ error: 'Error al enviar email' }, { status: 500 })
  }
}
