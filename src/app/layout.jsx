import clsx from 'clsx'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import Navbar from './components/Navbar'
import './globals.css'
import Providers from './providers'

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
        try {
          const saved = localStorage.getItem('sidebar-color');
          if (saved) {
            let rgb;
            if (saved.startsWith('#')) {
              const bigint = parseInt(saved.slice(1), 16);
              const r = (bigint >> 16) & 255;
              const g = (bigint >> 8) & 255;
              const b = bigint & 255;
              rgb = \`\${r} \${g} \${b}\`;
            } else {
              const presets = {
                'preset:azul': '37 99 235',
                'preset:rojo': '220 38 38',
                'preset:amarillo': '250 204 21',
                'preset:verde': '22 163 74',
                'preset:naranja': '249 115 22',
                'preset:gris': '31 41 55',
                'preset:cian': '6 182 212',
                'preset:purpura': '147 51 234',
                'preset:rosa': '219 39 119',
                'preset:negro': '0 0 0',
                'preset:blanco': '255 255 255',
              };
              rgb = presets[saved] || null;
            }
            if (rgb) {
              document.documentElement.style.setProperty('--primary', rgb);
            }
          }
        } catch (e) {}
      `,
          }}
        />
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
