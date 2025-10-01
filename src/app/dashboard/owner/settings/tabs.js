// tabs.js
// NO lleva 'use client'

// ==== ADMIN ====
export const adminTabs = [
  { name: 'Personalización', href: '/dashboard/admin/settings' },
  { name: 'Notificaciones', href: '/dashboard/admin/settings/notifications' }, // 👈 ejemplo extra
]

// ==== OWNER ====
export const ownerTabs = [
  { name: 'Personalización', href: '/dashboard/owner/settings' },
  { name: 'Notificaciones', href: '/dashboard/owner/settings/notifications' }, // 👈 ejemplo extra
]

// ==== CUSTOMER ====
export const customerTabs = [
  { name: 'Personalización', href: '/dashboard/customer/settings' },
  { name: 'Notificaciones', href: '/dashboard/customer/settings/notifications' }, // 👈 ejemplo extra
]

// ==== Tab por defecto por rol ====
export const defaultTabs = {
  admin: '/dashboard/admin/settings',
  owner: '/dashboard/owner/settings',
  customer: '/dashboard/customer/settings',
}
