import type { Plantilla } from '../types'

export const initialPlantillas: Plantilla[] = [
  {
    id: 'pf-solicitud',
    tipo: 'formulario',
    nombre: 'Solicitud de crédito educativo',
    descripcion: 'Campos base de captación / solicitud.',
    activaVersion: 2,
    versiones: [
      {
        version: 1,
        fecha: '2026-01-10',
        autor: 'Operaciones',
        nota: 'Versión inicial',
        contenido:
          'Captura del alumno: CURP (identidad automática), Universidad, Carrera, Teléfono. La cuenta/expediente ya existe por registro o invitación con correo.',
      },
      {
        version: 2,
        fecha: '2026-03-01',
        autor: 'Mesa de control',
        nota: 'Se agregó obligado solidario y origen del lead',
        contenido:
          'Alta: (A) el alumno crea su cuenta con correo → nace el expediente → llena formulario. (B) Estudia Más invita con correo obligatorio → el alumno completa CURP (nombre/edad/sexo/entidad), universidad y carrera. No se captura el nombre a mano.',
      },
    ],
  },
  {
    id: 'pf-buro',
    tipo: 'formulario',
    nombre: 'Autorización consulta Buró',
    descripcion: 'Consentimiento para buró dentro del expediente.',
    activaVersion: 1,
    versiones: [
      {
        version: 1,
        fecha: '2026-02-01',
        autor: 'Legal',
        nota: 'Primera publicación',
        contenido:
          'Autorizo a Estudia Más a consultar mi historial crediticio ante el Buró de Crédito con fines de análisis de la solicitud EM-[folio].',
      },
    ],
  },
  {
    id: 'pd-puntualidad',
    tipo: 'descuento',
    nombre: 'Recompensa puntualidad 2%',
    descripcion: 'Descuento automático al cumplir N pagos a tiempo.',
    activaVersion: 1,
    versiones: [
      {
        version: 1,
        fecha: '2026-01-15',
        autor: 'Cobranza',
        nota: 'Política inicial',
        contenido:
          'Tras 3 pagos puntuales consecutivos se aplica −2% sobre la mensualidad base. No acumulable con otras promociones.',
        valorNumerico: 2,
      },
    ],
  },
  {
    id: 'pd-pronto',
    tipo: 'descuento',
    nombre: 'Descuento pronto pago / liquidación',
    descripcion: 'Bonificación al liquidar anticipado (demo).',
    activaVersion: 1,
    versiones: [
      {
        version: 1,
        fecha: '2026-04-01',
        autor: 'Finanzas',
        nota: 'Borrador comercial',
        contenido:
          'Liquidación anticipada: descuento ilustrativo de 1.5% sobre intereses remanentes si se paga el saldo en una sola exhibición.',
        valorNumerico: 1.5,
      },
    ],
  },
]
