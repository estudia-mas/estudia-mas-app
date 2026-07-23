import axios from 'axios'

import authApi from './authApi'
import { store } from './store'
import { logoutUser, setAccessToken } from './features/auth/authSlice'
import { getApiBaseUrl } from './config'

const api = axios.create({
  baseURL: getApiBaseUrl(),
})

let isRefreshing = false
const subscribers: Array<(token: string) => void> = []

function onRefreshed(token: string) {
  subscribers.forEach((cb) => {
    cb(token)
  })
  subscribers.length = 0
}

function addSubscriber(cb: (token: string) => void) {
  subscribers.push(cb)
}

async function refreshAccessToken(): Promise<string> {
  const { data } = await authApi.post<{ access: string }>(
    '/api/auth/jwt/refresh/',
  )
  store.dispatch(setAccessToken(data.access))
  return data.access
}

api.interceptors.request.use((config) => {
  const state = store.getState()
  const token = state.auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean
    }

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      !originalRequest
    ) {
      return Promise.reject(error)
    }

    const url = String(originalRequest.url ?? '')
    if (url.includes('/jwt/')) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (!isRefreshing) {
      isRefreshing = true
      void refreshAccessToken()
        .then((access) => {
          isRefreshing = false
          onRefreshed(access)
        })
        .catch(() => {
          isRefreshing = false
          subscribers.length = 0
          void store.dispatch(logoutUser())
        })
    }

    return new Promise((resolve) => {
      addSubscriber((token: string) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        resolve(api(originalRequest))
      })
    })
  },
)

export { api }
