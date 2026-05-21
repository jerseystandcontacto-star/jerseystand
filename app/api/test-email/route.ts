import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL

  // Diagnóstico de variables de entorno (sin exponer la clave completa)
  const envDiag = {
    RESEND_API_KEY_set:    !!apiKey,
    RESEND_API_KEY_value:  apiKey === 'pendiente' ? '⚠️ VALOR LITERAL "pendiente" — NO ES UNA CLAVE REAL' : apiKey ? `${apiKey.slice(0, 6)}...` : 'NO DEFINIDA',
    RESEND_FROM_EMAIL:     fromEmail || 'NO DEFINIDA',
    from_used:             `Jersey Stand <${fromEmail || 'onboarding@resend.dev'}>`,
  }

  if (!apiKey || apiKey === 'pendiente') {
    return NextResponse.json({
      ok: false,
      diagnosis: '❌ RESEND_API_KEY no está configurada correctamente',
      env: envDiag,
      fix: 'Configura RESEND_API_KEY con tu clave real de resend.com/api-keys',
    }, { status: 400 })
  }

  try {
    const resend = new Resend(apiKey)
    const result = await resend.emails.send({
      from: `Jersey Stand <${fromEmail || 'onboarding@resend.dev'}>`,
      to:   'jerseystandcontacto@gmail.com',
      subject: 'Test email Jersey Stand',
      html: `
        <div style="font-family:Arial,sans-serif;padding:24px;">
          <h2>✅ Test de email — Jersey Stand</h2>
          <p>Si recibes este mensaje, el sistema de emails funciona correctamente.</p>
          <p><strong>FROM:</strong> ${fromEmail || 'onboarding@resend.dev'}</p>
          <p><strong>Fecha:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
    })

    return NextResponse.json({
      ok:     !result.error,
      env:    envDiag,
      resend: result,
    })
  } catch (err: any) {
    return NextResponse.json({
      ok:    false,
      env:   envDiag,
      error: err?.message ?? String(err),
    }, { status: 500 })
  }
}
