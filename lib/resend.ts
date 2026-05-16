import { Resend } from 'resend'
import type { Order } from '@/types'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'dummy')
}

function getFrom() { return process.env.EMAIL_FROM || 'Jersey Stand <noreply@jerseystand.com>' }
function getAdminEmail() { return process.env.EMAIL_ADMIN || 'jerseystandcontacto@gmail.com' }

// Confirmación de orden al cliente
export async function sendOrderConfirmation(order: Order) {
  const itemsHtml = order.items
    ?.map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.product_name} (${item.size} - ${item.type})
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          $${(item.price * item.quantity).toFixed(2)} MXN
        </td>
      </tr>
    `
    )
    .join('')

  const resend = getResend()
  await resend.emails.send({
    from: getFrom(),
    to: order.customer_email,
    subject: `✅ Orden confirmada #${order.order_number} - Jersey Stand`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: #111410; padding: 30px; text-align: center;">
          <h1 style="color: #c9a227; margin: 0; font-size: 28px;">JERSEY STAND</h1>
          <p style="color: #fff; margin: 10px 0 0;">jerseystand.com</p>
        </div>

        <div style="padding: 30px;">
          <h2 style="color: #1a5c2e;">¡Tu orden fue confirmada!</h2>
          <p>Hola <strong>${order.customer_name}</strong>,</p>
          <p>Recibimos tu pedido y ya lo estamos procesando. Te notificaremos cuando sea enviado.</p>

          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Número de orden:</strong> ${order.order_number}</p>
            <p style="margin: 5px 0 0;"><strong>Estado:</strong> Pagado ✅</p>
          </div>

          <h3>Resumen del pedido</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #111410; color: #fff;">
                <th style="padding: 10px; text-align: left;">Producto</th>
                <th style="padding: 10px; text-align: center;">Cant.</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="text-align: right; margin-top: 15px;">
            <p>Subtotal: $${order.subtotal.toFixed(2)} MXN</p>
            ${order.discount > 0 ? `<p style="color: #1a5c2e;">Descuento: -$${order.discount.toFixed(2)} MXN</p>` : ''}
            <p>Envío: ${order.shipping_cost === 0 ? 'Gratis 🎉' : `$${order.shipping_cost.toFixed(2)} MXN`}</p>
            <h3 style="color: #111410;">Total: $${order.total.toFixed(2)} MXN</h3>
          </div>

          <h3>Dirección de entrega</h3>
          <p>
            ${order.shipping_address.full_name}<br>
            ${order.shipping_address.street} ${order.shipping_address.number}<br>
            Col. ${order.shipping_address.colonia}<br>
            ${order.shipping_address.city}, ${order.shipping_address.state}<br>
            CP ${order.shipping_address.zip}
          </p>

          <p style="color: #666; font-size: 14px;">
            Puedes rastrear tu pedido en
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/rastrear?orden=${order.order_number}" style="color: #1a5c2e;">jerseystand.com/rastrear</a>
          </p>
        </div>

        <div style="background: #111410; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Jersey Stand | Gear auténtico 🏆</p>
          <p><a href="https://www.instagram.com/jerseystandcontacto/" style="color: #c9a227;">@jerseystandcontacto</a></p>
        </div>
      </body>
      </html>
    `,
  })
}

// Notificación al admin de nueva orden
export async function sendAdminOrderNotification(order: Order) {
  const resend = getResend()
  await resend.emails.send({
    from: getFrom(),
    to: getAdminEmail(),
    subject: `🆕 Nueva orden #${order.order_number} - $${order.total.toFixed(2)} MXN`,
    html: `
      <h2>Nueva orden recibida</h2>
      <p><strong>Número:</strong> ${order.order_number}</p>
      <p><strong>Cliente:</strong> ${order.customer_name} (${order.customer_email})</p>
      <p><strong>Total:</strong> $${order.total.toFixed(2)} MXN</p>
      <p><strong>Envío:</strong> ${order.shipping_type}</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/ordenes/${order.id}">Ver orden en el panel</a></p>
    `,
  })
}

// Email cuando el pedido es enviado
export async function sendShippingNotification(order: Order, trackingNumber: string) {
  const resend = getResend()
  await resend.emails.send({
    from: getFrom(),
    to: order.customer_email,
    subject: `🚚 Tu pedido #${order.order_number} fue enviado - Jersey Stand`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #111410; padding: 30px; text-align: center;">
          <h1 style="color: #c9a227; margin: 0;">JERSEY STAND</h1>
        </div>

        <div style="padding: 30px;">
          <h2 style="color: #1a5c2e;">¡Tu pedido va en camino! 🚀</h2>
          <p>Hola <strong>${order.customer_name}</strong>,</p>
          <p>Tu pedido <strong>${order.order_number}</strong> fue enviado.</p>

          <div style="background: #1a5c2e; color: #fff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">Número de guía</p>
            <h2 style="margin: 5px 0; letter-spacing: 2px;">${trackingNumber}</h2>
          </div>

          <p>Puedes rastrear tu pedido con la guía anterior en el sitio de la paquetería.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/rastrear?orden=${order.order_number}"
               style="background: #c9a227; color: #111410; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Rastrear mi pedido
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

// Notificación al admin: nuevo jersey a comprar
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
  const resend = getResend()
  const conditionLabel: Record<string, string> = {
    nuevo: 'Nuevo', como_nuevo: 'Como nuevo', buen_estado: 'Buen estado', regular: 'Regular',
  }
  const photosHtml = compra.photos
    .map((url) => `<img src="${url}" style="width:120px;height:120px;object-fit:cover;border-radius:8px;margin:4px;" />`)
    .join('')

  await resend.emails.send({
    from: getFrom(),
    to: getAdminEmail(),
    subject: `🏷️ Nueva solicitud de compra — ${compra.team} (${compra.size}) — $${compra.asking_price} MXN`,
    html: `
      <h2 style="color:#1a5c2e;">Nueva solicitud: Te compramos tu jersey</h2>
      <p><strong>Cliente:</strong> ${compra.customer_name}</p>
      <p><strong>Email:</strong> ${compra.email}</p>
      <p><strong>WhatsApp:</strong> <a href="https://wa.me/${compra.whatsapp.replace(/\D/g, '')}">${compra.whatsapp}</a></p>
      <hr>
      <p><strong>Equipo:</strong> ${compra.team}</p>
      <p><strong>Talla:</strong> ${compra.size}</p>
      <p><strong>Temporada:</strong> ${compra.season}</p>
      <p><strong>Estado:</strong> ${conditionLabel[compra.condition] ?? compra.condition}</p>
      <p><strong>Precio pedido:</strong> $${compra.asking_price.toFixed(2)} MXN</p>
      ${compra.description ? `<p><strong>Descripción:</strong> ${compra.description}</p>` : ''}
      <h3>Fotos</h3>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">${photosHtml}</div>
      <p style="margin-top:20px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/compras" style="background:#1a5c2e;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;">
          Ver en el panel admin
        </a>
      </p>
    `,
  })
}

// Confirmación de cotización al cliente
export async function sendQuoteConfirmation(quote: {
  customer_name: string
  email: string
  product_type: string
  quantity_range: string
}) {
  const resend = getResend()
  await resend.emails.send({
    from: getFrom(),
    to: quote.email,
    subject: '✅ Recibimos tu cotización - Jersey Stand',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: #111410; padding: 30px; text-align: center;">
          <h1 style="color: #c9a227; margin: 0; font-size: 28px;">JERSEY STAND</h1>
          <p style="color: #fff; margin: 10px 0 0;">jerseystand.com</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1a5c2e;">¡Tu solicitud fue recibida!</h2>
          <p>Hola <strong>${quote.customer_name}</strong>,</p>
          <p>Recibimos tu solicitud de cotización. Nuestro equipo la revisará y te contactará en un máximo de <strong>24–48 horas hábiles</strong> con el presupuesto personalizado.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Tipo de producto:</strong> ${quote.product_type}</p>
            <p style="margin: 5px 0 0;"><strong>Cantidad:</strong> ${quote.quantity_range} piezas</p>
          </div>
          <p>Si tienes dudas urgentes, escríbenos por Instagram: <a href="https://www.instagram.com/jerseystandcontacto/" style="color: #1a5c2e;">@jerseystandcontacto</a></p>
        </div>
        <div style="background: #111410; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Jersey Stand | Gear auténtico 🏆</p>
        </div>
      </body>
      </html>
    `,
  })
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
  const resend = getResend()
  await resend.emails.send({
    from: getFrom(),
    to: getAdminEmail(),
    subject: `🆕 Nueva cotización de ${quote.customer_name} - Jersey Stand`,
    html: `
      <h2>Nueva solicitud de cotización</h2>
      <p><strong>Cliente:</strong> ${quote.customer_name}</p>
      <p><strong>Email:</strong> ${quote.email}</p>
      <p><strong>Teléfono:</strong> ${quote.phone}</p>
      <p><strong>Ciudad:</strong> ${quote.city}</p>
      <hr>
      <p><strong>Tipo de producto:</strong> ${quote.product_type}</p>
      <p><strong>Cantidad:</strong> ${quote.quantity_range} piezas</p>
      ${quote.team_name ? `<p><strong>Equipo/nombre:</strong> ${quote.team_name}</p>` : ''}
      ${quote.budget_range ? `<p><strong>Presupuesto:</strong> ${quote.budget_range}</p>` : ''}
      ${quote.notes ? `<p><strong>Notas:</strong> ${quote.notes}</p>` : ''}
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/cotizaciones">Ver en el panel de admin</a></p>
    `,
  })
}

// Confirmación de suscripción al newsletter
export async function sendNewsletterConfirmation(email: string) {
  const resend = getResend()
  await resend.emails.send({
    from: getFrom(),
    to: email,
    subject: '¡Bienvenido al Jersey Stand! 🏆',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #111410; padding: 30px; text-align: center;">
          <h1 style="color: #c9a227; margin: 0;">JERSEY STAND</h1>
        </div>

        <div style="padding: 30px; text-align: center;">
          <h2>¡Ya eres parte del equipo!</h2>
          <p>Gracias por suscribirte. Serás el primero en saber sobre:</p>
          <ul style="text-align: left; display: inline-block;">
            <li>Nuevos jerseys y gear exclusivo</li>
            <li>Promociones y descuentos especiales</li>
            <li>Lanzamientos de temporada</li>
          </ul>
          <p style="margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}"
               style="background: #1a5c2e; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Ver la tienda
            </a>
          </p>
        </div>
      </body>
      </html>
    `,
  })
}
