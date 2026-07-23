import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Button,
  CircularProgress,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material'
import { isAxiosError } from 'axios'
import { Link, useParams } from 'react-router-dom'

import authApi from '../../authApi'
import AuthCard from '../../components/layouts/AuthCard'
import AuthLayout from '../../components/layouts/AuthLayout'

const ACTIVATE_SUCCESS_MESSAGES: Record<string, string> = {
  'Your account has been activated.':
    'Cuenta activada correctamente. Ya puedes iniciar sesión.',
  'Account is already active.':
    'Esta cuenta ya estaba activa. Puedes iniciar sesión.',
}

const ACTIVATE_ERROR_MESSAGES: Record<string, string> = {
  'Invalid activation link.': 'El enlace de activación no es válido.',
  'Invalid or expired activation link.':
    'El enlace de activación no es válido o ha caducado.',
}

function messageFromDetail(
  detail: string | undefined,
  map: Record<string, string>,
  fallback: string,
): string {
  if (!detail) return fallback
  return map[detail] ?? fallback
}

function extractDetail(err: unknown): string | undefined {
  if (!isAxiosError(err)) return undefined
  const data = err.response?.data as { detail?: string } | undefined
  return typeof data?.detail === 'string' ? data.detail : undefined
}

type ActivateStatus = 'loading' | 'success' | 'error' | 'invalid_link'

export default function ActivatePage() {
  const { uid, token } = useParams<{ uid: string; token: string }>()
  const [status, setStatus] = useState<ActivateStatus>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const attemptedRef = useRef(false)

  useEffect(() => {
    if (attemptedRef.current) return
    if (!uid?.trim() || !token?.trim()) {
      setStatus('invalid_link')
      setMessage('El enlace de activación está incompleto.')
      return
    }

    attemptedRef.current = true

    async function activate() {
      try {
        const { data } = await authApi.post<{ detail?: string }>(
          '/api/auth/activate/',
          { uid, token },
        )
        setStatus('success')
        setMessage(
          messageFromDetail(
            data?.detail,
            ACTIVATE_SUCCESS_MESSAGES,
            'Cuenta activada correctamente. Ya puedes iniciar sesión.',
          ),
        )
      } catch (err) {
        const detail = extractDetail(err)
        if (detail === 'Account is already active.') {
          setStatus('success')
          setMessage(
            messageFromDetail(
              detail,
              ACTIVATE_SUCCESS_MESSAGES,
              'Esta cuenta ya estaba activa. Puedes iniciar sesión.',
            ),
          )
          return
        }
        setStatus('error')
        setMessage(
          messageFromDetail(
            detail,
            ACTIVATE_ERROR_MESSAGES,
            'No se pudo activar la cuenta. Solicita un nuevo enlace o regístrate de nuevo.',
          ),
        )
      }
    }

    void activate()
  }, [uid, token])

  return (
    <AuthLayout>
      <AuthCard>
        <Typography variant="h4" component="h1" align="center">
          Activar cuenta
        </Typography>

        {status === 'loading' ? (
          <Stack spacing={2} sx={{ py: 2, alignItems: 'center' }}>
            <CircularProgress size={40} />
            <Typography color="text.secondary">
              Validando tu enlace de activación…
            </Typography>
          </Stack>
        ) : null}

        {status === 'success' && message ? (
          <Alert severity="success">{message}</Alert>
        ) : null}

        {(status === 'error' || status === 'invalid_link') && message ? (
          <Alert severity="error">{message}</Alert>
        ) : null}

        {status === 'success' ? (
          <Button component={Link} to="/login" variant="contained" fullWidth>
            Ir a iniciar sesión
          </Button>
        ) : null}

        {status !== 'loading' ? (
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {status !== 'success' ? (
              <MuiLink component={Link} to="/registro" underline="hover">
                Crear cuenta
              </MuiLink>
            ) : null}
            <MuiLink component={Link} to="/login" underline="hover">
              Iniciar sesión
            </MuiLink>
          </Stack>
        ) : null}
      </AuthCard>
    </AuthLayout>
  )
}
