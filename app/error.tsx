'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="text-5xl mb-4">⚠️</p>
      <h2 className="font-display text-3xl text-gray-800 mb-3">
        Algo salió mal
      </h2>
      <p className="text-gray-500 mb-2 text-sm">
        {error.message || 'Error inesperado al cargar la página'}
      </p>
      {error.digest && (
        <p className="text-gray-400 text-xs mb-6 font-mono">
          Digest: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="bg-[#1a5c2e] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#22763a] transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
