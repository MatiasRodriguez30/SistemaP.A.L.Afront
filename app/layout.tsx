import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from "sileo"
import './globals.css'

export const metadata: Metadata = {
  title: 'Ver Avisos - Sistema de Postulaciones',
  description: 'Visualiza los avisos de empleo disponibles de distintos reclutadores y empresas',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Toaster
          position="top-right"
          offset={{ top: 88, right: 16 }}
          options={{
            roundness: 26,
            duration: 4200,
            styles: {
              title: "text-[0.95rem] font-semibold tracking-tight text-slate-950",
              description: "text-sm leading-5 text-slate-600",
              badge: "shadow-sm",
              button: "text-xs font-medium",
            },
          }}
        />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
