import axios from 'axios'
import { api } from './axios'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export type AuthenticationRole =
  | 'ROLE_GUEST'
  | 'ROLE_USER'
  | 'ROLE_ADMIN'

export interface AuthenticationSession {
  accessToken: string
  uuid: string
  role: AuthenticationRole
  name: string
}

export interface LocalSignupRequest {
  name: string
  email: string
  password: string
}

export interface LocalLoginRequest {
  email: string
  password: string
}

export async function signupLocal(
  request: LocalSignupRequest,
): Promise<AuthenticationSession> {
  const response = await api.post<ApiResponse<AuthenticationSession>>(
    '/auth/signup',
    request,
  )
  return response.data.data
}

export async function loginLocal(
  request: LocalLoginRequest,
): Promise<AuthenticationSession> {
  const response = await api.post<ApiResponse<AuthenticationSession>>(
    '/auth/login',
    request,
  )
  return response.data.data
}

export async function refreshAuthentication(): Promise<AuthenticationSession> {
  const response = await api.post<ApiResponse<AuthenticationSession>>(
    '/auth/refresh',
  )
  return response.data.data
}

export function saveAuthenticationSession(
  session: AuthenticationSession,
) {
  localStorage.setItem('token', session.accessToken)
  localStorage.setItem('uuid', session.uuid)
  localStorage.setItem('role', session.role)
  localStorage.setItem('name', session.name || '회원')
}

export function clearAuthenticationSession() {
  sessionStorage.clear()
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('uuid')
  localStorage.removeItem('name')
  localStorage.removeItem('nickname')
  localStorage.removeItem('hasSpec')
  localStorage.removeItem('uiRole')
  localStorage.removeItem('provider')
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!axios.isAxiosError(error)) {
    return fallback
  }

  const data = error.response?.data as {
    message?: string
    errors?: Array<{ reason?: string }>
  } | undefined

  return data?.errors?.[0]?.reason || data?.message || fallback
}

export const verifyPassword = async (password: string): Promise<void> => {
  await api.post('/auth/verify-password', { password })
}

export const updateRealName = async (name: string): Promise<void> => {
  await api.put('/auth/me/name', { name })
}
