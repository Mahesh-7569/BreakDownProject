import axios from 'axios'
import { API_BASE_URL } from '../config/apiConfig'
import { getToken, isTokenExpired, logout } from './authService'

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    const tokenIsValid = token && !isTokenExpired()

    if (tokenIsValid) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      logout()
    }
    return Promise.reject(error)
  },
)

export default httpClient

/**
 * Shared HTTP client usage:
 * - Import `httpClient` and call it like axios: `httpClient.get('/api/SomeEndpoint')`.
 * - When a valid token exists, the Authorization header is added automatically.
 * - 401 responses clear the stored token so PrivateRoute can redirect unauthenticated users.
 */
