type FbqParams = Record<string, string | number | string[]>

export function fbqTrack(event: string, params: FbqParams) {
  if (typeof window === 'undefined') {
    console.warn(`[fbq] ${event} ignorado — sin window (SSR)`)
    return
  }
  if (typeof (window as any).fbq !== 'function') {
    console.warn(`[fbq] ${event} ignorado — window.fbq no disponible (bloqueado o no cargado)`)
    return
  }
  console.log(`[fbq] track ${event}`, params)
  ;(window as any).fbq('track', event, params)
}
