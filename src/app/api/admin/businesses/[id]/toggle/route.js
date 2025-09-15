import { NextResponse } from 'next/server'
import { toggleBusinessStatus } from '@/app/dashboard/admin/business/actions'

export async function PATCH(req, { params }) {
  try {
    const { id } = params
    const body = await req.json()
    const { deletedAt } = body

    const result = await toggleBusinessStatus(id, deletedAt)
    return NextResponse.json(result)
  } catch (err) {
    console.error('❌ Error en toggleBusinessStatus API:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
