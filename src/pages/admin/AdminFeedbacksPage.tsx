import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout'
import {
  fetchAdminFeedbacks,
  updateFeedbackStatus,
  answerFeedback,
  publishFeedback,
  unpublishFeedback,
  type AdminFeedback,
  type FeedbackStatus,
} from '../../api/feedback'

const STATUS_OPTIONS: { label: string; value: FeedbackStatus }[] = [
  { label: '접수', value: 'PENDING' },
  { label: '개선 중', value: 'IN_PROGRESS' },
  { label: '완료', value: 'RESOLVED' },
]

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [answerDrafts, setAnswerDrafts] = useState<Record<number, string>>({})
  const [summaryDrafts, setSummaryDrafts] = useState<Record<number, string>>({})
  const [savingId, setSavingId] = useState<number | null>(null)
  const [savedFlash, setSavedFlash] = useState<{ id: number; type: 'answer' | 'publish' | 'unpublish' } | null>(null)
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flashSaved = (id: number, type: 'answer' | 'publish' | 'unpublish') => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    setSavedFlash({ id, type })
    flashTimerRef.current = setTimeout(() => setSavedFlash(null), 2000)
  }

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    }
  }, [])

  const loadFeedbacks = async () => {
    try {
      setLoading(true)
      const data = await fetchAdminFeedbacks()
      setFeedbacks(data)
      setAnswerDrafts(Object.fromEntries(data.map((fb) => [fb.id, fb.answer ?? ''])))
      setSummaryDrafts(Object.fromEntries(data.map((fb) => [fb.id, fb.boardSummary ?? ''])))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeedbacks()
  }, [])

  const handleStatusChange = async (id: number, newStatus: FeedbackStatus) => {
    try {
      await updateFeedbackStatus(id, newStatus)
      setFeedbacks((prev) => prev.map((fb) => (fb.id === id ? { ...fb, status: newStatus } : fb)))
    } catch (e) {
      console.error(e)
      alert('상태 변경에 실패했습니다.')
    }
  }

  const handleSaveAnswer = async (id: number) => {
    try {
      setSavingId(id)
      const answer = answerDrafts[id] ?? ''
      await answerFeedback(id, answer)
      setFeedbacks((prev) =>
        prev.map((fb) => (fb.id === id ? { ...fb, answer, answeredAt: new Date().toISOString() } : fb)),
      )
      flashSaved(id, 'answer')
    } catch (e) {
      console.error(e)
      alert('답변 저장에 실패했습니다.')
    } finally {
      setSavingId(null)
    }
  }

  const handlePublish = async (id: number) => {
    try {
      setSavingId(id)
      const summary = summaryDrafts[id] ?? ''
      if (!summary.trim()) {
        alert('공개 요약을 입력해주세요.')
        return
      }
      await publishFeedback(id, summary)
      setFeedbacks((prev) =>
        prev.map((fb) => (fb.id === id ? { ...fb, boardSummary: summary, publishedAt: new Date().toISOString() } : fb)),
      )
      flashSaved(id, 'publish')
    } catch (e) {
      console.error(e)
      alert('게시에 실패했습니다.')
    } finally {
      setSavingId(null)
    }
  }

  const handleUnpublish = async (id: number) => {
    try {
      setSavingId(id)
      await unpublishFeedback(id)
      setFeedbacks((prev) => prev.map((fb) => (fb.id === id ? { ...fb, boardSummary: null, publishedAt: null } : fb)))
      setSummaryDrafts((prev) => ({ ...prev, [id]: '' }))
      flashSaved(id, 'unpublish')
    } catch (e) {
      console.error(e)
      alert('게시 취소에 실패했습니다.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-[22px] font-bold text-ink-900">피드백 관리</h1>
      <p className="mt-2 text-[14px] text-gray-500">
        사용자들이 남긴 피드백에 답변하고, 완료된 개선사항은 요약을 작성해 피드백 보드에 게시할 수 있습니다.
      </p>

      {loading ? (
        <div className="mt-8 py-10 text-center text-gray-400">로딩 중...</div>
      ) : feedbacks.length === 0 ? (
        <div className="mt-6 rounded-xl border border-gray-100 bg-white py-10 text-center text-gray-400 shadow-sm shadow-black/[0.02]">
          등록된 피드백이 없습니다.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/[0.02]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[13px] text-gray-500">
                  <span className="font-semibold text-ink-900">#{fb.id}</span>
                  <span>{fb.authorNickname ?? '익명'}</span>
                  <span className="text-gray-300">·</span>
                  <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                </div>
                <select
                  value={fb.status}
                  onChange={(e) => handleStatusChange(fb.id, e.target.value as FeedbackStatus)}
                  className={`rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] font-medium outline-none focus:border-blue-500 ${
                    fb.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-700'
                      : fb.status === 'IN_PROGRESS'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white text-ink-900">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <p className="mt-3 whitespace-pre-line text-[14px] text-ink-900">{fb.content}</p>
              {fb.contact && <p className="mt-1 text-[12.5px] text-gray-400">연락처: {fb.contact}</p>}

              <div className="mt-4">
                <label className="mb-1.5 block text-[12.5px] font-semibold text-gray-500">
                  작성자에게 보낼 답변
                </label>
                <textarea
                  value={answerDrafts[fb.id] ?? ''}
                  onChange={(e) => setAnswerDrafts((prev) => ({ ...prev, [fb.id]: e.target.value }))}
                  rows={2}
                  placeholder="답변을 입력하세요..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-[13.5px] outline-none placeholder:text-gray-400 focus:border-blue-500"
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveAnswer(fb.id)}
                    disabled={savingId === fb.id}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
                  >
                    {savingId === fb.id ? '저장 중...' : '답변 저장'}
                  </button>
                  {savedFlash?.id === fb.id && savedFlash.type === 'answer' && (
                    <span className="flex items-center gap-1 text-[12.5px] font-semibold text-emerald-600">
                      <Check className="h-3.5 w-3.5" />
                      저장 완료
                    </span>
                  )}
                </div>
              </div>

              {fb.status === 'RESOLVED' && (
                <div className="mt-4 rounded-xl bg-blue-50/50 p-4">
                  <label className="mb-1.5 block text-[12.5px] font-semibold text-blue-700">
                    피드백 보드 공개 요약 {fb.boardSummary && '(게시됨)'}
                  </label>
                  <textarea
                    value={summaryDrafts[fb.id] ?? ''}
                    onChange={(e) => setSummaryDrafts((prev) => ({ ...prev, [fb.id]: e.target.value }))}
                    rows={2}
                    placeholder="공개 게시판에 올라갈 개선사항 요약을 작성하세요..."
                    className="w-full resize-none rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-[13.5px] outline-none placeholder:text-gray-400 focus:border-blue-500"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePublish(fb.id)}
                      disabled={savingId === fb.id}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                      게시하기
                    </button>
                    {fb.boardSummary && (
                      <button
                        type="button"
                        onClick={() => handleUnpublish(fb.id)}
                        disabled={savingId === fb.id}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-[12.5px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                      >
                        게시 취소
                      </button>
                    )}
                    {savedFlash?.id === fb.id && (savedFlash.type === 'publish' || savedFlash.type === 'unpublish') && (
                      <span className="flex items-center gap-1 text-[12.5px] font-semibold text-emerald-600">
                        <Check className="h-3.5 w-3.5" />
                        {savedFlash.type === 'publish' ? '게시 완료' : '게시 취소됨'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
