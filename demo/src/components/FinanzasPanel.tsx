import { useMemo, useState } from 'react'

import AntesAhoraBadge from './AntesAhoraBadge'
import {
  catIlustrativo,
  formatMXN,
  interesesTotales,
  mensualidadFrancesa,
  tablaAmortizacion,
  tirAproximada,
  tirReal,
} from '../lib/amortizacion'
import { useDemoStore } from '../store/demoStore'

export default function FinanzasPanel() {
  const clientes = useDemoStore((s) => s.clientes)
  const conCredito = clientes.filter((c) => c.credito)

  const [clienteId, setClienteId] = useState(conCredito[0]?.id ?? '')
  const selected = clientes.find((c) => c.id === clienteId)
  const cr = selected?.credito

  const [saldo, setSaldo] = useState(cr?.saldoActual ?? 180000)
  const [plazo, setPlazo] = useState(cr?.plazo ?? 36)
  const [tasa, setTasa] = useState(cr?.tasaAnual ?? 18)
  const [comision, setComision] = useState(1.5)

  // Sync when picking another client
  function pickCliente(id: string) {
    setClienteId(id)
    const c = clientes.find((x) => x.id === id)?.credito
    if (c) {
      setSaldo(c.saldoActual)
      setPlazo(c.plazo)
      setTasa(c.tasaAnual)
    }
  }

  const metrics = useMemo(() => {
    const mensualidad = Math.round(mensualidadFrancesa(saldo, plazo, tasa))
    const tabla = tablaAmortizacion(saldo, plazo, tasa)
    const intereses = interesesTotales(saldo, plazo, tasa)
    const tir = tirAproximada(tasa, comision)
    const cat = catIlustrativo(tasa, comision)
    const tirR = tirReal(tir)
    const totalPagar = mensualidad * plazo
    return { mensualidad, tabla, intereses, tir, cat, tirR, totalPagar }
  }, [saldo, plazo, tasa, comision])

  return (
    <section className="space-y-4">
      <AntesAhoraBadge
        antes="TIR / CAT / tabla en Excel aparte"
        ahora="auto-cálculo en el mismo folio"
      />

      <div className="rounded-[12px] border border-teal/25 bg-mint/40 p-4">
        <p className="text-sm font-semibold text-navy">
          ¿Qué se auto-calcula aquí?
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray">
          <li>
            <strong className="text-navy">Mensualidad</strong> — sistema francés
            (cuota fija) a partir de saldo, plazo y tasa.
          </li>
          <li>
            <strong className="text-navy">Tabla de amortización</strong> —
            interés, capital y saldo por periodo.
          </li>
          <li>
            <strong className="text-navy">Intereses totales</strong> — suma de
            la columna de interés.
          </li>
          <li>
            <strong className="text-navy">TIR / CAT ilustrativos</strong> —
            estimados de costo del crédito (demo; no son oficiales CNBV).
          </li>
        </ul>
        <p className="mt-2 text-xs text-gray">
          Al ajustar crédito en Alumnos o al aplicar una simulación, estos
          números se recalculan y quedan en el historial de ajustes.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
        <div className="space-y-3 rounded-[12px] border border-navy/10 bg-white p-4">
          <label className="block text-xs">
            <span className="font-medium text-gray">Expediente de referencia</span>
            <select
              value={clienteId}
              onChange={(e) => pickCliente(e.target.value)}
              className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2 text-sm"
            >
              {conCredito.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} · {c.folio}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs">
              <span className="font-medium text-gray">Saldo</span>
              <input
                type="number"
                value={saldo}
                onChange={(e) => setSaldo(Number(e.target.value))}
                className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs">
              <span className="font-medium text-gray">Plazo (meses)</span>
              <input
                type="number"
                value={plazo}
                onChange={(e) => setPlazo(Number(e.target.value))}
                className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs">
              <span className="font-medium text-gray">Tasa anual %</span>
              <input
                type="number"
                step="0.1"
                value={tasa}
                onChange={(e) => setTasa(Number(e.target.value))}
                className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs">
              <span className="font-medium text-gray">
                Comisión apertura % (ilustr.)
              </span>
              <input
                type="number"
                step="0.1"
                value={comision}
                onChange={(e) => setComision(Number(e.target.value))}
                className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['Mensualidad', formatMXN(metrics.mensualidad)],
            ['Total a pagar (aprox.)', formatMXN(metrics.totalPagar)],
            ['Intereses totales', formatMXN(metrics.intereses)],
            ['TIR aprox.', `${metrics.tir}%`],
            ['CAT ilustrativo', `${metrics.cat}%`],
            ['TIR real (vs inflación)', `${metrics.tirR}%`],
          ].map(([k, v]) => (
            <div
              key={k}
              className="rounded-[12px] border border-navy/10 bg-white p-4"
            >
              <p className="text-xs text-gray">{k}</p>
              <p className="mt-1 text-xl font-semibold text-navy">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[12px] border border-navy/10 bg-white">
        <div className="border-b border-navy/5 px-4 py-3">
          <p className="text-sm font-semibold text-navy">
            Tabla de amortización (primeros 12 periodos)
          </p>
          <p className="text-xs text-gray">
            Se regenera al cambiar saldo, plazo o tasa — sin hoja aparte.
          </p>
        </div>
        <div className="max-h-72 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-light text-xs uppercase text-gray">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-right">Pago</th>
                <th className="px-3 py-2 text-right">Interés</th>
                <th className="px-3 py-2 text-right">Capital</th>
                <th className="px-3 py-2 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {metrics.tabla.slice(0, 12).map((r) => (
                <tr key={r.periodo} className="border-t border-navy/5">
                  <td className="px-3 py-1.5">{r.periodo}</td>
                  <td className="px-3 py-1.5 text-right">{formatMXN(r.pago)}</td>
                  <td className="px-3 py-1.5 text-right">
                    {formatMXN(r.interes)}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    {formatMXN(r.capital)}
                  </td>
                  <td className="px-3 py-1.5 text-right">{formatMXN(r.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
