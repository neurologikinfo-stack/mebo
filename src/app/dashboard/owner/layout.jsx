'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { SidebarColorProvider } from '@/context/SidebarColorContext'
import { LayoutDashboard, Home, DollarSign, User, Settings } from 'lucide-react'

const ownerMenu = [
  { name: 'Dashboard', href: '/dashboard/owner', icon: LayoutDashboard },
  { name: 'Mis Negocios', href: '/dashboard/owner/businesses', icon: Home },
  { name: 'Pagos', href: '/dashboard/owner/payments', icon: DollarSign },
  { name: 'Perfil', href: '/dashboard/owner/profile', icon: User },
  { name: 'Configuración', href: '/dashboard/owner/settings', icon: Settings },
]

export default function OwnerLayout({ children }) {
  return (
    <SidebarColorProvider role="owner">
      <DashboardLayout title="Panel Propietario" menuItems={ownerMenu}>
        {children}
      </DashboardLayout>
    </SidebarColorProvider>
  )
}
