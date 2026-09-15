import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { clearAuthenticationSession } from '../api/auth'
import { api } from '../api/axios'

export type UserRole = 'user' | 'admin'
export type AuthProviderType = 'LOCAL' | 'SOCIAL'

export interface AuthUser {
  name: string
  nickname: string
  email: string
  school: string
  department: string
  grade: string
  desiredJob: string
  hasSpec: boolean
  role: UserRole
  provider: AuthProviderType
}

interface AuthContextValue {
  user: AuthUser | null
  isLoggedIn: boolean
  isAdmin: boolean
  login: (user?: Partial<AuthUser>) => void
  logout: () => Promise<void>
  setHasSpec: (hasSpec: boolean) => void
  updateProfile: (partial: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getStoredUserRole(): UserRole {
  const storedRole = localStorage.getItem('role')
  const storedUiRole = localStorage.getItem('uiRole')

  if (storedRole === 'ROLE_ADMIN' || storedUiRole === 'admin') {
    return 'admin'
  }

  return 'user'
}

function emptyUser(partial?: Partial<AuthUser>): AuthUser {
  return {
    name: partial?.name?.trim() || localStorage.getItem('name') || '회원',
    nickname: partial?.nickname ?? localStorage.getItem('nickname') ?? '',
    email: partial?.email ?? localStorage.getItem('email') ?? '',
    school: partial?.school ?? localStorage.getItem('school') ?? '',
    department: partial?.department ?? localStorage.getItem('department') ?? '',
    grade: partial?.grade ?? localStorage.getItem('grade') ?? '',
    desiredJob: partial?.desiredJob ?? localStorage.getItem('desiredJob') ?? '',
    hasSpec: partial?.hasSpec ?? localStorage.getItem('hasSpec') === 'true',
    role: partial?.role ?? getStoredUserRole(),
    provider: partial?.provider ?? (localStorage.getItem('provider') as AuthProviderType | null) ?? 'LOCAL',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const hasToken = Boolean(localStorage.getItem('token'))
    const isGuest = localStorage.getItem('role') === 'ROLE_GUEST'
    return hasToken && !isGuest ? emptyUser() : null
  })

  const login: AuthContextValue['login'] = useCallback((partial) => {
    const nextUser = emptyUser(partial)

    localStorage.setItem('name', nextUser.name)
    localStorage.setItem('nickname', nextUser.nickname)
    localStorage.setItem('email', nextUser.email)
    localStorage.setItem('school', nextUser.school)
    localStorage.setItem('department', nextUser.department)
    localStorage.setItem('grade', nextUser.grade)
    localStorage.setItem('desiredJob', nextUser.desiredJob)
    localStorage.setItem('hasSpec', String(nextUser.hasSpec))
    localStorage.setItem('uiRole', nextUser.role)
    localStorage.setItem('provider', nextUser.provider)
    setUser(nextUser)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      clearAuthenticationSession()
      setUser(null)
    }
  }, [])

  const setHasSpec = useCallback((hasSpec: boolean) => {
    localStorage.setItem('hasSpec', String(hasSpec))
    setUser((prev) => (prev ? { ...prev, hasSpec } : prev))
  }, [])

  const updateProfile = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) {
        return prev
      }

      const nextUser = { ...prev, ...partial }
      localStorage.setItem('name', nextUser.name)
      localStorage.setItem('nickname', nextUser.nickname)
      if (nextUser.email) localStorage.setItem('email', nextUser.email)
      if (nextUser.school) localStorage.setItem('school', nextUser.school)
      if (nextUser.department) localStorage.setItem('department', nextUser.department)
      if (nextUser.grade) localStorage.setItem('grade', nextUser.grade)
      if (nextUser.desiredJob) localStorage.setItem('desiredJob', nextUser.desiredJob)
      localStorage.setItem('hasSpec', String(nextUser.hasSpec))
      return nextUser
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: user !== null,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        setHasSpec,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return ctx
}
