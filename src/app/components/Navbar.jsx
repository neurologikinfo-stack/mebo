'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { Menu, X, Sun, Moon } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const { user } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Rol actual (default customer)
  const role = (user?.publicMetadata?.role || 'customer').toLowerCase()
  const isAdminOrOwner = role === 'admin' || role === 'owner'

  // 🔹 Rutas dinámicas de dashboard
  const dashboardRoutes = {
    customer: '/dashboard/customer',
    owner: '/dashboard/owner',
    admin: '/dashboard/admin',
  }

  const dashboardPath = dashboardRoutes[role] || '/dashboard'

  // Texto dinámico del link de dashboard
  const dashboardLabel =
    role === 'customer'
      ? 'Mis citas'
      : role === 'owner'
      ? 'Panel de negocios'
      : role === 'admin'
      ? 'Dashboard'
      : 'Dashboard'

  // 🔹 Detectar si el primary es blanco
  const isPrimaryWhite = () => {
    if (typeof window === 'undefined') return false
    const rgb = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
    return rgb === '255 255 255'
  }

  // 🔹 Función para marcar activo
  const isActive = (href) => {
    const activeClass = isPrimaryWhite() ? 'text-black font-semibold' : 'text-primary font-semibold'

    if (href === '/') {
      return pathname === '/' ? activeClass : 'text-gray-600 dark:text-gray-300 hover:text-primary'
    }
    return pathname.startsWith(href)
      ? activeClass
      : 'text-gray-600 dark:text-gray-300 hover:text-primary'
  }

  // Dark mode inicial
  useEffect(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark')
      setDarkMode(true)
    } else {
      document.documentElement.classList.remove('dark')
      setDarkMode(false)
    }
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
      setDarkMode(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
      setDarkMode(true)
    }
  }

  return (
    <header className="border-b bg-white dark:bg-gray-900">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        {/* Brand */}
        <Link href="/" className="text-lg font-bold text-gray-900 dark:text-white">
          mebo
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {isAdminOrOwner && (
            <Link href="/" className={`text-sm ${isActive('/')}`}>
              Inicio
            </Link>
          )}
          <Link href="/businesses" className={`text-sm ${isActive('/businesses')}`}>
            Negocios
          </Link>
          <SignedIn>
            <Link href={dashboardPath} className={`text-sm ${isActive(dashboardPath)}`}>
              {dashboardLabel}
            </Link>
          </SignedIn>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3 min-w-[200px] justify-end">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-800" />
            )}
          </button>

          <SignedOut>
            <SignInButton mode="modal">
              <span className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted cursor-pointer">
                Ingresar
              </span>
            </SignInButton>
            <SignUpButton mode="modal">
              <span className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 cursor-pointer">
                Crear cuenta
              </span>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            {role === 'admin' && (
              <Link
                href="/dashboard/admin/business/new"
                className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
              >
                + Nuevo negocio
              </Link>
            )}
            <div className="w-8 h-8 flex items-center justify-center">
              <UserButton afterSignOutUrl="/" userProfileMode="navigation" />
            </div>
          </SignedIn>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X className="h-6 w-6 text-gray-900 dark:text-white" />
          ) : (
            <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
          )}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white dark:bg-gray-900 shadow-inner">
          <div className="flex flex-col p-4 gap-4">
            {isAdminOrOwner && (
              <Link href="/" className={`text-sm ${isActive('/')}`}>
                Inicio
              </Link>
            )}
            <Link href="/businesses" className={`text-sm ${isActive('/businesses')}`}>
              Negocios
            </Link>

            <SignedIn>
              <Link href={dashboardPath} className={`text-sm ${isActive(dashboardPath)}`}>
                {dashboardLabel}
              </Link>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <span className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted w-full text-left cursor-pointer">
                  Ingresar
                </span>
              </SignInButton>
              <SignUpButton mode="modal">
                <span className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 w-full text-left cursor-pointer">
                  Crear cuenta
                </span>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              {role === 'admin' && (
                <Link
                  href="/dashboard/admin/business/new"
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
                >
                  + Nuevo negocio
                </Link>
              )}
              <div className="mt-2 w-8 h-8 flex items-center justify-center">
                <UserButton afterSignOutUrl="/" userProfileMode="navigation" />
              </div>
            </SignedIn>

            {/* Dark mode toggle en mobile */}
            <button
              onClick={toggleDarkMode}
              className="mt-4 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-400 mx-auto" />
              ) : (
                <Moon className="h-5 w-5 text-gray-800 dark:text-gray-200 mx-auto" />
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
