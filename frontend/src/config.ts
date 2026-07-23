function normalizeLocalDevHost(host: string): string {
  return host.trim().replace(/^localhost(?=:|$)/i, '127.0.0.1')
}

/**
 * Origen de la API REST.
 * En desarrollo, vacío → proxy de Vite (cookies HttpOnly same-origin).
 */
export function getApiBaseUrl(): string {
  const isDev = import.meta.env.DEV
  if (isDev) {
    const raw = import.meta.env.VITE_API_BASE_URL_LOCAL as string | undefined
    if (raw === undefined || String(raw).trim() === '') {
      return ''
    }
    const host = normalizeLocalDevHost(raw.trim())
    return `http://${host}`
  }
  const prod = (import.meta.env.VITE_API_BASE_URL_PROD as string | undefined)?.trim()
  if (!prod) {
    return ''
  }
  if (prod.startsWith('http://') || prod.startsWith('https://')) {
    return prod.replace(/\/$/, '')
  }
  return `https://${prod}`
}
