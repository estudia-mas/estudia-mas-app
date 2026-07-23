import { useState } from 'react'
import {
  Alert,
  Button,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm, type Resolver } from 'react-hook-form'
import { Link } from 'react-router-dom'

import authApi from '../../authApi'
import AuthCard from '../../components/layouts/AuthCard'
import AuthLayout from '../../components/layouts/AuthLayout'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../../features/auth/schemas'

export default function ResetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(resetPasswordSchema) as Resolver<ResetPasswordFormValues>,
    defaultValues: { email: '' },
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    setIsSubmitting(true)
    setApiError(null)
    setSuccessMessage(null)

    try {
      await authApi.post('/api/auth/password/reset/', {
        email: values.email,
      })
      setSuccessMessage(
        'Si el correo existe en Estudia Más, te enviaremos instrucciones para recuperar tu contraseña.',
      )
      reset()
    } catch {
      setApiError(
        'No se pudo procesar la solicitud en este momento. Intenta nuevamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <Stack spacing={0.75} sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h1">
            Recuperar contraseña
          </Typography>
          <Typography color="text.secondary">
            Ingresa tu correo y te enviaremos el enlace de recuperación.
          </Typography>
        </Stack>
        <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={2}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Correo"
                type="email"
                autoComplete="email"
                required
                fullWidth
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
              />
            )}
          />
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando…' : 'Recibir enlace'}
          </Button>
        </Stack>
        {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
        {apiError ? <Alert severity="error">{apiError}</Alert> : null}
        <MuiLink component={Link} to="/login" underline="hover" align="center">
          Volver a iniciar sesión
        </MuiLink>
      </AuthCard>
    </AuthLayout>
  )
}
