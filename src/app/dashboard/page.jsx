'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function DashboardRedirectPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    const role = (user?.publicMetadata?.role || 'customer').toLowerCase()

    const dashboardRoutes = {
      customer: '/dashboard/customer',
      owner: '/dashboard/owner',
      admin: '/dashboard/admin',
    }

    const target = dashboardRoutes[role] || '/'

    router.replace(target) // 🔹 redirige automáticamente
  }, [user, isLoaded, router])

  return <p className="p-6">Redirigiendo...</p>
}
