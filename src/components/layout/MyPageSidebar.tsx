import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FileText, LogOut, MessageSquare, Settings, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const PRIMARY_ITEMS = [
  { label: '내 스펙', to: '/mypage/specs', icon: FileText },
  { label: '인증 현황', to: '/mypage/verification', icon: ShieldCheck },
  { label: '내 피드백', to: '/mypage/feedback', icon: MessageSquare },
]

const SECONDARY_ITEMS = [{ label: '계정 설정', to: '/mypage/settings/account', icon: Settings }]

export default function MyPageSidebar({ footer }: { footer?: ReactNode }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-1 border-r border-gray-100 px-3 py-8 md:flex">
      <p className="px-3 pb-2 text-[13px] font-semibold text-gray-400">마이페이지</p>
      {PRIMARY_ITEMS.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
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

      <div className="mt-4 border-t border-gray-100 pt-4">
        {SECONDARY_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] font-medium text-gray-500 hover:bg-gray-50"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/')
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium text-gray-500 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </div>

      {footer && <div className="mt-auto pt-6">{footer}</div>}
    </aside>
  )
}
