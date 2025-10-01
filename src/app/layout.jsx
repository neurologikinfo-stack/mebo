import './globals.css'
import Providers from './providers'
import Navbar from './components/Navbar'
import { Inter } from 'next/font/google'
import clsx from 'clsx'
import { Toaster } from 'sonner'
import { getInitialSidebarColorScript } from '@/utils/applyInitialSidebarColor' // 👈 importar helper

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = { title: 'mebo' }

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* 🔹 Script desde helper */}
        <script dangerouslySetInnerHTML={{ __html: getInitialSidebarColorScript() }} />
      </head>
      <body
        className={clsx(
          'min-h-screen bg-background text-foreground font-sans antialiased transition-colors',
          inter.variable
        )}
      >
        <Providers>
          <Navbar />
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
