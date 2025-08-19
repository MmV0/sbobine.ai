import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/providers/AuthProvider'
import { QueryProvider } from '@/providers/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sbobine - Trascrizione e Sintesi Lezioni',
  description: 'Trasforma le tue registrazioni audio in trascrizioni e riassunti strutturati per lo studio.',
  keywords: ['trascrizione', 'lezioni', 'audio', 'sintesi', 'studio', 'universitari'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className={inter.className}>
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
