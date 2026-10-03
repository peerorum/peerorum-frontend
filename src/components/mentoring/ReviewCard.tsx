import { Star } from 'lucide-react'
import type { MentoringReview } from '../../api/mentoringReview'

export default function ReviewCard({ review }: { review: MentoringReview }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] font-semibold text-gray-500">
          {review.menteeNickname}님이 남긴 후기
        </p>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <Star
              key={value}
              className={`h-3.5 w-3.5 ${value <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
            />
          ))}
        </div>
      </div>
      <p className="mt-1.5 whitespace-pre-line text-[13.5px] leading-relaxed text-ink-900">
        {review.content}
      </p>
      <p className="mt-2 text-[12px] text-gray-400">
        {new Date(review.createdAt).toLocaleDateString()}
      </p>
    </div>
  )
}
