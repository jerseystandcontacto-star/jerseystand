type FbqParams = Record<string, string | number | string[]>

export function fbqTrack(event: string, params: FbqParams) {
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    ;(window as any).fbq('track', event, params)
  }
}
