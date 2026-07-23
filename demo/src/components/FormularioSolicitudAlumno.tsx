import { useMemo, useState } from 'react'

import {
  esCurpFormatoValido,
  formatFechaMx,
  normalizarCurp,
} from '../lib/curp'
import { consultarIdentidadPorCurp, CURP_EJEMPLOS_ALTA } from '../data/renapoMock'
import { useDemoStore } from '../store/demoStore'

type Props = {
  clienteId: string
  email: string
  origenAlta: 'alumno' | 'equipo'
}

export default function FormularioSolicitudAlumno({
  clienteId,
  email,
  origenAlta,
}: Props) {
  const completar = useDemoStore((s) => s.completarFormularioSolicitud)

  const [curp, setCurp] = useState('')
  const [universidad, setUniversidad] = useState('')
  const [carrera, setCarrera] = useState('')
  const [telefono, setTelefono] = useState('')

  const preview = useMemo(
    () => (curp.trim().length >= 18 ? consultarIdentidadPorCurp(curp) : null),
    [curp],
  )

  const canSubmit =
    Boolean(preview) &&
    universidad.trim().length > 1 &&
    carrera.trim().length > 1

  return (
    <section className="rounded-[14px] border-2 border-teal/40 bg-white p-4 sm:p-5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-teal">
        Formulario de solicitud · obligatorio
      </p>
      <h2 className="mt-1 text-lg font-semibold text-navy sm:text-xl">
        Completa tus datos para activar el expediente
      </h2>
      <p className="mt-2 text-sm text-gray">
        {origenAlta === 'equipo' ? (
          <>
            Estudia Más abrió tu expediente con el correo{' '}
            <strong className="text-navy">{email}</strong>. Tú debes llenar la
            solicitud (CURP y datos académicos).
          </>
        ) : (
          <>
            Tu cuenta ya existe (
            <strong className="text-navy">{email}</strong>). El expediente nace
            al crear la cuenta; ahora captura tu CURP y datos de estudio.
          </>
        )}
      </p>

      <div className="mt-4 space-y-3">
        <label className="block text-xs">
          <span className="font-medium text-gray">CURP</span>
          <input
            value={curp}
            onChange={(e) => setCurp(normalizarCurp(e.target.value))}
            maxLength={18}
            placeholder="18 caracteres"
            className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2.5 font-mono text-sm uppercase"
            spellCheck={false}
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CURP_EJEMPLOS_ALTA.filter((e) => !e.hint.includes('Ana')).map(
            (ex) => (
              <button
                key={ex.curp}
                type="button"
                className="rounded-full border border-navy/10 bg-light px-2.5 py-1 text-[11px] font-medium"
                onClick={() => setCurp(ex.curp)}
              >
                {ex.hint}
              </button>
            ),
          )}
        </div>

        {curp.length >= 10 && !esCurpFormatoValido(curp) ? (
          <p className="text-xs text-lime">
            Formato incompleto o inválido ({curp.length}/18).
          </p>
        ) : null}

        {preview ? (
          <div className="grid gap-2 rounded-[10px] bg-mint/50 p-3 text-sm sm:grid-cols-2">
            <p>
              <span className="text-xs text-gray">Nombre (desde CURP)</span>
              <br />
              <strong className="text-navy">{preview.nombre}</strong>
            </p>
            <p>
              <span className="text-xs text-gray">Edad / nacimiento</span>
              <br />
              <strong className="text-navy">
                {preview.edad} años · {formatFechaMx(preview.fechaNacimiento)}
              </strong>
            </p>
            <p>
              <span className="text-xs text-gray">Sexo</span>
              <br />
              <strong className="text-navy">{preview.sexoLabel}</strong>
            </p>
            <p>
              <span className="text-xs text-gray">Entidad</span>
              <br />
              <strong className="text-navy">{preview.entidadNombre}</strong>
            </p>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs">
            <span className="font-medium text-gray">Universidad</span>
            <input
              value={universidad}
              onChange={(e) => setUniversidad(e.target.value)}
              className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2.5 text-sm"
              placeholder="Ej. UNAM"
            />
          </label>
          <label className="block text-xs">
            <span className="font-medium text-gray">Carrera</span>
            <input
              value={carrera}
              onChange={(e) => setCarrera(e.target.value)}
              className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2.5 text-sm"
              placeholder="Ej. Medicina"
            />
          </label>
          <label className="block text-xs sm:col-span-2">
            <span className="font-medium text-gray">Teléfono</span>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2.5 text-sm"
              placeholder="55 …"
            />
          </label>
        </div>

        <button
          type="button"
          disabled={!canSubmit}
          className="w-full rounded-[10px] bg-teal py-3 text-sm font-semibold text-white disabled:opacity-40"
          onClick={() =>
            completar(clienteId, {
              curp,
              universidad,
              carrera,
              telefono,
            })
          }
        >
          Enviar solicitud
        </button>
      </div>
    </section>
  )
}
