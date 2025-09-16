import { redirect } from 'next/navigation'
import { defaultTab } from './layout'

export default function SettingsIndexPage() {
  redirect(defaultTab)
}
