import { supabaseServer } from '@/utils/supabase/server'
import EditBusinessForm from './EditBusinessForm'
import { updateBusinessWithLogo, removeBusiness } from './actions'

export default async function EditBusinessPage({ params }) {
  const supabase = supabaseServer()
  const { id } = params

  const { data: b, error } = await supabase
    .from('businesses')
    .select('id,name,slug,phone,email,description,logo_url,owner_id')
    .eq('id', id)
    .single()

  if (error || !b) {
    return <div className="p-6">Negocio no encontrado</div>
  }

  const { data: owners } = await supabase.from('owners').select('id, full_name, email')

  return (
    <EditBusinessForm
      business={b}
      owners={owners || []}
      updateAction={updateBusinessWithLogo}
      removeAction={removeBusiness}
    />
  )
}
