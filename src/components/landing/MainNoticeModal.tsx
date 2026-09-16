import { useEffect, useState } from 'react'
import mainNoticeImage from '../../assets/images/main-notice.png'

const NOTICE_HIDE_UNTIL_KEY = 'mainNoticeHiddenUntil'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

function isCurrentlyHidden() {
  try {
    const until = localStorage.getItem(NOTICE_HIDE_UNTIL_KEY)
    return until !== null && Date.now() < Number(until)
  } catch {
    return false
  }
}

export default function MainNoticeModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isCurrentlyHidden()) setOpen(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const hideForOneDay = () => {
    try {
      localStorage.setItem(NOTICE_HIDE_UNTIL_KEY, String(Date.now() + ONE_DAY_MS))
    } catch {
      // localStorage 접근이 막혀 있어도 팝업은 그냥 닫히도록 둔다.
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-[380px] overflow-hidden rounded-[28px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={mainNoticeImage} alt="안심하고 이용해주세요 안내" className="block w-full" />
        <div className="flex items-center justify-center divide-x divide-gray-100 border-t border-gray-100 text-[14px] font-semibold">
          <button
            type="button"
            onClick={hideForOneDay}
            className="flex-1 py-4 text-gray-500 hover:bg-gray-50"
          >
            1일간 보지 않기
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 py-4 text-blue-600 hover:bg-blue-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
