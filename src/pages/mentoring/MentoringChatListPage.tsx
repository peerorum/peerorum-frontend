import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import ChatRoomListItem from '../../components/mentoring/ChatRoomListItem'
import { useAuth } from '../../context/AuthContext'
import { fetchChatRooms, type ChatRoomSummary } from '../../api/mentoring'

export default function MentoringChatListPage() {
  const { user } = useAuth()
  const myNickname = user?.nickname || user?.name || ''
  const [rooms, setRooms] = useState<ChatRoomSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChatRooms(myNickname)
      .then(setRooms)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [myNickname])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <Link
          to="/mentoring"
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-gray-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          멘토멘티 게시판으로 돌아가기
        </Link>

        <div className="mt-6 rounded-3xl bg-white p-8 shadow-xl sm:p-10">
          <span className="text-[14px] font-semibold text-blue-600">멘토멘티 오프라인 게시판</span>
          <h1 className="mt-3 text-[22px] font-bold text-ink-900">채팅</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-gray-500">
            매칭된 멘토/멘티와의 대화를 확인하세요.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {loading ? (
              <div className="py-10 text-center text-gray-400">로딩 중...</div>
            ) : rooms.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm shadow-black/[0.02]">
                <MessageCircle className="h-8 w-8 text-gray-300" />
                <p className="text-[14px] text-gray-400">아직 매칭된 채팅이 없어요.</p>
              </div>
            ) : (
              rooms.map((room) => <ChatRoomListItem key={room.id} room={room} />)
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
