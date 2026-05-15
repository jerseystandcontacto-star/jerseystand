'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, GripVertical, Loader2, ImageIcon } from 'lucide-react'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  uploadUrl?: string
}

export function ImageUploader({ images, onChange, maxImages = 8, uploadUrl = '/api/admin/upload' }: Props) {
  const [uploading, setUploading]       = useState(0)
  const [dropZoneActive, setDropZone]   = useState(false)
  const [dragIdx, setDragIdx]           = useState<number | null>(null)
  const [dropIdx, setDropIdx]           = useState<number | null>(null)
  const fileInputRef                    = useRef<HTMLInputElement>(null)
  const reordering                      = useRef(false)

  // ── Upload ──────────────────────────────────────────────────────────────────
  const uploadFiles = useCallback(async (files: File[]) => {
    const allowed = files
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, maxImages - images.length)

    if (!allowed.length) return
    setUploading((n) => n + allowed.length)

    const results = await Promise.all(
      allowed.map(async (file) => {
        const fd = new FormData()
        fd.append('file', file)
        try {
          const res  = await fetch(uploadUrl, { method: 'POST', body: fd })
          const json = await res.json()
          return (json.url as string) || null
        } catch {
          return null
        } finally {
          setUploading((n) => n - 1)
        }
      })
    )

    onChange([...images, ...(results.filter(Boolean) as string[])])
  }, [images, onChange, maxImages])

  // ── Drop zone (new files) ──────────────────────────────────────────────────
  const onDragOverZone = (e: React.DragEvent) => {
    e.preventDefault()
    if (!reordering.current) setDropZone(true)
  }

  const onDragLeaveZone = () => setDropZone(false)

  const onDropZone = (e: React.DragEvent) => {
    e.preventDefault()
    setDropZone(false)
    if (reordering.current) return
    const files = Array.from(e.dataTransfer.files)
    uploadFiles(files)
  }

  // ── Thumbnail reorder (drag between thumbnails) ──────────────────────────
  const onThumbDragStart = (e: React.DragEvent, idx: number) => {
    reordering.current = true
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
    // invisible drag ghost
    const ghost = document.createElement('div')
    ghost.style.position = 'absolute'
    ghost.style.top = '-9999px'
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }

  const onThumbDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragIdx !== null && dragIdx !== idx) setDropIdx(idx)
  }

  const onThumbDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragIdx === null || dragIdx === targetIdx) return
    const next = [...images]
    const [moved] = next.splice(dragIdx, 1)
    next.splice(targetIdx, 0, moved)
    onChange(next)
    setDragIdx(null)
    setDropIdx(null)
    reordering.current = false
  }

  const onThumbDragEnd = () => {
    reordering.current = false
    setDragIdx(null)
    setDropIdx(null)
  }

  const removeImage = (idx: number) => onChange(images.filter((_, i) => i !== idx))

  const canAdd = images.length < maxImages

  return (
    <div className="space-y-3">
      {/* ── Thumbnails grid ── */}
      {(images.length > 0 || uploading > 0) && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, idx) => (
            <div
              key={url + idx}
              draggable
              onDragStart={(e) => onThumbDragStart(e, idx)}
              onDragOver={(e) => onThumbDragOver(e, idx)}
              onDrop={(e) => onThumbDrop(e, idx)}
              onDragEnd={onThumbDragEnd}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 select-none transition-all duration-150 ${
                dragIdx === idx
                  ? 'opacity-40 border-[#c9a227] scale-95'
                  : dropIdx === idx
                  ? 'border-[#1a5c2e] ring-2 ring-[#1a5c2e]/30 scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              } cursor-grab active:cursor-grabbing`}
            >
              <Image src={url} alt={`Imagen ${idx + 1}`} fill className="object-cover pointer-events-none" />

              {/* Portada badge */}
              {idx === 0 && (
                <span className="absolute bottom-0 inset-x-0 bg-[#1a5c2e]/80 text-white text-[9px] font-bold text-center py-0.5 uppercase tracking-wide">
                  Portada
                </span>
              )}

              {/* Grip handle */}
              <div className="absolute top-1 left-1 opacity-60 pointer-events-none">
                <GripVertical className="w-3.5 h-3.5 text-white drop-shadow" />
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition-colors z-10"
                aria-label="Eliminar imagen"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}

          {/* Upload placeholders */}
          {uploading > 0 &&
            Array.from({ length: uploading }).map((_, i) => (
              <div
                key={`loading-${i}`}
                className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center"
              >
                <Loader2 className="w-5 h-5 text-[#1a5c2e] animate-spin" />
              </div>
            ))}
        </div>
      )}

      {/* ── Drop zone ── */}
      {canAdd && (
        <div
          onDragOver={onDragOverZone}
          onDragLeave={onDragLeaveZone}
          onDrop={onDropZone}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            dropZoneActive
              ? 'border-[#1a5c2e] bg-[#1a5c2e]/5 scale-[1.01]'
              : 'border-gray-200 hover:border-[#1a5c2e]/60 hover:bg-gray-50'
          }`}
        >
          {dropZoneActive ? (
            <>
              <Upload className="w-7 h-7 text-[#1a5c2e] mx-auto mb-1.5" />
              <p className="text-sm font-semibold text-[#1a5c2e]">Suelta para subir</p>
            </>
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-[#1a5c2e]">Haz clic</span> o arrastra imágenes aquí
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG · PNG · WebP · GIF &nbsp;·&nbsp; máx. 5 MB &nbsp;·&nbsp;
                {images.length}/{maxImages} fotos
              </p>
            </>
          )}
        </div>
      )}

      {!canAdd && images.length >= maxImages && (
        <p className="text-xs text-gray-400 text-center">
          Límite de {maxImages} imágenes alcanzado.{' '}
          <button type="button" className="text-red-400 hover:text-red-600 underline" onClick={() => removeImage(images.length - 1)}>
            Elimina una para agregar otra.
          </button>
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          if (files.length) uploadFiles(files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
