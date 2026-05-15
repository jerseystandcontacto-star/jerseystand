import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(
  file: string,
  folder: string = 'jerseystand/products'
): Promise<string> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  })
  return result.secure_url
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export function getImageUrl(url: string, width?: number, height?: number): string {
  if (!url) return '/placeholder-jersey.jpg'
  if (!url.includes('cloudinary')) return url

  const transforms = []
  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  transforms.push('c_limit', 'q_auto', 'f_auto')

  return url.replace('/upload/', `/upload/${transforms.join(',')}/`)
}

export default cloudinary
