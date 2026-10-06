import { Link } from 'react-router-dom'
import { ArrowRight, Handshake, MessageCircle, Star } from 'lucide-react'

const HIGHLIGHTS = [
  {
    icon: Handshake,
    title: '멘토 지원',
    description: '경험을 나누고 싶다면 질문 글에 바로 지원',
  },
  {
    icon: MessageCircle,
    title: '1:1 채팅',
    description: '매칭되면 일정과 장소를 자유롭게 조율',
  },
  {
    icon: Star,
    title: '후기 신뢰도',
    description: '만남 후기로 다음 멘티의 선택을 도와요',
  },
]

export default function MainCtaSection() {
  return (
    <section className="bg-ink-950 px-6 py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2">
        <div>
          <span className="text-[14px] font-semibold text-blue-400">피어오름 멘토멘티</span>
          <h2 className="mt-3 break-keep text-[32px] font-bold leading-snug text-white">
            고민이 있다면
            <br />
            지금 질문을 올려보세요
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-400">
            먼저 가본 선배의 한마디가 가장 빠른 길잡이가 되기도 해요.
          </p>

          <Link
            to="/mentoring/write"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500"
          >
            질문 글 작성하기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-2xl border border-ink-700 bg-ink-850 p-6"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-700 bg-ink-900 text-blue-400">
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-gray-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
