// tabs.js
// NO lleva 'use client'

export const adminTabs = [
  { name: 'UI', href: '/dashboard/admin/settings/ui' },
  { name: 'Personalización', href: '/dashboard/admin/settings/customization' },
]

export const ownerTabs = [
  { name: 'Personalización', href: '/dashboard/owner/settings/customization' },
]

export const customerTabs = [
  { name: 'Personalización', href: '/dashboard/customer/settings/customization' },
]

// Tab por defecto por rol
export const defaultTabs = {
  admin: '/dashboard/admin/settings/customization',
  owner: '/dashboard/owner/settings/customization',
  customer: '/dashboard/customer/settings/customization',
}
