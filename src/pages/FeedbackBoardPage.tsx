import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Megaphone, Lock } from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FeedbackModal from '../components/landing/FeedbackModal'
import { useAuth } from '../context/AuthContext'
import { fetchPublishedFeedbacks, type PublishedFeedback } from '../api/feedback'

export default function FeedbackBoardPage() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [feedbacks, setFeedbacks] = useState<PublishedFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  const loadFeedbacks = async () => {
    try {
      setLoading(true)
      const data = await fetchPublishedFeedbacks()
      setFeedbacks(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeedbacks()
  }, [])

  const handleLeaveFeedbackClick = () => {
    if (isLoggedIn) {
      setFeedbackOpen(true)
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <div className="rounded-3xl bg-white p-8 shadow-xl sm:p-10">
          <div className="text-center">
            <span className="text-[14px] font-semibold text-blue-600">고객지원 · 피드백</span>
            <h1 className="mt-3 text-[28px] font-bold leading-snug text-ink-900">피드백 보드</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-500">
              여러분의 의견으로 만들어진 개선사항을 공지해드려요.
            </p>
            <button
              type="button"
              onClick={handleLeaveFeedbackClick}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700"
            >
              피드백 남기기
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-gray-400">
              <Lock className="h-3.5 w-3.5" />
              모든 피드백은 안전하게 관리됩니다.
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3">
            {loading ? (
              <div className="py-10 text-center text-gray-400">로딩 중...</div>
            ) : feedbacks.length === 0 ? (
              <div className="py-10 text-center text-gray-400">아직 게시된 개선사항이 없어요.</div>
            ) : (
              feedbacks.map((item) => (
                <Link
                  key={item.id}
                  to={`/feedback/${item.id}`}
                  className="flex items-start gap-4 rounded-2xl border border-gray-100 p-5 transition-colors hover:border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] leading-relaxed text-ink-900">
                      {item.boardSummary}
                    </p>
                    <p className="mt-2 text-[12.5px] text-gray-400">
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />

      <FeedbackModal open={feedbackOpen} onClose={() => { setFeedbackOpen(false); loadFeedbacks(); }} />
    </div>
  )
}
