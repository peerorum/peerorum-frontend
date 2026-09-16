import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from '../ui/Logo'
import ProfileMenu from './ProfileMenu'
import { useAuth } from '../../context/AuthContext'
import { scrollToSection } from '../../utils/scroll'

const NAV_ITEMS = [
  { label: '스펙 비교', href: '/compare' },
  { label: '서비스 소개', href: '/#service-intro' },
  { label: '이용 방법', href: '/#how-to-use' },
  { label: '고객지원', href: '/#support' },
  { label: '피드백', href: '/feedback' },
]

const SECTION_IDS = ['service-intro', 'how-to-use', 'support']

export default function Header() {
  const { isLoggedIn } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection(null)
      return
    }

    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveSection(visible[0].target.id)
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [location.pathname])

  const handleSectionClick = (e: React.MouseEvent, href: string) => {
    const id = href.split('#')[1]
    if (location.pathname === '/') {
      e.preventDefault()
      scrollToSection(id)
    } else {
      e.preventDefault()
      navigate(`/#${id}`)
    }
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" onClick={handleLogoClick} className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_ITEMS.map((item) => {
            const sectionId = item.href.includes('#') ? item.href.split('#')[1] : null
            const isActive =
              sectionId !== null
                ? activeSection === sectionId
                : location.pathname === item.href

            const linkClassName = `text-[15px] font-medium transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-600 hover:text-ink-900'
            }`

            if (sectionId === null) {
              return (
                <Link key={item.label} to={item.href} className={linkClassName}>
                  {item.label}
                </Link>
              )
            }

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleSectionClick(e, item.href)}
                className={linkClassName}
              >
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex h-9 items-center gap-5">
            {isLoggedIn ? (
              <ProfileMenu />
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[14px] font-medium text-gray-600 hover:text-ink-900"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-blue-600 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center text-gray-600 md:hidden"
            aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="flex flex-col gap-1 border-t border-black/5 bg-white px-6 py-4 md:hidden">
          {NAV_ITEMS.map((item) => {
            const sectionId = item.href.includes('#') ? item.href.split('#')[1] : null
            const isActive =
              sectionId !== null
                ? activeSection === sectionId
                : location.pathname === item.href

            const linkClassName = `rounded-lg px-2 py-2.5 text-[15px] font-medium transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-600 hover:text-ink-900'
            }`

            if (sectionId === null) {
              return (
                <Link key={item.label} to={item.href} className={linkClassName}>
                  {item.label}
                </Link>
              )
            }

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleSectionClick(e, item.href)}
                className={linkClassName}
              >
                {item.label}
              </a>
            )
          })}
        </nav>
      )}
    </header>
  )
}
