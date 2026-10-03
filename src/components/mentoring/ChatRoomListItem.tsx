import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import type { ChatRoomSummary } from '../../api/mentoring'

export default function ChatRoomListItem({ room }: { room: ChatRoomSummary }) {
  return (
    <Link
      to={`/mentoring/chat/${room.id}`}
      className="flex items-start gap-3.5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/[0.02] transition-colors hover:border-gray-200 hover:bg-gray-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <MessageCircle className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[14px] font-bold text-ink-900">{room.counterpartNickname}</p>
          <span className="shrink-0 text-[12px] text-gray-400">
            {new Date(room.lastMessageAt).toLocaleDateString()}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[12.5px] text-gray-400">{room.postTitle}</p>
        <p className="mt-1.5 truncate text-[13.5px] text-gray-600">{room.lastMessage}</p>
      </div>
    </Link>
  )
}
