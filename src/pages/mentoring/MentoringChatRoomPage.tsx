import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import ChatBubble from '../../components/mentoring/ChatBubble'
import { useAuth } from '../../context/AuthContext'
import {
  fetchChatMessages,
  fetchChatRoom,
  sendChatMessage,
  type ChatMessage,
  type ChatRoomSummary,
} from '../../api/mentoring'

export default function MentoringChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const { user } = useAuth()
  const myNickname = user?.nickname || user?.name || ''

  const [room, setRoom] = useState<ChatRoomSummary | null | undefined>(undefined)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = Number(roomId)
    Promise.all([fetchChatRoom(id), fetchChatMessages(id)])
      .then(([roomData, messageData]) => {
        setRoom(roomData)
        setMessages(messageData)
      })
      .catch((e) => {
        console.error(e)
        setRoom(null)
      })
  }, [roomId])

  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    // Scroll only the message list itself — never the page — so new
    // messages don't drag the header out of view.
    el.scrollTop = el.scrollHeight
  }, [messages])

  if (room === undefined) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 text-center text-gray-400">
          로딩 중...
        </main>
        <Footer />
      </div>
    )
  }

  if (!room) return <Navigate to="/mentoring/chat" replace />

  const handleSend = async () => {
    if (!draft.trim() || sending) return
    try {
      setSending(true)
      const message = await sendChatMessage(room.id, myNickname, draft.trim())
      setMessages((prev) => [...prev, message])
      setDraft('')
    } catch (e) {
      console.error(e)
      alert('메시지 전송에 실패했습니다.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <Link
          to="/mentoring/chat"
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-gray-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          채팅 목록으로 돌아가기
        </Link>

        <div className="mt-6 flex flex-col rounded-3xl bg-white p-6 shadow-xl sm:p-8">
          <div className="border-b border-gray-100 pb-4">
            <p className="text-[15px] font-bold text-ink-900">{room.counterpartNickname}</p>
            <p className="mt-0.5 text-[12.5px] text-gray-400">{room.postTitle}</p>
          </div>

          <div ref={messagesRef} className="h-[55vh] overflow-y-auto py-5">
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                  isMine={message.senderNickname === myNickname}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
              placeholder="메시지를 입력하세요"
              className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-[13.5px] outline-none placeholder:text-gray-400 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!draft.trim() || sending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200"
              aria-label="보내기"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
