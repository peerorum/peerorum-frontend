import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Heart, Lock, Megaphone } from 'lucide-react'
import FeedbackModal from './FeedbackModal'
import { useAuth } from '../../context/AuthContext'
import { fetchPublishedFeedbacks, type PublishedFeedback } from '../../api/feedback'

const PREVIEW_COUNT = 3

export default function FeedbackSection() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbacks, setFeedbacks] = useState<PublishedFeedback[]>([])

  useEffect(() => {
    fetchPublishedFeedbacks()
      .then((data) => setFeedbacks(data.slice(0, PREVIEW_COUNT)))
      .catch((e) => console.error(e))
  }, [])

  const handleLeaveFeedbackClick = () => {
    if (isLoggedIn) {
      setFeedbackOpen(true)
    } else {
      navigate('/login')
    }
  }

  return (
    <section className="bg-gray-50 px-6 py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2">
        <div>
          <span className="text-[14px] font-semibold text-blue-600">고객지원 · 피드백</span>
          <h2 className="mt-3 text-[30px] font-bold leading-snug text-ink-900">
            당신의 <span className="text-blue-600">의견</span>이
            <br />
            피어오름을 만듭니다.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-500">
            사용자의 피드백을 바탕으로
            <br />더 좋은 서비스를 만들어가고 있어요.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleLeaveFeedbackClick}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700"
            >
              피드백 남기기
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex items-center gap-1.5 text-[13px] text-gray-400">
            <Lock className="h-3.5 w-3.5" />
            모든 피드백은 안전하게 관리됩니다.
          </div>
        </div>

        <div className="relative block">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-black/[0.03]">
            <div className="mb-4 flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-[16px] font-bold text-ink-900">피드백 보드</h3>
                <p className="mt-1 text-[13px] text-gray-400">
                  여러분의 의견을 확인하고 서비스에 반영하고 있어요.
                </p>
              </div>
              <Link
                to="/feedback"
                className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[13px] font-semibold text-blue-600 hover:text-blue-700"
              >
                전체보기
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {feedbacks.length === 0 ? (
                <p className="rounded-xl border border-gray-100 p-4 text-center text-[13px] text-gray-400">
                  아직 게시된 개선사항이 없어요.
                </p>
              ) : (
                feedbacks.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl border border-gray-100 p-3.5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Megaphone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-900">
                        {item.boardSummary}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="absolute -right-4 -top-6 hidden w-52 items-start gap-2 rounded-2xl bg-white p-3.5 shadow-xl md:flex">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Heart className="h-3.5 w-3.5 fill-current" />
            </span>
            <p className="text-[12px] font-medium leading-snug text-ink-900">
              여러분의 피드백이 피어오름의 성장을 만듭니다!
            </p>
          </div>
        </div>
      </div>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </section>
  )
}
