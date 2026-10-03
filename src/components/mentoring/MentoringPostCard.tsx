import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import type { MentoringPost } from '../../api/mentoring'
import MentoringStatusBadge from './MentoringStatusBadge'

export default function MentoringPostCard({ post }: { post: MentoringPost }) {
  return (
    <Link
      to={`/mentoring/${post.id}`}
      className="flex flex-col gap-2.5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/[0.02] transition-colors hover:border-gray-200 hover:bg-gray-50"
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11.5px] font-semibold text-gray-500">
          {post.category}
        </span>
        <MentoringStatusBadge status={post.status} />
      </div>

      <p className="text-[15px] font-bold leading-snug text-ink-900">{post.title}</p>
      <p className="line-clamp-2 text-[13px] leading-relaxed text-gray-500">{post.content}</p>

      <div className="mt-1 flex items-center justify-between text-[12.5px] text-gray-400">
        <span>{post.authorNickname}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            지원 {post.applicantCount}
          </span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  )
}
