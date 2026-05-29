import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad | Jersey Stand',
  description: 'Política de Privacidad de Jersey Stand. Conoce cómo recopilamos, usamos y protegemos tus datos personales conforme a la LFPDPPP.',
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

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <Link href="/" className="text-sm text-[#1a5c2e] hover:underline mb-4 inline-block">
          ← Volver a la tienda
        </Link>
        <h1 className="font-display text-4xl sm:text-5xl text-[#111410] mb-3">
          POLÍTICA DE PRIVACIDAD
        </h1>
        <p className="text-sm text-gray-400">Última actualización: mayo 2025</p>
      </div>

      <div className="bg-[#1a5c2e]/5 border border-[#1a5c2e]/20 rounded-xl p-4 mb-10 text-sm text-[#1a5c2e]">
        <strong>Responsable:</strong> Jersey Stand · Ciudad de México, México ·{' '}
        <a href="mailto:jerseystandcontacto@gmail.com" className="underline hover:no-underline">
          jerseystandcontacto@gmail.com
        </a>
      </div>

      <Section title="1. ¿Quiénes somos?">
        <p>
          Jersey Stand ("nosotros", "nuestro") es una tienda en línea dedicada a la venta de jerseys y
          gear deportivo auténtico en México. Operamos a través del sitio web{' '}
          <strong>jerseystand.shop</strong>.
        </p>
        <p>
          Somos responsables del tratamiento de tus datos personales conforme a la{' '}
          <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares
          (LFPDPPP)</strong> y su Reglamento.
        </p>
      </Section>

      <Section title="2. Datos personales que recopilamos">
        <p>Recopilamos los siguientes datos personales según el uso que hagas de nuestro sitio:</p>

        <div>
          <p className="font-semibold text-[#111410] mb-1">Al realizar una compra:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nombre completo</li>
            <li>Correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Dirección de envío (calle, número, colonia, ciudad, estado, código postal)</li>
            <li>Datos de pago procesados de forma segura a través de EcartPay (no almacenamos datos de tarjetas)</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-[#111410] mb-1">Al crear una cuenta:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nombre</li>
            <li>Correo electrónico</li>
            <li>Contraseña (almacenada de forma cifrada)</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-[#111410] mb-1">Al suscribirte al newsletter:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Correo electrónico</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-[#111410] mb-1">Datos de navegación (automáticos):</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Dirección IP</li>
            <li>Tipo de navegador y dispositivo</li>
            <li>Páginas visitadas y tiempo de navegación</li>
            <li>Datos de cookies (ver sección 5)</li>
          </ul>
        </div>
      </Section>

      <Section title="3. Finalidades del tratamiento">
        <p>Utilizamos tus datos personales para las siguientes finalidades <strong>primarias</strong> (necesarias para el servicio):</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Procesar y gestionar tus pedidos de compra</li>
          <li>Coordinar el envío y entrega de productos</li>
          <li>Enviarte confirmaciones de compra, actualizaciones de envío y comprobantes</li>
          <li>Atender dudas, quejas o reclamaciones</li>
          <li>Crear y administrar tu cuenta de usuario</li>
          <li>Cumplir obligaciones legales y fiscales</li>
        </ul>

        <p>Y para las siguientes finalidades <strong>secundarias</strong> (puedes oponerte):</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Enviarte promociones, descuentos y novedades por correo electrónico (newsletter)</li>
          <li>Realizar análisis estadísticos sobre el uso del sitio</li>
          <li>Personalizar tu experiencia de compra</li>
        </ul>
        <p>
          Si no deseas que tus datos se usen para finalidades secundarias, escríbenos a{' '}
          <a href="mailto:jerseystandcontacto@gmail.com" className="text-[#1a5c2e] hover:underline">
            jerseystandcontacto@gmail.com
          </a>.
        </p>
      </Section>

      <Section title="4. Transferencia de datos">
        <p>
          Tus datos personales pueden ser compartidos con terceros únicamente cuando sea necesario
          para cumplir con las finalidades descritas:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>EcartPay</strong> — procesador de pagos (datos de transacción)</li>
          <li><strong>Paqueterías y servicios de mensajería</strong> — nombre y dirección para entrega</li>
          <li><strong>Supabase</strong> — almacenamiento de datos (servidores en EE.UU. con nivel de protección adecuado)</li>
          <li><strong>Autoridades competentes</strong> — cuando sea requerido por ley</li>
        </ul>
        <p>
          No vendemos, rentamos ni compartimos tus datos con terceros con fines publicitarios.
        </p>
      </Section>

      <Section title="5. Cookies">
        <p>
          Utilizamos cookies y tecnologías similares para mejorar tu experiencia en el sitio. Las cookies
          que usamos incluyen:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Cookies de sesión:</strong> necesarias para mantener tu sesión activa y tu carrito de compras.</li>
          <li><strong>Cookies de preferencias:</strong> recuerdan tus configuraciones para visitas futuras.</li>
          <li><strong>Cookies analíticas:</strong> nos ayudan a entender cómo se usa el sitio (datos agregados y anónimos).</li>
        </ul>
        <p>
          Puedes desactivar las cookies desde la configuración de tu navegador. Sin embargo, algunas
          funciones del sitio (como el carrito de compras) pueden dejar de funcionar correctamente.
        </p>
      </Section>

      <Section title="6. Seguridad de los datos">
        <p>
          Implementamos medidas técnicas y organizativas razonables para proteger tus datos personales
          contra acceso no autorizado, pérdida o alteración:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Transmisión de datos bajo protocolo HTTPS con cifrado SSL/TLS</li>
          <li>Contraseñas almacenadas con hash criptográfico (nunca en texto plano)</li>
          <li>Acceso restringido a datos personales solo al personal autorizado</li>
          <li>Datos de pago procesados directamente por EcartPay, no almacenados en nuestros servidores</li>
        </ul>
      </Section>

      <Section title="7. Derechos ARCO">
        <p>
          Conforme a la LFPDPPP, tienes derecho a <strong>Acceder, Rectificar, Cancelar u Oponerte</strong>{' '}
          (derechos ARCO) al tratamiento de tus datos personales.
        </p>
        <div>
          <p className="font-semibold text-[#111410] mb-1">Para ejercer tus derechos:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Envía un correo a{' '}
              <a href="mailto:jerseystandcontacto@gmail.com" className="text-[#1a5c2e] hover:underline">
                jerseystandcontacto@gmail.com
              </a>
            </li>
            <li>Incluye: nombre completo, correo con el que te registraste y descripción de tu solicitud</li>
            <li>Responderemos en un plazo máximo de <strong>20 días hábiles</strong></li>
          </ul>
        </div>
        <p>
          También puedes presentar una queja ante el{' '}
          <strong>Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos
          Personales (INAI)</strong> en{' '}
          <a href="https://www.inai.org.mx" target="_blank" rel="noopener noreferrer" className="text-[#1a5c2e] hover:underline">
            www.inai.org.mx
          </a>.
        </p>
      </Section>

      <Section title="8. Retención de datos">
        <p>
          Conservamos tus datos personales durante el tiempo necesario para cumplir con las finalidades
          descritas y las obligaciones legales aplicables:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Datos de cuenta: mientras la cuenta esté activa o hasta que solicites su eliminación</li>
          <li>Datos de compra: 5 años conforme a la legislación fiscal mexicana</li>
          <li>Datos de newsletter: hasta que te desuscribas</li>
        </ul>
      </Section>

      <Section title="9. Cambios a esta política">
        <p>
          Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento.
          Cuando realicemos cambios significativos, te notificaremos por correo electrónico o mediante
          un aviso destacado en el sitio web. La fecha de la última actualización siempre aparecerá
          al inicio de este documento.
        </p>
      </Section>

      <Section title="10. Contacto">
        <p>Si tienes preguntas sobre esta Política de Privacidad o el tratamiento de tus datos, contáctanos:</p>
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
        <Link href="/terminos" className="text-[#1a5c2e] hover:underline">
          Términos y Condiciones
        </Link>
        <Link href="/productos" className="text-[#1a5c2e] hover:underline">
          Ver tienda
        </Link>
      </div>
    </div>
  )
}
