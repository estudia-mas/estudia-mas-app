import { useState } from 'react'
import {
  Alert,
  Button,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm, type Resolver } from 'react-hook-form'
import { isAxiosError } from 'axios'
import { Link, useParams } from 'react-router-dom'

import authApi from '../../authApi'
import AuthCard from '../../components/layouts/AuthCard'
import AuthLayout from '../../components/layouts/AuthLayout'
import {
  resetPasswordConfirmSchema,
  type ResetPasswordConfirmFormValues,
} from '../../features/auth/schemas'

const RESET_SUCCESS_MESSAGES: Record<string, string> = {
  'Password has been reset. You can sign in now.':
    'Contraseña actualizada. Ya puedes iniciar sesión.',
}

const RESET_LINK_ERROR_MESSAGES: Record<string, string> = {
  'Invalid reset link.': 'El enlace de recuperación no es válido.',
  'Invalid or expired reset link.':
    'El enlace de recuperación no es válido o ha caducado.',
}

function formatResetApiError(err: unknown): string {
  if (!isAxiosError(err)) {
    return 'No se pudo actualizar la contraseña. Intenta de nuevo.'
  }
  const data = err.response?.data as Record<string, unknown> | undefined
  if (!data) {
    return 'No se pudo actualizar la contraseña. Intenta de nuevo.'
  }
  if (typeof data.detail === 'string') {
    return RESET_LINK_ERROR_MESSAGES[data.detail] ?? data.detail
  }
  const pwd = data.new_password
  if (Array.isArray(pwd) && typeof pwd[0] === 'string') return pwd[0]
  if (typeof pwd === 'string') return pwd
  const rePwd = data.re_new_password
  if (Array.isArray(rePwd) && typeof rePwd[0] === 'string') {
    return rePwd[0] === 'Passwords do not match.'
      ? 'Las contraseñas no coinciden.'
      : rePwd[0]
  }
  return 'No se pudo actualizar la contraseña. Intenta de nuevo.'
}

export default function ResetPasswordConfirmPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>()
  const linkInvalid = !uid?.trim() || !token?.trim()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(
    linkInvalid ? 'El enlace de recuperación está incompleto.' : null,
  )
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordConfirmFormValues>({
    resolver: yupResolver(
      resetPasswordConfirmSchema,
    ) as Resolver<ResetPasswordConfirmFormValues>,
    defaultValues: {
      new_password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: ResetPasswordConfirmFormValues) {
    if (linkInvalid || !uid || !token) return

    setIsSubmitting(true)
    setApiError(null)
    setSuccessMessage(null)

    try {
      const { data } = await authApi.post<{ detail?: string }>(
        '/api/auth/password/reset/confirm/',
        {
          uid,
          token,
          new_password: values.new_password,
          re_new_password: values.confirmPassword,
        },
      )
      const detail = data?.detail
      setSuccessMessage(
        detail && RESET_SUCCESS_MESSAGES[detail]
          ? RESET_SUCCESS_MESSAGES[detail]
          : 'Contraseña actualizada. Ya puedes iniciar sesión.',
      )
      reset()
    } catch (err) {
      setApiError(formatResetApiError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <Stack spacing={0.75} sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h1">
            Nueva contraseña
          </Typography>
          <Typography color="text.secondary">
            Elige una contraseña segura para tu cuenta.
          </Typography>
        </Stack>

        {successMessage ? (
          <Stack spacing={2}>
            <Alert severity="success">{successMessage}</Alert>
            <Button component={Link} to="/login" variant="contained" fullWidth>
              Ir a iniciar sesión
            </Button>
          </Stack>
        ) : (
          <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={2}>
            <Controller
              name="new_password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nueva contraseña"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  fullWidth
                  disabled={linkInvalid}
                  error={Boolean(errors.new_password)}
                  helperText={errors.new_password?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => setShowPassword((p) => !p)}
                            onMouseDown={(e) => e.preventDefault()}
                            aria-label="Mostrar contraseña"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirmar contraseña"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  fullWidth
                  disabled={linkInvalid}
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => setShowConfirmPassword((p) => !p)}
                            onMouseDown={(e) => e.preventDefault()}
                            aria-label="Mostrar confirmación"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting || linkInvalid}
            >
              {isSubmitting ? 'Guardando…' : 'Guardar contraseña'}
            </Button>
          </Stack>
        )}

        {apiError ? <Alert severity="error">{apiError}</Alert> : null}

        <MuiLink component={Link} to="/login" underline="hover" align="center">
          Volver a iniciar sesión
        </MuiLink>
      </AuthCard>
    </AuthLayout>
  )
}
