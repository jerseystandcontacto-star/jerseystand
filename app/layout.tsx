import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://jerseystand.shop'),
  title: {
    default: 'Jersey Stand | Gear de Fútbol Auténtico en México',
    template: '%s | Jersey Stand',
  },
  description:
    'La tienda de jerseys y gear deportivo más confiable de México. Liga MX, Selección Mexicana, Europa y Retro. Autenticidad garantizada.',
  keywords: [
    'jerseys futbol mexico',
    'jerseys liga mx',
    'jersey america',
    'jersey chivas',
    'seleccion mexicana jersey',
    'gear deportivo',
    'jerseys autenticos',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'Jersey Stand',
    images: [{ url: 'https://www.jerseystand.shop/logo.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@jerseystandmx',
    images: ['https://www.jerseystand.shop/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{__html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1831102581323388');fbq('track','PageView');`}} />
        <noscript><img height="1" width="1" style={{display:'none'}} src="https://www.facebook.com/tr?id=1831102581323388&ev=PageView&noscript=1" alt="" /></noscript>
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
