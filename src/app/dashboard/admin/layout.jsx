'use client'

import DashboardLayout from '@/components/Sidebar'
import { SidebarColorProvider } from '@/context/SidebarColorContext'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  Shield,
  UserCog,
  LockKeyhole,
  Settings,
  User,
  FileText, // 👈 agregamos un ícono para Policies
} from 'lucide-react'

const adminMenu = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/dashboard/admin/users', icon: Users },
  { name: 'Roles', href: '/dashboard/admin/roles', icon: LockKeyhole },
  { name: 'Negocios', href: '/dashboard/admin/business', icon: Briefcase },
  { name: 'Owners', href: '/dashboard/admin/owners', icon: UserCog },
  { name: 'Permisos', href: '/dashboard/admin/permissions', icon: Shield },
  { name: 'Policies', href: '/dashboard/admin/policies', icon: FileText }, // ✅ nueva opción
  { name: 'Reportes', href: '/dashboard/admin/reports', icon: BarChart3 },
  { name: 'Perfil', href: '/dashboard/admin/profile', icon: User },
  { name: 'Configuración', href: '/dashboard/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }) {
  return (
    <SidebarColorProvider role="admin">
      <DashboardLayout title="Panel Admin" menuItems={adminMenu}>
        {children}
      </DashboardLayout>
    </SidebarColorProvider>
  )
}
