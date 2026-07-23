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
import { Link, useNavigate } from 'react-router-dom'

import authApi from '../../authApi'
import AuthCard from '../../components/layouts/AuthCard'
import AuthLayout from '../../components/layouts/AuthLayout'
import {
  registerSchema,
  type RegisterFormValues,
} from '../../features/auth/schemas'

const REGISTER_NO_ACTIVATION_DETAIL =
  'Registration successful. You can sign in now.'

const REGISTER_SUCCESS_MESSAGES: Record<string, string> = {
  'Registration successful. Check your email to activate your account.':
    'Cuenta creada. Revisa tu correo y activa tu cuenta antes de iniciar sesión.',
  [REGISTER_NO_ACTIVATION_DETAIL]:
    'Cuenta creada correctamente. Ya puedes iniciar sesión.',
}

const DEFAULT_REGISTER_SUCCESS_MESSAGE =
  'Cuenta creada. Revisa tu correo y activa tu cuenta antes de iniciar sesión.'

function registerSuccessMessage(detail?: string): string {
  if (!detail) return DEFAULT_REGISTER_SUCCESS_MESSAGE
  return REGISTER_SUCCESS_MESSAGES[detail] ?? DEFAULT_REGISTER_SUCCESS_MESSAGE
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema) as Resolver<RegisterFormValues>,
    defaultValues: {
      first_name: '',
      last_name: '',
      second_last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true)
    setApiError(null)

    try {
      const { data } = await authApi.post<{ detail?: string }>(
        '/api/auth/register/',
        {
          first_name: values.first_name,
          last_name: values.last_name,
          second_last_name: values.second_last_name ?? '',
          email: values.email,
          password: values.password,
          re_password: values.confirmPassword,
        },
      )
      navigate('/login', {
        replace: true,
        state: { successMessage: registerSuccessMessage(data?.detail) },
      })
    } catch {
      setApiError(
        'No se pudo crear la cuenta. Revisa los datos o intenta más tarde.',
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
            Crear cuenta
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Regístrate para empezar a estudiar
          </Typography>
        </Stack>

        <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={2}>
          <Controller
            name="first_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre"
                required
                fullWidth
                error={Boolean(errors.first_name)}
                helperText={errors.first_name?.message}
              />
            )}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Controller
              name="last_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Primer apellido"
                  required
                  fullWidth
                  error={Boolean(errors.last_name)}
                  helperText={errors.last_name?.message}
                />
              )}
            />
            <Controller
              name="second_last_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Segundo apellido"
                  fullWidth
                  error={Boolean(errors.second_last_name)}
                  helperText={errors.second_last_name?.message}
                />
              )}
            />
          </Stack>
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
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                fullWidth
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando…' : 'Registrarme'}
          </Button>
        </Stack>

        {apiError ? <Alert severity="error">{apiError}</Alert> : null}

        <Typography variant="body2" align="center" color="text.secondary">
          ¿Ya tienes cuenta?{' '}
          <MuiLink component={Link} to="/login" underline="hover">
            Iniciar sesión
          </MuiLink>
        </Typography>
      </AuthCard>
    </AuthLayout>
  )
}
