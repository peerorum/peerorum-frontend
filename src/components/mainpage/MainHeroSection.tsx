import { Link } from 'react-router-dom'
import { ArrowRight, Lock, MessageCircle } from 'lucide-react'
import penguinRide from '../../assets/images/penguin-ride.svg'

export default function MainHeroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-blue-50 via-blue-50/60 to-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <span className="mb-5 inline-block text-[14px] font-semibold text-blue-600">
            멘토멘티 오프라인 게시판
          </span>
          <h1 className="break-keep text-[36px] font-bold leading-tight tracking-tight text-ink-900 md:text-[44px]">
            궁금한 질문을 올리면
            <br />
            <span className="text-blue-600">선배 멘토</span>가 직접
            <br />
            만나 답해드려요
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-gray-500">
            취업 준비, 직무 고민, 학교생활까지.
            <br />
            지원한 멘토의 스펙을 보고 마음에 드는 멘토를 골라 오프라인으로 만나보세요.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/mentoring"
              className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700"
            >
              게시판 둘러보기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/mentoring/write"
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3.5 text-[15px] font-semibold text-ink-900 transition-colors hover:bg-gray-50"
            >
              <MessageCircle className="h-4 w-4" />
              질문 글 작성하기
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-1.5 text-[13px] text-gray-400">
            <Lock className="h-3.5 w-3.5" />
            멘토와 멘티는 매칭 전까지 개인 연락처를 주고받지 않아요.
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <img
            src={penguinRide}
            alt="정장에 선글라스를 쓴 피어오름 펭귄이 차 문을 열고 손을 내미는 모습"
            width={640}
            height={480}
            className="w-full rounded-[28px] shadow-2xl shadow-blue-600/15"
          />
          <p className="absolute bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/75 px-2.5 py-1 text-[12px] font-bold text-white sm:bottom-5 sm:rounded-lg sm:px-4 sm:py-2 sm:text-[18px]">
            설명할 시간이 없어 어서 타!
          </p>
        </div>
      </div>
    </section>
  )
}
