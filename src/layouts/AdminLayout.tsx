import type { ComponentType, ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Activity,
  Ban,
  BarChart3,
  Briefcase,
  CreditCard,
  Home,
  LogOut,
  Megaphone,
  MessageSquare,
  PieChart,
  Server,
  Settings,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/ui/Logo'

interface NavItem {
  label: string
  to: string
  icon: ComponentType<{ className?: string }>
}

const NAV_GROUPS: { label: string | null; items: NavItem[] }[] = [
  { label: null, items: [{ label: '대시보드', to: '/admin', icon: Home }] },
  {
    label: '사용자 관리',
    items: [
      { label: '사용자 목록', to: '/admin/users', icon: Users },
      { label: '사용자 인증', to: '/admin/verifications', icon: ShieldCheck },
      { label: '정지/탈퇴 관리', to: '/admin/suspensions', icon: Ban },
    ],
  },
  {
    label: '콘텐츠 관리',
    items: [
      { label: '스펙 카드 관리', to: '/admin/spec-cards', icon: CreditCard },
      { label: '공지사항 관리', to: '/admin/notices', icon: Megaphone },
      { label: '피드백 관리', to: '/admin/feedbacks', icon: MessageSquare },
    ],
  },
  {
    label: '통계/분석',
    items: [
      { label: '서비스 통계', to: '/admin/stats', icon: BarChart3 },
      { label: '사용자 분석', to: '/admin/analytics', icon: PieChart },
      { label: '활동 로그', to: '/admin/activity-log', icon: Activity },
    ],
  },
  {
    label: '서비스 관리',
    items: [
      { label: '설정 관리', to: '/admin/settings', icon: Settings },
      { label: '사원/정책 관리', to: '/admin/policies', icon: Briefcase },
      { label: '시스템 관리', to: '/admin/system', icon: Server },
    ],
  },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-ink-900">
      <aside className="flex w-60 shrink-0 flex-col border-r border-gray-100 bg-white px-4 py-6">
        <Link to="/" className="flex items-center gap-2 px-2">
          <Logo className="h-6" />
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
            관리자
          </span>
        </Link>

        <nav className="mt-8 flex flex-1 flex-col gap-6 overflow-y-auto">
          {NAV_GROUPS.map((group, index) => (
            <div key={group.label ?? `group-${index}`}>
              {group.label && (
                <p className="px-3 pb-2 text-[12px] font-semibold text-gray-400">{group.label}</p>
              )}
              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors ${
                        isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] font-medium text-gray-500 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-end gap-5 border-b border-gray-100 bg-white px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <User className="h-4 w-4" />
            </span>
            <div className="text-[13px] leading-tight">
              <p className="font-semibold text-ink-900">관리자</p>
              <p className="text-gray-400">admin@peeroreum.com</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  )
}
