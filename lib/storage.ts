import { createAdminClient } from '@/lib/supabase/server'

export const PRODUCTS_BUCKET = 'product-images'
export const COMPRAS_BUCKET  = 'jersey-compras'

export async function uploadToStorage(
  buffer: Buffer,
  filename: string,
  contentType: string,
  bucket = PRODUCTS_BUCKET
): Promise<string> {
  const supabase = createAdminClient()

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, { contentType, cacheControl: '31536000', upsert: false })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return data.publicUrl
}

export async function deleteFromStorage(url: string, bucket = PRODUCTS_BUCKET): Promise<void> {
  const supabase = createAdminClient()
  const pattern = new RegExp(`${bucket}/(.+)$`)
  const match = url.match(pattern)
  if (!match) return
  await supabase.storage.from(bucket).remove([match[1]])
}
