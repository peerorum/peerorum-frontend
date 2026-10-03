import { useState } from 'react'
import { Star } from 'lucide-react'
import Modal from '../ui/Modal'
import { createMentoringReview } from '../../api/mentoringReview'

export default function ReviewWriteModal({
  postId,
  menteeNickname,
  mentorNickname,
  open,
  onClose,
  onSubmitted,
}: {
  postId: number
  menteeNickname: string
  mentorNickname: string
  open: boolean
  onClose: () => void
  onSubmitted: () => void
}) {
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = content.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    try {
      setSubmitting(true)
      await createMentoringReview({
        postId,
        menteeNickname,
        mentorNickname,
        rating,
        content: content.trim(),
      })
      onSubmitted()
    } catch (e) {
      console.error(e)
      alert('후기 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidthClassName="max-w-lg">
      <h1 className="text-[19px] font-bold text-ink-900">후기 작성</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
        {mentorNickname} 멘토님과의 오프라인 만남은 어떠셨나요? 후기를 남기면 게시글이 마감돼요.
      </p>

      <div className="mt-5 flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value}점`}>
            <Star
              className={`h-7 w-7 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
            />
          </button>
        ))}
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-[13px] font-semibold text-ink-900">
          후기 내용 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="오프라인 멘토링 경험을 자유롭게 남겨주세요."
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-[13.5px] outline-none placeholder:text-gray-400 focus:border-blue-500"
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
          {submitting ? '제출 중...' : '후기 등록하고 마감하기'}
        </button>
      </div>
    </Modal>
  )
}
