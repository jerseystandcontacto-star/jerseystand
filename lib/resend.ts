import { Resend } from 'resend'
import type { Order } from '@/types'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key || key === 'pendiente') {
    console.error('[resend] RESEND_API_KEY no configurada o es "pendiente" — los emails NO se enviarán')
  }
  return new Resend(key || 'dummy')
}

// Hardcoded a onboarding@resend.dev hasta tener dominio verificado
function getFrom() {
  return 'Jersey Stand <onboarding@resend.dev>'
}

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || 'jerseystandcontacto@gmail.com'
}

async function sendEmail(type: string, opts: Parameters<Resend['emails']['send']>[0]) {
  const resend = getResend()
  console.log(`[resend:${type}] Enviando | from: ${opts.from} | to: ${opts.to} | key: ${process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.slice(0, 8) + '...' : 'NO DEFINIDA'}`)
  try {
    const result = await resend.emails.send(opts)
    if (result.error) {
      console.error(`[resend:${type}] Error de API:`, JSON.stringify(result.error))
    } else {
      console.log(`[resend:${type}] Enviado OK | id:`, result.data?.id)
    }
    return result
  } catch (err) {
    console.error(`[resend:${type}] Excepción:`, JSON.stringify(err, Object.getOwnPropertyNames(err)))
    throw err
  }
}

const HEADER = `
  <div style="background:#111410;padding:30px;text-align:center;">
    <h1 style="margin:0;font-size:28px;letter-spacing:3px;">
      <span style="color:#ffffff;font-family:Arial,sans-serif;font-weight:900;">JERSEY </span><span style="color:#c9a227;font-family:Arial,sans-serif;font-weight:900;">STAND</span>
    </h1>
  </div>
`

const FOOTER = `
  <div style="background:#111410;padding:20px;text-align:center;color:#888;font-size:12px;">
    <p style="margin:0 0 8px;">Jersey Stand | Gear auténtico</p>
    <p style="margin:0;">
      <a href="https://www.instagram.com/jerseystandcontacto/" style="color:#c9a227;text-decoration:none;">@jerseystandcontacto</a>
      &nbsp;·&nbsp;
      <a href="mailto:jerseystandcontacto@gmail.com" style="color:#c9a227;text-decoration:none;">jerseystandcontacto@gmail.com</a>
    </p>
  </div>
`

function wrap(body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;font-family:Arial,sans-serif;color:#333333;">
    ${HEADER}
    ${body}
    ${FOOTER}
  </div>
</body></html>`
}

// 1. Bienvenida al registrarse
export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await sendEmail('welcome', {
      from: getFrom(),
      to: email,
      subject: '¡Bienvenido a Jersey Stand! 👕',
      html: wrap(`
        <div style="padding:40px 30px;">
          <h2 style="color:#111410;margin:0 0 16px;font-size:22px;">¡Hola, ${name}!</h2>
          <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
            Ya eres parte de la familia <strong>Jersey Stand</strong>.
          </p>
          <p style="font-size:15px;line-height:1.6;margin:0 0 32px;color:#555;">
            Explora nuestra colección de jerseys de fútbol auténticos — ligas nacionales, selecciones y gear exclusivo.
          </p>
          <div style="text-align:center;margin:0 0 32px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/catalogo"
               style="background:#c9a227;color:#111410;padding:14px 40px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;display:inline-block;">
              Ver catálogo
            </a>
          </div>
          <p style="color:#888;font-size:13px;margin:0;">
            Síguenos en Instagram
            <a href="https://www.instagram.com/jerseystandcontacto/" style="color:#c9a227;">@jerseystandcontacto</a>
            para enterarte primero de nuevos lanzamientos y promociones.
          </p>
        </div>
      `),
    })
  } catch (err) {
    console.error('[resend:welcome] error final:', err)
  }
}

// 2. Confirmación de orden al cliente
export async function sendOrderConfirmation(order: Order) {
  try {
    const itemsHtml = order.items
      ?.map(
        (item) => `
        <tr>
          <td style="padding:10px 8px;border-bottom:1px solid #eeeeee;">
            <strong>${item.product_name}</strong><br>
            <span style="color:#888;font-size:13px;">${item.size} · ${item.type}${item.season ? ` · ${item.season}` : ''}</span>
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #eeeeee;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eeeeee;text-align:right;white-space:nowrap;">$${(item.price * item.quantity).toFixed(2)} MXN</td>
        </tr>
      `
      )
      .join('')

    const shippingLabel: Record<string, string> = {
      estandar: 'Estándar (5–7 días hábiles)',
      express: 'Express (2–3 días hábiles)',
      gratis: 'Envío gratis',
    }

    const addr = order.shipping_address
    await sendEmail('order-confirmation', {
      from: getFrom(),
      to: order.customer_email,
      subject: `✅ Orden #${order.order_number} confirmada - Jersey Stand`,
      html: wrap(`
        <div style="padding:40px 30px;">
          <h2 style="color:#111410;margin:0 0 8px;font-size:22px;">¡Orden confirmada!</h2>
          <p style="margin:0 0 24px;">
            Hola <strong>${order.customer_name}</strong>, recibimos tu pedido y ya lo estamos procesando.
            Te avisamos cuando tu paquete salga.
          </p>

          <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:0 0 24px;">
            <p style="margin:0;"><strong>Número de orden:</strong> ${order.order_number}</p>
            <p style="margin:6px 0 0;"><strong>Tipo de envío:</strong> ${shippingLabel[order.shipping_type] || order.shipping_type}</p>
          </div>

          <h3 style="margin:0 0 12px;color:#111410;font-size:16px;">Resumen del pedido</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr style="background:#111410;color:#ffffff;">
                <th style="padding:10px 8px;text-align:left;font-weight:600;">Producto</th>
                <th style="padding:10px 8px;text-align:center;font-weight:600;">Cant.</th>
                <th style="padding:10px 8px;text-align:right;font-weight:600;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="text-align:right;margin-top:16px;padding-top:16px;border-top:2px solid #eeeeee;font-size:14px;">
            <p style="margin:4px 0;">Subtotal: $${order.subtotal.toFixed(2)} MXN</p>
            ${order.discount > 0 ? `<p style="margin:4px 0;color:#1a5c2e;">Descuento: -$${order.discount.toFixed(2)} MXN</p>` : ''}
            <p style="margin:4px 0;">Envío: ${order.shipping_cost === 0 ? 'Gratis 🎉' : `$${order.shipping_cost.toFixed(2)} MXN`}</p>
            <p style="font-size:18px;font-weight:bold;color:#111410;margin:10px 0 0;">Total: $${order.total.toFixed(2)} MXN</p>
          </div>

          <h3 style="margin:28px 0 12px;color:#111410;font-size:16px;">Dirección de entrega</h3>
          <p style="margin:0;line-height:1.9;color:#555;font-size:14px;">
            ${addr.full_name}<br>
            ${addr.street} ${addr.number}<br>
            Col. ${addr.colonia}<br>
            ${addr.city}, ${addr.state} — CP ${addr.zip}
            ${addr.references ? `<br><em>Ref: ${addr.references}</em>` : ''}
          </p>

          <p style="margin:28px 0 0;color:#888;font-size:13px;">
            Rastrea tu pedido en
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/rastrear?orden=${order.order_number}" style="color:#c9a227;">jerseystand.com/rastrear</a>
          </p>
        </div>
      `),
    })
  } catch (err) {
    console.error('[resend:order-confirmation] error final:', err)
  }
}

// 3. Notificación al admin de nueva orden
export async function sendAdminOrderNotification(order: Order) {
  try {
    const itemsList =
      order.items
        ?.map(
          (item) =>
            `• ${item.product_name} (${item.size} · ${item.type}) ×${item.quantity} — $${(item.price * item.quantity).toFixed(2)} MXN`
        )
        .join('<br>') || ''

    const addr = order.shipping_address
    await sendEmail('admin-order', {
      from: getFrom(),
      to: getAdminEmail(),
      subject: `🛒 Nueva orden #${order.order_number} - $${order.total.toFixed(2)} MXN`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;padding:24px;">
          <h2 style="margin:0 0 20px;">🛒 Nueva orden recibida</h2>
          <p><strong>Número:</strong> ${order.order_number}</p>
          <p><strong>Cliente:</strong> ${order.customer_name}</p>
          <p><strong>Email:</strong> ${order.customer_email}</p>
          <p><strong>Teléfono:</strong> ${order.customer_phone || '—'}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
          <p><strong>Productos:</strong><br><br>${itemsList}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
          <p><strong>Tipo de envío:</strong> ${order.shipping_type}</p>
          <p><strong>Dirección:</strong> ${addr.street} ${addr.number}, Col. ${addr.colonia}, ${addr.city}, ${addr.state} CP ${addr.zip}</p>
          ${order.discount > 0 ? `<p><strong>Descuento aplicado:</strong> -$${order.discount.toFixed(2)} MXN</p>` : ''}
          <p style="font-size:20px;font-weight:bold;color:#111410;"><strong>Total: $${order.total.toFixed(2)} MXN</strong></p>
          <p style="margin-top:24px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/ordenes/${order.id}"
               style="background:#c9a227;color:#111410;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
              Ver orden en el panel
            </a>
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[resend:admin-order] error final:', err)
  }
}

// 4. Orden enviada (admin cambia status a "enviado")
export async function sendShippingNotification(order: Order, trackingNumber: string) {
  try {
    await sendEmail('shipping', {
      from: getFrom(),
      to: order.customer_email,
      subject: `📦 Tu pedido #${order.order_number} está en camino`,
      html: wrap(`
        <div style="padding:40px 30px;">
          <h2 style="color:#111410;margin:0 0 16px;font-size:22px;">¡Tu pedido está en camino! 🚀</h2>
          <p style="margin:0 0 24px;">
            Hola <strong>${order.customer_name}</strong>, tu pedido <strong>${order.order_number}</strong> fue enviado.
          </p>

          <div style="background:#111410;border-radius:8px;padding:24px;text-align:center;margin:0 0 24px;">
            <p style="margin:0 0 6px;color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Número de guía</p>
            <p style="margin:0;color:#c9a227;font-size:26px;font-weight:bold;letter-spacing:3px;">${trackingNumber}</p>
          </div>

          <p style="color:#555;margin:0 0 12px;font-size:14px;">
            Usa este número en el sitio de la paquetería para rastrear tu envío.
          </p>
          <p style="color:#555;margin:0 0 32px;font-size:14px;">
            <strong>Tiempo estimado de entrega:</strong> 3–7 días hábiles.
          </p>

          <div style="text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/rastrear?orden=${order.order_number}"
               style="background:#c9a227;color:#111410;padding:14px 40px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;display:inline-block;">
              Rastrear mi pedido
            </a>
          </div>
        </div>
      `),
    })
  } catch (err) {
    console.error('[resend:shipping] error final:', err)
  }
}

// 5. Confirmación de suscripción al newsletter
export async function sendNewsletterConfirmation(email: string) {
  try {
    await sendEmail('newsletter', {
      from: getFrom(),
      to: email,
      subject: '¡Ya eres parte de Jersey Stand! 🎽',
      html: wrap(`
        <div style="padding:40px 30px;text-align:center;">
          <h2 style="color:#111410;margin:0 0 16px;font-size:22px;">¡Ya eres parte del equipo!</h2>
          <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
            Gracias por suscribirte. Serás el primero en enterarte de:
          </p>
          <ul style="text-align:left;display:inline-block;color:#444;line-height:2.2;font-size:15px;margin:0 0 36px;padding-left:20px;">
            <li>Nuevos jerseys y gear exclusivo</li>
            <li>Promociones y descuentos especiales</li>
            <li>Lanzamientos de temporada</li>
            <li>Preventas y ediciones limitadas</li>
          </ul>
          <div>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/catalogo"
               style="background:#c9a227;color:#111410;padding:14px 40px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;display:inline-block;">
              Ver catálogo
            </a>
          </div>
        </div>
      `),
    })
  } catch (err) {
    console.error('[resend:newsletter] error final:', err)
  }
}

// 6. Notificación al admin: nuevo jersey para vender
export async function sendAdminCompraNotification(compra: {
  customer_name: string
  email: string
  whatsapp: string
  team: string
  size: string
  season: string
  condition: string
  asking_price: number
  description?: string | null
  photos: string[]
}) {
  try {
    const conditionLabel: Record<string, string> = {
      nuevo: 'Nuevo',
      como_nuevo: 'Como nuevo',
      buen_estado: 'Buen estado',
      regular: 'Regular',
    }
    const photosHtml = compra.photos
      .map(
        (url) =>
          `<img src="${url}" style="width:120px;height:120px;object-fit:cover;border-radius:8px;margin:4px;" />`
      )
      .join('')

    await sendEmail('admin-compra', {
      from: getFrom(),
      to: getAdminEmail(),
      subject: `👕 Cliente quiere vender un jersey - Jersey Stand`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;padding:24px;">
          <h2 style="margin:0 0 20px;">👕 Cliente quiere vender un jersey</h2>
          <p><strong>Nombre:</strong> ${compra.customer_name}</p>
          <p><strong>Email:</strong> ${compra.email}</p>
          <p><strong>WhatsApp:</strong> <a href="https://wa.me/${compra.whatsapp.replace(/\D/g, '')}" style="color:#c9a227;">${compra.whatsapp}</a></p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
          <p><strong>Equipo:</strong> ${compra.team}</p>
          <p><strong>Talla:</strong> ${compra.size}</p>
          <p><strong>Temporada:</strong> ${compra.season}</p>
          <p><strong>Condición:</strong> ${conditionLabel[compra.condition] ?? compra.condition}</p>
          <p><strong>Precio que pide:</strong> $${compra.asking_price.toFixed(2)} MXN</p>
          ${compra.description ? `<p><strong>Descripción:</strong> ${compra.description}</p>` : ''}
          <h3 style="margin:20px 0 10px;">Fotos</h3>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">${photosHtml}</div>
          <p style="margin-top:28px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/compras"
               style="background:#c9a227;color:#111410;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
              Ver en panel admin
            </a>
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[resend:admin-compra] error final:', err)
  }
}

// Confirmación de cotización al cliente
export async function sendQuoteConfirmation(quote: {
  customer_name: string
  email: string
  product_type: string
  quantity_range: string
}) {
  try {
    await sendEmail('quote-confirmation', {
      from: getFrom(),
      to: quote.email,
      subject: '✅ Recibimos tu cotización - Jersey Stand',
      html: wrap(`
        <div style="padding:40px 30px;">
          <h2 style="color:#111410;margin:0 0 16px;font-size:22px;">¡Cotización recibida!</h2>
          <p style="margin:0 0 16px;">
            Hola <strong>${quote.customer_name}</strong>, recibimos tu solicitud.
            Nuestro equipo la revisará y te contactará en un máximo de <strong>24–48 horas hábiles</strong> con el presupuesto personalizado.
          </p>
          <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:0 0 24px;">
            <p style="margin:0;"><strong>Tipo de producto:</strong> ${quote.product_type}</p>
            <p style="margin:6px 0 0;"><strong>Cantidad:</strong> ${quote.quantity_range} piezas</p>
          </div>
          <p style="color:#888;font-size:13px;margin:0;">
            Para consultas urgentes escríbenos por Instagram:
            <a href="https://www.instagram.com/jerseystandcontacto/" style="color:#c9a227;">@jerseystandcontacto</a>
          </p>
        </div>
      `),
    })
  } catch (err) {
    console.error('[resend:quote-confirmation] error final:', err)
  }
}

// Notificación al admin de nueva cotización
export async function sendAdminQuoteNotification(quote: {
  customer_name: string
  email: string
  phone: string
  city: string
  product_type: string
  quantity_range: string
  team_name?: string | null
  budget_range?: string | null
  notes?: string | null
}) {
  try {
    await sendEmail('admin-quote', {
      from: getFrom(),
      to: getAdminEmail(),
      subject: `🆕 Nueva cotización de ${quote.customer_name} - Jersey Stand`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;padding:24px;">
          <h2 style="margin:0 0 20px;">Nueva solicitud de cotización</h2>
          <p><strong>Cliente:</strong> ${quote.customer_name}</p>
          <p><strong>Email:</strong> ${quote.email}</p>
          <p><strong>Teléfono:</strong> ${quote.phone}</p>
          <p><strong>Ciudad:</strong> ${quote.city}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
          <p><strong>Tipo de producto:</strong> ${quote.product_type}</p>
          <p><strong>Cantidad:</strong> ${quote.quantity_range} piezas</p>
          ${quote.team_name ? `<p><strong>Equipo/nombre:</strong> ${quote.team_name}</p>` : ''}
          ${quote.budget_range ? `<p><strong>Presupuesto:</strong> ${quote.budget_range}</p>` : ''}
          ${quote.notes ? `<p><strong>Notas:</strong> ${quote.notes}</p>` : ''}
          <p style="margin-top:24px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/cotizaciones"
               style="background:#c9a227;color:#111410;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
              Ver en panel admin
            </a>
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[resend:admin-quote] error final:', err)
  }
}
