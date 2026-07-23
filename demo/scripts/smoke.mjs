/**
 * Smoke del happy path (consola limpia + beats clave).
 * Uso: con la demo en 5174 → `npm run smoke`
 */
import { chromium } from 'playwright'

const BASE = process.env.DEMO_URL ?? 'http://localhost:5174'
const errors = []

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
})

async function clickText(text, timeout = 8000) {
  await page.getByText(text, { exact: false }).first().click({ timeout })
}

try {
  await page.goto(`${BASE}/?skip=1`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)

  await clickText('Entrar como alumno')
  await page.waitForTimeout(300)
  const folio = await page.locator('text=EM-').first().textContent()
  if (!folio) throw new Error('No se vio folio en alumno')

  await clickText('Simulador')
  await clickText('Aplicar al expediente')
  await page.waitForTimeout(400)

  // Deep-link Diego documentos
  await page.goto(`${BASE}/?vista=alumno&alumno=c2&tab=documentos&skip=1`, {
    waitUntil: 'networkidle',
  })
  await page.waitForTimeout(500)
  const upload = page.getByText('Subir ejemplo (memoria)').first()
  if (await upload.count()) {
    await upload.click()
    await page.waitForTimeout(300)
  }
  const dl = page.getByText('Descargar desde Estudia Más').first()
  if (await dl.count()) {
    // download event — just click; content is in memory
    await dl.click()
    await page.waitForTimeout(200)
  }

  // Equipo pide actualización a Diego
  await page.goto(`${BASE}/?vista=equipo&equipo=pipeline&cliente=c2&skip=1`, {
    waitUntil: 'networkidle',
  })
  await page.waitForTimeout(600)
  const pedir = page.getByText('Pedir actualización al alumno').first()
  if (await pedir.count()) {
    const box = page.locator('textarea').first()
    if (await box.count()) {
      await box.fill('Por favor sube una versión más nítida (smoke).')
      await pedir.click()
      await page.waitForTimeout(400)
    }
  }

  // Conciliación
  await page.goto(`${BASE}/?vista=equipo&equipo=conciliacion&skip=1`, {
    waitUntil: 'networkidle',
  })
  await page.waitForTimeout(400)
  const cruce = page.getByText('Completar cruce').first()
  if (await cruce.count()) {
    await cruce.click()
    await page.waitForTimeout(300)
  }

  // Cobranza + Valeria firmar deep-link
  await page.goto(`${BASE}/?vista=equipo&equipo=cobranza&skip=1`, {
    waitUntil: 'networkidle',
  })
  await page.waitForTimeout(300)

  // Admin alumnos: mensaje → alumno avisos (sin recargar: el store vive en memoria)
  await page.goto(`${BASE}/?vista=equipo&equipo=alumnos&skip=1`, {
    waitUntil: 'networkidle',
  })
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: /Ana Sofía Ramírez/ }).first().click()
  await page.waitForTimeout(400)
  await page.locator('textarea').nth(1).fill('Smoke: mensaje admin visible en avisos del alumno.')
  await page.getByRole('button', { name: 'Enviar al alumno' }).click()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: /Ver como alumno/i }).click()
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: /^Avisos \d+$/ }).click()
  await page.waitForTimeout(400)
  const msgBadge = page.getByText('Mensaje del equipo').first()
  if (!(await msgBadge.count())) {
    throw new Error('No apareció el mensaje del equipo en avisos del alumno')
  }

  await page.goto(`${BASE}/?vista=equipo&equipo=pipeline&cliente=c5&skip=1`, {
    waitUntil: 'networkidle',
  })
  await page.waitForTimeout(500)
  const firmar = page.getByText('Firmar contrato').first()
  if (await firmar.count()) {
    await firmar.click()
    await page.waitForTimeout(300)
  }

  // Cue card estática
  const cue = await page.goto(`${BASE}/cue.html`, { waitUntil: 'domcontentloaded' })
  if (!cue || cue.status() >= 400) throw new Error('cue.html no responde')

  // Ambas vistas → folio check en ensayo no es obligatorio; sin errores sí
  if (errors.length) {
    console.error('SMOKE FAIL — errores de consola:')
    for (const e of errors) console.error(' -', e)
    process.exit(1)
  }
  console.log('SMOKE OK — folio', folio.trim(), '· docs/cruce/firma · sin errores')
  process.exit(0)
} catch (e) {
  console.error('SMOKE FAIL —', e.message)
  if (errors.length) console.error('Consola:', errors)
  process.exit(1)
} finally {
  await browser.close()
}
