import { useState } from 'react'
import Modal from '../ui/Modal'
import { createFeedback } from '../../api/feedback'

export default function FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const canSubmit = message.trim().length > 0

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return
    try {
      setIsSubmitting(true)
      await createFeedback({ content: message, contact })
      setSubmitted(true)
      setMessage('')
      setContact('')
    } catch (e) {
      console.error(e)
      alert('피드백 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSubmitted(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} maxWidthClassName="max-w-lg">
      {submitted ? (
        <div className="py-4 text-center">
          <h1 className="text-[19px] font-bold text-ink-900">피드백이 접수되었어요!</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-gray-500">
            소중한 의견 감사합니다. 검토 후 빠르게 반영할게요.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700"
          >
            확인
          </button>
        </div>
      ) : (
        <div>
          <h1 className="text-[19px] font-bold text-ink-900">피드백 남기기</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
            서비스 개선 방법에 대해 피드백을 남겨주시면 빠르게 반영하겠습니다.
          </p>

          <div className="mt-5">
            <label className="mb-1.5 block text-[13px] font-semibold text-ink-900">
              문의사항 (필수) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="문의사항, 제안사항 또는 문제점을 자세히 설명해주세요..."
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-[13.5px] outline-none placeholder:text-gray-400 focus:border-blue-500"
            />
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-[13px] font-semibold text-ink-900">
              연락처 정보
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="카카오톡, 인스타그램 아이디, 이메일 등 답장드릴 수 있는 연락처를 입력해주세요."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[13.5px] outline-none placeholder:text-gray-400 focus:border-blue-500"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-gray-500 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="button"
              disabled={!canSubmit || isSubmitting}
              onClick={handleSubmit}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              {isSubmitting ? '제출 중...' : '피드백 제출'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
