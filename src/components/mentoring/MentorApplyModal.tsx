import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Modal from '../ui/Modal'
import { JOB_CATEGORIES } from '../../data/jobCategories'
import { applyToMentoringPost } from '../../api/mentoring'
import { useAuth } from '../../context/AuthContext'

export default function MentorApplyModal({
  postId,
  open,
  onClose,
  onApplied,
}: {
  postId: number
  open: boolean
  onClose: () => void
  onApplied: () => void
}) {
  const { user } = useAuth()
  const [university, setUniversity] = useState('')
  const [major, setMajor] = useState('')
  const [desiredJob, setDesiredJob] = useState(JOB_CATEGORIES[0])
  const [gpa, setGpa] = useState('')
  const [toeicScore, setToeicScore] = useState('')
  const [internCount, setInternCount] = useState('')
  const [activityCount, setActivityCount] = useState('')
  const [awardCount, setAwardCount] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = university.trim().length > 0 && major.trim().length > 0 && message.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    try {
      setSubmitting(true)
      await applyToMentoringPost({
        postId,
        mentorNickname: user?.nickname || user?.name || '익명',
        university: university.trim(),
        major: major.trim(),
        desiredJob,
        gpa: gpa ? Number(gpa) : undefined,
        toeicScore: toeicScore ? Number(toeicScore) : undefined,
        internCount: internCount ? Number(internCount) : undefined,
        activityCount: activityCount ? Number(activityCount) : undefined,
        awardCount: awardCount ? Number(awardCount) : undefined,
        message: message.trim(),
      })
      onApplied()
    } catch (e) {
      console.error(e)
      alert('지원에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidthClassName="max-w-lg">
      <h1 className="text-[19px] font-bold text-ink-900">멘토 스펙 등록 (지원)</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
        간단한 스펙과 멘티에게 전할 메시지를 남겨주세요.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink-900">
            학교 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="예: 서울대학교"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13.5px] outline-none placeholder:text-gray-400 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink-900">
            전공 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            placeholder="예: 컴퓨터공학과"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13.5px] outline-none placeholder:text-gray-400 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1.5 block text-[13px] font-semibold text-ink-900">직무 분야</label>
        <div className="relative">
          <select
            value={desiredJob}
            onChange={(e) => setDesiredJob(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13.5px] text-ink-900 outline-none focus:border-blue-500"
          >
            {JOB_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink-900">학점 (4.5 만점)</label>
          <input
            type="number"
            step="0.01"
            min={0}
            max={4.5}
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink-900">토익</label>
          <input
            type="number"
            min={0}
            max={990}
            value={toeicScore}
            onChange={(e) => setToeicScore(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink-900">인턴 경험</label>
          <input
            type="number"
            min={0}
            value={internCount}
            onChange={(e) => setInternCount(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink-900">대외활동</label>
          <input
            type="number"
            min={0}
            value={activityCount}
            onChange={(e) => setActivityCount(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink-900">수상 경력</label>
          <input
            type="number"
            min={0}
            value={awardCount}
            onChange={(e) => setAwardCount(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1.5 block text-[13px] font-semibold text-ink-900">
          멘티에게 전할 메시지 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="간단한 경력/경험과 도와줄 수 있는 내용을 적어주세요."
          className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13.5px] outline-none placeholder:text-gray-400 focus:border-blue-500"
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
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
          {submitting ? '제출 중...' : '지원하기'}
        </button>
      </div>
    </Modal>
  )
}
