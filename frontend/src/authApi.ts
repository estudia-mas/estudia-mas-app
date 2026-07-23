import axios from 'axios'

import { getApiBaseUrl } from './config'

/** Login, refresh, logout — sends HttpOnly refresh cookie (withCredentials). */
const authApi = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
})

export default authApi
