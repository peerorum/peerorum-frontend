import type { MentoringPostStatus } from '../../api/mentoring'

const STATUS_STYLE: Record<MentoringPostStatus, string> = {
  모집중: 'bg-blue-50 text-blue-600',
  진행중: 'bg-emerald-50 text-emerald-700',
  마감: 'bg-gray-100 text-gray-500',
}

export default function MentoringStatusBadge({ status }: { status: MentoringPostStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${STATUS_STYLE[status]}`}>
      {status}
    </span>
  )
}
