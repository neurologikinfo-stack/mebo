import { supabaseServer } from '@/utils/supabase/server'
import EditBusinessForm from './EditBusinessForm'
import { updateBusinessWithLogo, removeBusiness } from './actions'

export default async function OwnerEditBusinessPage({ params }) {
  const supabase = supabaseServer()
  const { id } = params

  const { data: b, error } = await supabase
    .from('businesses')
    .select('id,name,slug,phone,email,description,logo_url,owner_id')
    .eq('id', id)
    .single()

  if (error || !b) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-semibold text-destructive">Negocio no encontrado</h1>
      </main>
    )
  }

  // 🔹 Si quieres que el owner pueda elegir otro owner, se carga la lista
  const { data: owners } = await supabase.from('owners').select('id, full_name, email')

  return (
    <main className="mx-auto max-w-2xl p-6 bg-card rounded-xl shadow border border-border">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Editar negocio</h1>

      <EditBusinessForm
        business={b}
        owners={owners || []}
        updateAction={updateBusinessWithLogo}
        removeAction={removeBusiness}
      />
    </main>
  )
}
