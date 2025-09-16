'use client'

import DashboardLayout from '@/components/Sidebar'
import { SidebarColorProvider } from '@/context/SidebarColorContext'
import { LayoutDashboard, Calendar, User, Settings } from 'lucide-react'

const customerMenu = [
  { name: 'Dashboard', href: '/dashboard/customer', icon: LayoutDashboard },
  { name: 'Mis Citas', href: '/dashboard/customer/appointments', icon: Calendar },
  { name: 'Perfil', href: '/dashboard/customer/profile', icon: User },
  { name: 'Configuración', href: '/dashboard/customer/settings', icon: Settings },
]

export default function CustomerLayout({ children }) {
  return (
    <SidebarColorProvider role="customer">
      <DashboardLayout title="Panel Cliente" menuItems={customerMenu}>
        {children}
      </DashboardLayout>
    </SidebarColorProvider>
  )
}
