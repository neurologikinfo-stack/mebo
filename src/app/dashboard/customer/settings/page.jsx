import { redirect } from 'next/navigation'
import { defaultTab } from './tabs'

export default function SettingsIndexPage() {
  redirect(defaultTab)
}
