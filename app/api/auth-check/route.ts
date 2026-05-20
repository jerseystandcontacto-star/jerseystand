import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    return NextResponse.json({
      hasSession: !!user,
      userId:     user?.id   ?? null,
      email:      user?.email ?? null,
      error:      error?.message ?? null,
    })
  } catch (err: any) {
    return NextResponse.json({ hasSession: false, error: err.message }, { status: 500 })
  }
}
