import { createClient } from '@supabase/supabase-js'

// ⚠️ Asegúrate de tener estas variables en tu .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    '❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const defaultSettings = [
  {
    role: 'admin',
    value: 'bg-blue-600 text-white dark:bg-blue-700 dark:text-white',
  },
  {
    role: 'owner',
    value: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white',
  },
  {
    role: 'customer',
    value: 'bg-white text-black dark:bg-gray-900 dark:text-white',
  },
]

async function seed() {
  console.log('🌱 Insertando valores por defecto en settings...')

  const { data, error } = await supabase
    .from('settings')
    .upsert(defaultSettings, { onConflict: 'role' })

  if (error) {
    console.error('❌ Error insertando settings:', error.message)
    process.exit(1)
  }

  console.log('✅ Settings insertados/actualizados:', data)
  process.exit(0)
}

seed()
