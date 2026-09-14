import { useEffect, useState } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { fetchFeedbacks, updateFeedbackStatus, type FeedbackResponse, type FeedbackStatus } from '../../api/feedback'

const STATUS_OPTIONS: { label: string; value: FeedbackStatus }[] = [
  { label: '접수', value: 'PENDING' },
  { label: '개선 중', value: 'IN_PROGRESS' },
  { label: '완료', value: 'RESOLVED' },
]

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([])
  const [loading, setLoading] = useState(true)

  const loadFeedbacks = async () => {
    try {
      setLoading(true)
      const data = await fetchFeedbacks()
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

  const handleStatusChange = async (id: number, newStatus: FeedbackStatus) => {
    try {
      await updateFeedbackStatus(id, newStatus)
      setFeedbacks(prev =>
        prev.map(fb => (fb.id === id ? { ...fb, status: newStatus } : fb))
      )
    } catch (e) {
      console.error(e)
      alert('상태 변경에 실패했습니다.')
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-[22px] font-bold text-ink-900">피드백 관리</h1>
      <p className="mt-2 text-[14px] text-gray-500">
        사용자들이 남긴 피드백을 확인하고 상태를 변경할 수 있습니다.
      </p>

      {loading ? (
        <div className="mt-8 py-10 text-center text-gray-400">로딩 중...</div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm shadow-black/[0.02]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-[14px]">
              <thead className="border-b border-gray-100 bg-gray-50 text-[13px] font-semibold text-gray-500">
                <tr>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">내용</th>
                  <th className="px-5 py-4">연락처</th>
                  <th className="px-5 py-4">추천 수</th>
                  <th className="px-5 py-4">작성일</th>
                  <th className="px-5 py-4">상태 관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                      등록된 피드백이 없습니다.
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((fb) => (
                    <tr key={fb.id} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-5 py-4 text-gray-500">#{fb.id}</td>
                      <td className="max-w-[300px] px-5 py-4">
                        <div className="max-h-20 overflow-y-auto pr-2 text-ink-900 scrollbar-thin scrollbar-thumb-gray-200">
                          {fb.content}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{fb.contact || '-'}</td>
                      <td className="px-5 py-4 font-medium text-blue-600">{fb.upvotes}</td>
                      <td className="px-5 py-4 text-gray-400">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
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
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-white text-ink-900">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
