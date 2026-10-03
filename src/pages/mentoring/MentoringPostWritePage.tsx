import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { useAuth } from '../../context/AuthContext'
import { JOB_CATEGORIES } from '../../data/jobCategories'
import { createMentoringPost } from '../../api/mentoring'

export default function MentoringPostWritePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(JOB_CATEGORIES[0])
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = title.trim().length > 0 && content.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    try {
      setSubmitting(true)
      const post = await createMentoringPost({
        title: title.trim(),
        content: content.trim(),
        category,
        authorNickname: user?.nickname || user?.name || '익명',
      })
      navigate(`/mentoring/${post.id}`)
    } catch (e) {
      console.error(e)
      alert('글 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <div className="rounded-3xl bg-white p-8 shadow-xl sm:p-10">
          <span className="text-[14px] font-semibold text-blue-600">멘토멘티 오프라인 게시판</span>
          <h1 className="mt-3 text-[22px] font-bold text-ink-900">질문 글쓰기</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-gray-500">
            궁금한 점을 구체적으로 적어주시면 더 잘 맞는 멘토를 찾을 수 있어요.
          </p>

          <div className="mt-6">
            <label className="mb-1.5 block text-[13px] font-semibold text-ink-900">분야</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 text-[13.5px] text-ink-900 outline-none focus:border-blue-500"
              >
                {JOB_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-[13px] font-semibold text-ink-900">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: IT 대기업 서류 전형, 선배님의 조언이 필요해요"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[13.5px] outline-none placeholder:text-gray-400 focus:border-blue-500"
            />
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-[13px] font-semibold text-ink-900">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="어떤 고민이 있는지, 어떤 조언이 필요한지 자세히 적어주세요."
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-[13.5px] outline-none placeholder:text-gray-400 focus:border-blue-500"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/mentoring')}
              className="rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-gray-500 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              {submitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
