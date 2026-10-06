import { ShieldCheck } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    title: '질문 등록',
    description: '멘티가 궁금한 점과 원하는 분야를 게시글로 올려요.',
  },
  {
    number: '02',
    title: '멘토 지원',
    description: '관심 있는 멘토가 본인의 스펙과 메시지를 남겨 지원해요.',
  },
  {
    number: '03',
    title: '멘토 선택',
    description: '멘티가 지원자들의 스펙을 비교하고 멘토 한 명을 선택해요.',
  },
  {
    number: '04',
    title: '채팅 & 오프라인 만남',
    description: '매칭되면 1:1 채팅으로 일정을 맞추고 직접 만나요.',
  },
  {
    number: '05',
    title: '후기 작성',
    description: '만남 후 후기를 남기면 게시글이 마감되고 다음 멘티를 도울 수 있어요.',
  },
]

export default function MainFlowSection() {
  return (
    <section className="bg-ink-950 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="text-[14px] font-semibold text-blue-400">How it works</span>
          <h2 className="mt-3 text-[28px] font-bold leading-snug text-white">
            질문부터 오프라인 만남까지
            <br />
            다섯 단계로 진행돼요.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-5">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center">
              <span className="text-[14px] font-bold text-blue-400">{step.number}</span>
              <h3 className="mt-4 text-[16px] font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex items-center justify-center gap-3 rounded-2xl border border-ink-700 bg-ink-850 px-6 py-5">
          <ShieldCheck className="h-5 w-5 shrink-0 text-blue-400" />
          <p className="text-[13.5px] text-gray-300">
            <span className="font-semibold text-white">안전한 만남</span>
            {'  '}매칭 전에는 연락처가 공개되지 않고, 채팅은 매칭된 두 사람에게만 열려요.
          </p>
        </div>
      </div>
    </section>
  )
}
