import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, ChevronUp, Lock } from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FeedbackModal from '../components/landing/FeedbackModal'
import { FEEDBACK_STATUS_STYLE } from '../data/mockFeedback'
import { fetchFeedbacks, upvoteFeedback, type FeedbackResponse } from '../api/feedback'

const TABS = ['전체', '개선 예정', '개선 중', '완료']
const STATUS_MAP: Record<string, any> = { 'PENDING': '개선 예정', 'IN_PROGRESS': '개선 중', 'RESOLVED': '완료' }
const PAGE_SIZE = 7
const ROW_HEIGHT = 80
const ROW_GAP = 12
const LIST_HEIGHT = PAGE_SIZE * ROW_HEIGHT + (PAGE_SIZE - 1) * ROW_GAP

export default function FeedbackBoardPage() {
  const [activeTab, setActiveTab] = useState<string>('전체')
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([])
  const loadFeedbacks = async () => {
    try {
      const data = await fetchFeedbacks();
      setFeedbacks(data);
    } catch (e) { console.error(e); }
  }
  useEffect(() => { loadFeedbacks(); }, [])
  const [page, setPage] = useState(1)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [upvoted, setUpvoted] = useState<Set<number>>(new Set())

  const selectTab = (tab: string) => {
    setActiveTab(tab)
    setPage(1)
  }

  const toggleUpvote = async (id: number) => {
    if (upvoted.has(id)) return;
    try {
      await upvoteFeedback(id);
      setUpvoted(prev => { const next = new Set(prev); next.add(id); return next; });
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, upvotes: f.upvotes + 1 } : f));
    } catch(e) {}
  }

  const filtered = feedbacks.filter((item) => activeTab === '전체' || STATUS_MAP[item.status] === activeTab)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <div className="rounded-3xl bg-white p-8 shadow-xl sm:p-10">
          <div className="text-center">
            <span className="text-[14px] font-semibold text-blue-600">고객지원 · 피드백</span>
            <h1 className="mt-3 text-[28px] font-bold leading-snug text-ink-900">피드백 보드</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-500">
              여러분의 의견을 확인하고 서비스에 반영하고 있어요.
            </p>
            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700"
            >
              피드백 남기기
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-gray-400">
              <Lock className="h-3.5 w-3.5" />
              모든 피드백은 익명으로 안전하게 관리됩니다.
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {TABS.map((tab) => {
              const count =
                tab === '전체'
                  ? feedbacks.length
                  : feedbacks.filter((f) => STATUS_MAP[f.status] === tab).length
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => selectTab(tab)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                      activeTab === tab ? 'bg-white/20' : 'bg-white text-gray-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* fixed height keeps the footer from shifting when a page has fewer than PAGE_SIZE items */}
          <div className="mt-8 flex flex-col gap-3 overflow-hidden" style={{ height: LIST_HEIGHT }}>
            {pageItems.map((item) => {
              const isUpvoted = upvoted.has(item.id)
              const statusStr = STATUS_MAP[item.status] || '개선 예정'
              return (
                <Link
                  key={item.id}
                  to={`/feedback/${item.id}`}
                  className="flex h-20 shrink-0 items-center gap-4 rounded-2xl border border-gray-100 px-4 transition-colors hover:border-gray-200 hover:bg-gray-50"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleUpvote(item.id)
                    }}
                    className={`flex w-12 shrink-0 flex-col items-center gap-0.5 rounded-xl border py-2 transition-colors ${
                      isUpvoted
                        ? 'border-blue-200 bg-blue-50 text-blue-600'
                        : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronUp className="h-4 w-4" />
                    <span className="text-[12.5px] font-bold">
                      {item.upvotes + (isUpvoted ? 1 : 0)}
                    </span>
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-semibold text-ink-900">
                      {item.content.substring(0, 30)}{item.content.length > 30 ? "..." : ""}
                    </p>
                    <p className="mt-1 truncate text-[13px] leading-relaxed text-gray-500">
                      {item.content}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${FEEDBACK_STATUS_STYLE[statusStr as keyof typeof FEEDBACK_STATUS_STYLE] || FEEDBACK_STATUS_STYLE['개선 예정']}`}
                  >
                    {statusStr}
                  </span>
                </Link>
              )
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-semibold transition-colors ${
                  p === currentPage ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      <Footer />

      <FeedbackModal open={feedbackOpen} onClose={() => { setFeedbackOpen(false); loadFeedbacks(); }} />
    </div>
  )
}
