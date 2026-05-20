import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function PUT(req: NextRequest) {
  try {
    // Verificar sesión con el cliente de servidor (lee cookies)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const {
      full_name,
      phone,
      address_street,
      address_number,
      address_colonia,
      address_city,
      address_state,
      address_zip,
      address_references,
    } = body

    // Usar adminClient para bypassear RLS
    const adminDb = createAdminClient()
    const { error } = await adminDb
      .from('users_profiles')
      .update({
        full_name:          full_name          || null,
        phone:              phone              || null,
        address_street:     address_street     || null,
        address_number:     address_number     || null,
        address_colonia:    address_colonia    || null,
        address_city:       address_city       || null,
        address_state:      address_state      || null,
        address_zip:        address_zip        || null,
        address_references: address_references || null,
      })
      .eq('id', user.id)

    if (error) {
      console.error('[api/cuenta/perfil]', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[api/cuenta/perfil]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
