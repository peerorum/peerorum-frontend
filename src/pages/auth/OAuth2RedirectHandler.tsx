import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  clearAuthenticationSession,
  refreshAuthentication,
  saveAuthenticationSession,
} from '../../api/auth'
import { fetchMyProfile } from '../../api/profile'
import { useAuth } from '../../context/AuthContext'
import { useSpec } from '../../context/SpecContext'

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const { loadFromProfile } = useSpec()
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return
    handledRef.current = true

    const completeLogin = async () => {
      const errorCode = searchParams.get('error')
      if (errorCode) {
        navigate(`/login?error=${encodeURIComponent(errorCode)}`, { replace: true })
        return
      }

      const token = searchParams.get('token')
      const role = searchParams.get('role')
      const uuid = searchParams.get('uuid')
      const redirectName = searchParams.get('name')?.trim() || ''

      if (!token) {
        navigate('/login?error=oauth2_failed', { replace: true })
        return
      }

      localStorage.setItem('token', token)
      if (role) localStorage.setItem('role', role)
      if (uuid) localStorage.setItem('uuid', uuid)

      try {
        const session = await refreshAuthentication()
        saveAuthenticationSession(session)
        const sessionName = session.name?.trim() || redirectName || '회원'

        if (session.role === 'ROLE_GUEST') {
          navigate('/signup?mode=onboarding', { replace: true })
          return
        }

        let profile
        try {
          profile = await fetchMyProfile()
          loadFromProfile(profile)
        } catch (profileError) {
          console.error('Failed to fetch profile after OAuth2 login', profileError)
        }

        login({
          name: profile?.name || sessionName,
          nickname: profile?.nickname || '',
          school: profile?.university || '',
          department: profile?.major || '',
          desiredJob: profile?.desiredJob || '',
          role: session.role === 'ROLE_ADMIN' ? 'admin' : 'user',
          hasSpec: Boolean(profile?.gpa && profile.gpa > 0),
          provider: 'SOCIAL',
        })

        navigate(session.role === 'ROLE_ADMIN' ? '/admin' : '/mypage/specs', {
          replace: true,
        })
      } catch (error) {
        console.error('Failed to complete OAuth2 login', error)
        clearAuthenticationSession()
        navigate('/login?error=oauth2_failed', { replace: true })
      }
    }

    void completeLogin()
  }, [searchParams, navigate, login, loadFromProfile])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center text-gray-500">로그인 처리 중입니다...</div>
    </div>
  )
}
