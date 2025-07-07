import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { NotificationProvider } from "@/contexts/notification-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: "FULLASISTENTE - Control Remoto Profesional",
  description:
    "Control remoto y asistencia técnica profesional desarrollado por Armando Ovalle. Soporte 24/7 vía WhatsApp +57 305 289 1719",
  keywords: [
    "control remoto",
    "asistencia técnica",
    "soporte técnico",
    "armando ovalle",
    "fullasistente",
    "colombia",
    "whatsapp soporte",
    "webrtc",
    "pantalla compartida",
  ],
  authors: [{ name: "Armando Ovalle", url: "https://wa.me/573052891719" }],
  creator: "Armando Ovalle",
  publisher: "FULLASISTENTE",
  robots: "index, follow",
  openGraph: {
    title: "FULLASISTENTE - Control Remoto Profesional",
    description: "Asistencia técnica profesional con control remoto. Contacta por WhatsApp: +57 305 289 1719",
    url: "https://fullasistente.com",
    siteName: "FULLASISTENTE",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FULLASISTENTE - Control Remoto por Armando Ovalle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FULLASISTENTE - Control Remoto Profesional",
    description: "Asistencia técnica 24/7 por WhatsApp +57 305 289 1719",
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
    generator: 'v0.dev'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="contact" content="WhatsApp: +57 305 289 1719" />
        <meta name="developer" content="Armando Ovalle" />
        <meta name="whatsapp" content="+573052891719" />
        <meta name="support-message" content="hola quiero asistencia" />
        <link rel="canonical" href="https://fullasistente.com" />
      </head>
      <body className={inter.className}>
        <NotificationProvider>
          {children}

          {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "FULLASISTENTE",
              description: "Control remoto y asistencia técnica profesional",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "COP",
              },
              author: {
                "@type": "Person",
                name: "Armando Ovalle",
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+573052891719",
                  contactType: "Technical Support",
                  availableLanguage: "Spanish",
                },
              },
              provider: {
                "@type": "Organization",
                name: "FULLASISTENTE",
                founder: "Armando Ovalle",
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+573052891719",
                  contactType: "Customer Service",
                  availableLanguage: "Spanish",
                  hoursAvailable: "24/7",
                },
              },
            }),
          }}
        />
        </NotificationProvider>
      </body>
    </html>
  )
}
