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
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import {
  loginSchema,
  type LoginFormValues,
} from '../../features/auth/schemas'
import { loginUser } from '../../features/auth/authSlice'
import type { AppDispatch, RootState } from '../../store'
import {
  AUTHENTICATED_DEFAULT_PATH,
  isSafeInternalRedirect,
} from '../../utils/authRoutes'
import AuthCard from '../../components/layouts/AuthCard'
import AuthLayout from '../../components/layouts/AuthLayout'

type LoginLocationState = {
  successMessage?: string
}

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const registerSuccessMessage =
    (location.state as LoginLocationState | null)?.successMessage ?? null
  const isLoading = useSelector((s: RootState) => s.auth.isLoading)
  const error = useSelector((s: RootState) => s.auth.error)
  const [showPassword, setShowPassword] = useState(false)

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema) as Resolver<LoginFormValues>,
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      await dispatch(
        loginUser({ email: values.email, password: values.password }),
      ).unwrap()
      const redirect = new URLSearchParams(location.search).get('redirect')
      navigate(
        redirect && isSafeInternalRedirect(redirect)
          ? redirect
          : AUTHENTICATED_DEFAULT_PATH,
        { replace: true },
      )
    } catch {
      /* rejected in slice */
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <Stack spacing={0.75} sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h1">
            Iniciar sesión
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Accede a tu cuenta de Estudia Más
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
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
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
                          aria-label={
                            showPassword
                              ? 'Ocultar contraseña'
                              : 'Mostrar contraseña'
                          }
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
          <MuiLink
            component={Link}
            to="/recuperar-contrasena"
            underline="hover"
            variant="body2"
            sx={{ alignSelf: 'flex-end' }}
          >
            ¿Olvidaste tu contraseña?
          </MuiLink>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando…' : 'Continuar'}
          </Button>
        </Stack>

        {registerSuccessMessage ? (
          <Alert severity="success">{registerSuccessMessage}</Alert>
        ) : null}
        {error ? <Alert severity="error">{error}</Alert> : null}

        <Typography variant="body2" align="center" color="text.secondary">
          ¿No tienes cuenta?{' '}
          <MuiLink component={Link} to="/registro" underline="hover">
            Crear cuenta
          </MuiLink>
        </Typography>
      </AuthCard>
    </AuthLayout>
  )
}
