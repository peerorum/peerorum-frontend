import type { ChatMessage } from '../../api/mentoring'

export default function ChatBubble({ message, isMine }: { message: ChatMessage; isMine: boolean }) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[75%] flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        {!isMine && <span className="mb-1 text-[12px] text-gray-400">{message.senderNickname}</span>}
        <div
          className={`rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${
            isMine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-ink-900'
          }`}
        >
          {message.content}
        </div>
        <span className="mt-1 text-[11px] text-gray-400">
          {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}
