import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/server'
import { uploadToStorage } from '@/lib/storage'
import { randomBytes } from 'crypto'
import path from 'path'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file)                        return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Tipo no permitido. Usa JPG, PNG, WebP o GIF' }, { status: 400 })
    if (file.size > MAX_SIZE)         return NextResponse.json({ error: 'El archivo supera los 5 MB' }, { status: 400 })

    const ext      = path.extname(file.name).toLowerCase() || '.' + file.type.split('/')[1]
    const filename = `products/${Date.now()}-${randomBytes(6).toString('hex')}${ext}`

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const url = await uploadToStorage(buffer, filename, file.type)
    return NextResponse.json({ url })
  } catch (err) {
    console.error('Error subiendo imagen:', err)
    return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 })
  }
}
