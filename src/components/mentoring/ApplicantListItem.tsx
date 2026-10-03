import type { MentorApplication } from '../../api/mentoring'

export default function ApplicantListItem({
  application,
  onSelect,
  selecting,
}: {
  application: MentorApplication
  onSelect: () => void
  selecting: boolean
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/[0.02]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[14.5px] font-bold text-ink-900">{application.mentorNickname}</p>
          <p className="text-[12.5px] text-gray-400">
            {application.university} · {application.major} · {application.desiredJob}
          </p>
        </div>
        <button
          type="button"
          onClick={onSelect}
          disabled={selecting}
          className="rounded-full bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          {selecting ? '매칭 중...' : '선택하기'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[12.5px] text-gray-500">
        {application.gpa !== undefined && <span>학점 {application.gpa.toFixed(2)}</span>}
        {application.toeicScore !== undefined && <span>토익 {application.toeicScore}</span>}
        {application.internCount !== undefined && <span>인턴 {application.internCount}회</span>}
        {application.activityCount !== undefined && <span>대외활동 {application.activityCount}개</span>}
        {application.awardCount !== undefined && <span>수상 {application.awardCount}회</span>}
      </div>

      <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-ink-900">
        {application.message}
      </p>
    </div>
  )
}
