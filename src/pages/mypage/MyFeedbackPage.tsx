import { useEffect, useState } from 'react'
import { MessageSquare, Megaphone, Plus } from 'lucide-react'
import MyPageLayout from '../../layouts/MyPageLayout'
import FeedbackModal from '../../components/landing/FeedbackModal'
import { fetchMyFeedbacks, type MyFeedback, type FeedbackStatus } from '../../api/feedback'

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  PENDING: '접수',
  IN_PROGRESS: '개선 중',
  RESOLVED: '완료',
}

const STATUS_STYLE: Record<FeedbackStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  RESOLVED: 'bg-emerald-50 text-emerald-700',
}

export default function MyFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<MyFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  const loadFeedbacks = async () => {
    try {
      setLoading(true)
      const data = await fetchMyFeedbacks()
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

  return (
    <MyPageLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-ink-900">내 피드백</h1>
          <p className="mt-2 text-[14px] text-gray-500">
            내가 남긴 피드백과 관리자 답변을 확인할 수 있어요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFeedbackOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          피드백 남기기
        </button>
      </div>

      {loading ? (
        <div className="mt-8 py-10 text-center text-gray-400">로딩 중...</div>
      ) : feedbacks.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm shadow-black/[0.02]">
          <MessageSquare className="h-8 w-8 text-gray-300" />
          <p className="text-[14px] text-gray-400">아직 남긴 피드백이 없어요.</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/[0.02]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${STATUS_STYLE[fb.status]}`}
                >
                  {STATUS_LABEL[fb.status]}
                </span>
                <span className="text-[12.5px] text-gray-400">
                  {new Date(fb.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-ink-900">
                {fb.content}
              </p>

              {fb.answer ? (
                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <p className="text-[12.5px] font-semibold text-gray-500">관리자 답변</p>
                  <p className="mt-1.5 whitespace-pre-line text-[13.5px] leading-relaxed text-ink-900">
                    {fb.answer}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-[13px] text-gray-400">아직 답변 대기 중이에요.</p>
              )}

              {fb.boardSummary && (
                <div className="mt-3 flex items-center gap-1.5 text-[12.5px] font-medium text-blue-600">
                  <Megaphone className="h-3.5 w-3.5" />
                  피드백 보드에 개선사항으로 게시되었어요.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <FeedbackModal open={feedbackOpen} onClose={() => { setFeedbackOpen(false); loadFeedbacks(); }} />
    </MyPageLayout>
  )
}
