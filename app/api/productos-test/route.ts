import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const result: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, 30) + '...'
        : 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? 'SET (' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(0, 8) + '...)'
        : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
        ? 'SET'
        : 'MISSING',
    },
    query: null,
    error: null,
    count: null,
  }

  try {
    const supabase = await createClient()

    const { data, error, count } = await supabase
      .from('products')
      .select('id, name, slug, active, price, created_at', { count: 'exact' })
      .eq('active', true)
      .limit(5)

    if (error) {
      result.error = {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      }
    } else {
      result.query = data
      result.count = count
    }
  } catch (e) {
    result.error = String(e)
  }

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
