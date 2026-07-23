import axios from 'axios'
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'

import authApi from '../../authApi'
import { getApiBaseUrl } from '../../config'

export interface Group {
  id: number
  name: string
}

export interface User {
  id: string
  email: string
  username: string | null
  first_name: string
  last_name: string
  second_last_name: string | null
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  groups: Group[]
}

export interface AuthState {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean
  /** True until initial refresh attempt finishes */
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

async function fetchMe(access: string): Promise<User> {
  const { data } = await axios.get<User>(`${getApiBaseUrl()}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${access}` },
  })
  return data
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authApi.post<{ access: string }>(
        '/api/auth/jwt/create/',
        { email, password },
      )
      const { access } = response.data
      const user = await fetchMe(access)
      return { access, user }
    } catch {
      return rejectWithValue('Correo o contraseña incorrectos.')
    }
  },
)

export const checkAndRefreshToken = createAsyncThunk(
  'auth/checkAndRefreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.post<{ access: string }>(
        '/api/auth/jwt/refresh/',
      )
      const access = response.data.access
      const user = await fetchMe(access)
      return { access, user }
    } catch {
      return rejectWithValue(null)
    }
  },
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.post('/api/auth/jwt/logout/')
  } catch {
    // still clear client state
  }
})

export type ProfileUpdateBody = {
  first_name?: string
  last_name?: string
  second_last_name?: string
  username?: string
}

export type PasswordChangeBody = {
  current_password: string
  new_password: string
  re_new_password: string
}

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (body: ProfileUpdateBody, { rejectWithValue }) => {
    try {
      const { api } = await import('../../api')
      const { data } = await api.patch<User>('/api/auth/me/', body)
      return data
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        return rejectWithValue(err.response.data)
      }
      return rejectWithValue({ detail: 'No se pudo actualizar el perfil.' })
    }
  },
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (body: PasswordChangeBody, { rejectWithValue }) => {
    try {
      const { api } = await import('../../api')
      const { data } = await api.post<User>('/api/auth/me/password/', body)
      return data
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        return rejectWithValue(err.response.data)
      }
      return rejectWithValue({ detail: 'No se pudo cambiar la contraseña.' })
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
    setAccessToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.accessToken = action.payload.access
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) ?? 'No se pudo iniciar sesión'
        state.isAuthenticated = false
        state.user = null
        state.accessToken = null
      })
      .addCase(checkAndRefreshToken.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAndRefreshToken.fulfilled, (state, action) => {
        state.isLoading = false
        state.accessToken = action.payload.access
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(checkAndRefreshToken.rejected, (state) => {
        state.isLoading = false
        state.accessToken = null
        state.user = null
        state.isAuthenticated = false
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.accessToken = null
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { clearError, setAccessToken } = authSlice.actions
export default authSlice.reducer
