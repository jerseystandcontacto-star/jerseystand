import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const resend = new Resend(process.env.RESEND_API_KEY)
    const from = process.env.EMAIL_FROM || 'Jersey Stand <noreply@jerseystand.com>'

    await resend.emails.send({
      from,
      to: process.env.EMAIL_ADMIN || 'admin@jerseystand.com',
      replyTo: data.email,
      subject: `📩 Contacto: ${data.subject}`,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Asunto:</strong> ${data.subject}</p>
        <hr>
        <p><strong>Mensaje:</strong></p>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
      `,
    })

    await resend.emails.send({
      from,
      to: data.email,
      subject: 'Recibimos tu mensaje — Jersey Stand',
      html: `
        <p>Hola ${data.name},</p>
        <p>Recibimos tu mensaje sobre: <strong>${data.subject}</strong></p>
        <p>Te responderemos a <strong>${data.email}</strong> en menos de 24 horas hábiles.</p>
        <p>¡Gracias por contactarnos!</p>
        <br>
        <p>— El equipo de Jersey Stand</p>
      `,
    })

    return NextResponse.json({ message: 'Mensaje enviado exitosamente' })
  } catch (err: any) {
    console.error('Error contact:', err)
    return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 })
  }
}
