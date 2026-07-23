import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('El correo es obligatorio')
    .email('Ingresa un correo válido'),
  password: yup.string().required('La contraseña es obligatoria'),
})

export const registerSchema = yup.object({
  first_name: yup
    .string()
    .transform((v) => (typeof v === 'string' ? v.trim() : v))
    .required('El nombre es obligatorio'),
  last_name: yup
    .string()
    .transform((v) => (typeof v === 'string' ? v.trim() : v))
    .required('El primer apellido es obligatorio'),
  second_last_name: yup
    .string()
    .optional()
    .transform((v) => (typeof v === 'string' ? v.trim() : ''))
    .default(''),
  email: yup
    .string()
    .required('El correo es obligatorio')
    .email('Ingresa un correo válido'),
  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: yup
    .string()
    .required('Confirma tu contraseña')
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
})

export const resetPasswordSchema = yup.object({
  email: yup
    .string()
    .required('El correo es obligatorio')
    .email('Ingresa un correo válido'),
})

export const resetPasswordConfirmSchema = yup.object({
  new_password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: yup
    .string()
    .required('Confirma tu contraseña')
    .oneOf([yup.ref('new_password')], 'Las contraseñas no coinciden'),
})

export type LoginFormValues = yup.InferType<typeof loginSchema>
export type RegisterFormValues = yup.InferType<typeof registerSchema>
export type ResetPasswordFormValues = yup.InferType<typeof resetPasswordSchema>
export type ResetPasswordConfirmFormValues = yup.InferType<
  typeof resetPasswordConfirmSchema
>
