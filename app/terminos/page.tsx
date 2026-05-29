import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos y Condiciones | Jersey Stand',
  description: 'Términos y Condiciones de compra de Jersey Stand. Conoce nuestras políticas de envío, devoluciones y garantías.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-xl text-[#111410] mb-3 pb-2 border-b border-gray-200">
        {title}
      </h2>
      <div className="text-gray-600 leading-relaxed space-y-3 text-sm">
        {children}
      </div>
    </section>
  )
}

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <Link href="/" className="text-sm text-[#1a5c2e] hover:underline mb-4 inline-block">
          ← Volver a la tienda
        </Link>
        <h1 className="font-display text-4xl sm:text-5xl text-[#111410] mb-3">
          TÉRMINOS Y CONDICIONES
        </h1>
        <p className="text-sm text-gray-400">Última actualización: mayo 2025</p>
      </div>

      <div className="bg-[#1a5c2e]/5 border border-[#1a5c2e]/20 rounded-xl p-4 mb-10 text-sm text-[#1a5c2e]">
        Al realizar una compra en Jersey Stand aceptas estos Términos y Condiciones en su totalidad.
        Si tienes dudas, escríbenos a{' '}
        <a href="mailto:jerseystandcontacto@gmail.com" className="underline hover:no-underline">
          jerseystandcontacto@gmail.com
        </a>{' '}
        antes de comprar.
      </div>

      <Section title="1. Descripción del servicio">
        <p>
          Jersey Stand es una tienda en línea con domicilio en Ciudad de México, México, dedicada a la
          venta de jerseys de fútbol y gear deportivo auténtico. Operamos a través del sitio web{' '}
          <strong>jerseystand.shop</strong>.
        </p>
        <p>
          Todos nuestros productos son auténticos y verificados. Nos reservamos el derecho de modificar,
          discontinuar o actualizar el catálogo de productos en cualquier momento sin previo aviso.
        </p>
      </Section>

      <Section title="2. Registro y cuenta de usuario">
        <p>
          Para realizar compras puedes hacerlo como invitado o creando una cuenta. Al registrarte,
          eres responsable de:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Proporcionar información veraz, completa y actualizada</li>
          <li>Mantener la confidencialidad de tu contraseña</li>
          <li>Notificarnos de inmediato cualquier uso no autorizado de tu cuenta</li>
        </ul>
        <p>
          Jersey Stand no será responsable por pérdidas derivadas del uso no autorizado de tu cuenta
          cuando hayas incumplido con las obligaciones anteriores.
        </p>
      </Section>

      <Section title="3. Proceso de compra y precios">
        <p>
          Todos los precios publicados en el sitio están expresados en <strong>Pesos Mexicanos (MXN)</strong>{' '}
          e incluyen el IVA aplicable. Los precios pueden cambiar sin previo aviso; el precio que aplica
          es el vigente al momento de confirmar tu pedido.
        </p>
        <div>
          <p className="font-semibold text-[#111410] mb-1">Proceso de compra:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Selecciona los productos y agrega al carrito</li>
            <li>Revisa tu pedido y proporciona tus datos de envío</li>
            <li>Elige el método de envío</li>
            <li>Realiza el pago a través de EcartPay (plataforma segura)</li>
            <li>Recibirás un correo de confirmación con el número de tu orden</li>
          </ol>
        </div>
        <p>
          Un pedido se considera confirmado únicamente cuando el pago ha sido procesado exitosamente y
          recibes el correo de confirmación. Nos reservamos el derecho de cancelar pedidos en caso de
          error en precios, falta de stock o problemas de pago.
        </p>
      </Section>

      <Section title="4. Métodos de pago">
        <p>
          Aceptamos los siguientes métodos de pago a través de EcartPay:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Tarjetas de crédito y débito (Visa, Mastercard, American Express)</li>
          <li>Transferencia bancaria (SPEI)</li>
          <li>Pagos en efectivo en tiendas de conveniencia</li>
          <li>Otros métodos disponibles en la plataforma EcartPay</li>
        </ul>
        <p>
          Los datos de tu tarjeta son procesados directamente por EcartPay; Jersey Stand no almacena
          información de tarjetas de crédito o débito.
        </p>
      </Section>

      <Section title="5. Política de envíos">
        <p>Realizamos envíos a toda la República Mexicana. Las opciones disponibles son:</p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm mt-2">
            <thead>
              <tr className="bg-[#111410] text-white">
                <th className="text-left px-4 py-2 rounded-tl-lg">Tipo</th>
                <th className="text-left px-4 py-2">Tiempo estimado</th>
                <th className="text-left px-4 py-2 rounded-tr-lg">Costo</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2.5 font-medium text-[#111410]">Estándar</td>
                <td className="px-4 py-2.5">4–6 días hábiles</td>
                <td className="px-4 py-2.5">$149 MXN</td>
              </tr>
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-[#111410]">Express</td>
                <td className="px-4 py-2.5">1–3 días hábiles</td>
                <td className="px-4 py-2.5">$349 MXN</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-[#1a5c2e]">Gratis</td>
                <td className="px-4 py-2.5">4–6 días hábiles</td>
                <td className="px-4 py-2.5 text-[#1a5c2e] font-semibold">En pedidos mayores a $1,500 MXN</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Los tiempos de entrega son estimados y pueden variar por factores externos (condiciones
          climáticas, festividades, disponibilidad de la paquetería). Jersey Stand no es responsable
          por retrasos atribuibles a la empresa de mensajería.
        </p>
        <p>
          Una vez que tu pedido es enviado, recibirás un correo con el número de guía para rastrear
          tu paquete.
        </p>
      </Section>

      <Section title="6. Política de devoluciones y cambios">
        <div>
          <p className="font-semibold text-[#111410] mb-1">Tienes hasta 30 días para solicitar una devolución o cambio.</p>
          <p>Para que tu solicitud sea aceptada, el producto debe:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Estar en su estado original, sin uso, sin lavado</li>
            <li>Conservar todas sus etiquetas originales</li>
            <li>Encontrarse en su empaque original</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-[#111410] mb-1">Motivos aceptados:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Producto defectuoso o dañado al recibirlo</li>
            <li>Producto incorrecto (diferente al pedido)</li>
            <li>Cambio de talla (sujeto a disponibilidad)</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-[#111410] mb-1">No se aceptan devoluciones de:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Productos en oferta o liquidación marcados como "venta final"</li>
            <li>Productos personalizados con nombre o número</li>
            <li>Productos usados, lavados o con etiquetas removidas</li>
          </ul>
        </div>

        <p>
          Para iniciar una devolución, contacta a{' '}
          <a href="mailto:jerseystandcontacto@gmail.com" className="text-[#1a5c2e] hover:underline">
            jerseystandcontacto@gmail.com
          </a>{' '}
          con tu número de orden y descripción del problema. Los gastos de envío de la devolución
          corren a cargo del cliente, excepto en casos de producto defectuoso o error de nuestra parte.
        </p>
      </Section>

      <Section title="7. Garantía de autenticidad">
        <p>
          Todos los productos vendidos en Jersey Stand son <strong>100% auténticos</strong>. Trabajamos
          únicamente con proveedores verificados y productos originales.
        </p>
        <p>
          Si recibes un producto que consideras no auténtico, contáctanos de inmediato con evidencia
          fotográfica. Realizaremos una revisión y, de confirmarse, procederemos con la devolución
          completa incluyendo gastos de envío.
        </p>
      </Section>

      <Section title="8. Disponibilidad y cancelaciones">
        <p>
          El inventario se actualiza en tiempo real. En caso excepcional de que un producto comprado
          no esté disponible, te notificaremos inmediatamente y podrás elegir entre:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Reembolso completo en el método de pago original (3–10 días hábiles)</li>
          <li>Crédito en tienda por el monto total</li>
          <li>Cambio por otro producto de igual o mayor valor</li>
        </ul>
        <p>
          Puedes cancelar tu pedido sin costo alguno siempre que no haya sido enviado. Una vez enviado,
          aplica la política de devoluciones descrita anteriormente.
        </p>
      </Section>

      <Section title="9. Propiedad intelectual">
        <p>
          Todo el contenido del sitio web (imágenes, textos, logotipos, diseño) es propiedad de
          Jersey Stand o de sus respectivos licenciantes. Queda prohibida su reproducción, distribución
          o uso comercial sin autorización escrita.
        </p>
        <p>
          Los logotipos y marcas de los equipos de fútbol pertenecen a sus respectivos propietarios.
          Jersey Stand no afirma tener derechos sobre dichas marcas.
        </p>
      </Section>

      <Section title="10. Limitación de responsabilidad">
        <p>Jersey Stand no será responsable por:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Daños indirectos, incidentales o consecuentes derivados del uso del sitio o los productos</li>
          <li>Interrupciones o errores técnicos del sitio web</li>
          <li>Retrasos en la entrega atribuibles a la paquetería o causas de fuerza mayor</li>
          <li>Uso incorrecto de los productos por parte del comprador</li>
        </ul>
        <p>
          Nuestra responsabilidad máxima en cualquier caso estará limitada al monto pagado por el
          producto en cuestión.
        </p>
      </Section>

      <Section title="11. Modificaciones">
        <p>
          Jersey Stand se reserva el derecho de modificar estos Términos y Condiciones en cualquier
          momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio.
          El uso continuado del sitio después de la publicación de cambios constituye tu aceptación
          de los mismos.
        </p>
      </Section>

      <Section title="12. Ley aplicable y jurisdicción">
        <p>
          Estos Términos y Condiciones se rigen por las leyes de los <strong>Estados Unidos Mexicanos</strong>.
          Para cualquier controversia, las partes se someten a la jurisdicción de los tribunales
          competentes de la <strong>Ciudad de México</strong>, renunciando a cualquier otro fuero que
          pudiera corresponderles.
        </p>
      </Section>

      <Section title="13. Contacto">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Correo:</strong>{' '}
            <a href="mailto:jerseystandcontacto@gmail.com" className="text-[#1a5c2e] hover:underline">
              jerseystandcontacto@gmail.com
            </a>
          </li>
          <li><strong>Instagram:</strong> @jerseystandmx</li>
          <li><strong>Ubicación:</strong> Ciudad de México, México</li>
        </ul>
      </Section>

      <div className="border-t border-gray-200 pt-6 mt-6 flex gap-6 text-sm">
        <Link href="/privacidad" className="text-[#1a5c2e] hover:underline">
          Política de Privacidad
        </Link>
        <Link href="/productos" className="text-[#1a5c2e] hover:underline">
          Ver tienda
        </Link>
      </div>
    </div>
  )
}
