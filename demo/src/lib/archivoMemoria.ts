import type { ArchivoEnMemoria } from '../types'

const encoder = new TextEncoder()

/** Texto de demo → archivo en memoria (para seed y botón “ejemplo”). */
export function archivoDesdeTexto(
  texto: string,
  nombreArchivo: string,
  mimeType = 'text/plain',
  version = 1,
): ArchivoEnMemoria {
  const bytes = encoder.encode(texto)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  return {
    nombreArchivo,
    mimeType,
    size: bytes.length,
    dataBase64: btoa(binary),
    version,
    subidoEn: new Date().toISOString().slice(0, 10),
  }
}

export function leerArchivoComoMemoria(
  file: File,
  version: number,
): Promise<ArchivoEnMemoria> {
  return new Promise((resolve, reject) => {
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error('Máximo 2 MB en la demo (memoria del navegador).'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result ?? '')
      const dataBase64 = result.includes(',')
        ? result.split(',')[1] ?? ''
        : result
      resolve({
        nombreArchivo: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        dataBase64,
        version,
        subidoEn: new Date().toISOString().slice(0, 10),
      })
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsDataURL(file)
  })
}

export function descargarArchivoMemoria(
  archivo: ArchivoEnMemoria,
  folioFallback: string,
) {
  const binary = atob(archivo.dataBase64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: archivo.mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download =
    archivo.nombreArchivo ||
    `documento_${folioFallback}_v${archivo.version}`
  a.click()
  URL.revokeObjectURL(url)
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

/** data URL para <img src> desde ArchivoEnMemoria. */
export function archivoDataUrl(archivo: ArchivoEnMemoria): string {
  return `data:${archivo.mimeType};base64,${archivo.dataBase64}`
}

/** Avatar SVG simple en memoria (seed / placeholder). */
export function fotoPlaceholderSvg(
  initials: string,
  bg = '#802F42',
): ArchivoEnMemoria {
  const label = initials.slice(0, 2).toUpperCase() || '?'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" fill="${bg}"/><circle cx="80" cy="62" r="28" fill="#fff" opacity="0.9"/><ellipse cx="80" cy="130" rx="48" ry="36" fill="#fff" opacity="0.9"/><text x="80" y="68" text-anchor="middle" fill="${bg}" font-family="system-ui,sans-serif" font-size="22" font-weight="700">${label}</text></svg>`
  return archivoDesdeTexto(svg, 'foto-id.svg', 'image/svg+xml', 1)
}
