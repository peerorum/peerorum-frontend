import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center">
        <p className="text-[15px] font-bold text-blue-600">404</p>
        <h1 className="mt-3 text-[22px] font-bold text-ink-900">페이지를 찾을 수 없어요</h1>
        <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-gray-500">
          요청하신 페이지가 존재하지 않거나 주소가 변경되었어요. 주소를 다시 확인해주세요.
        </p>

        <Link
          to="/"
          className="mt-8 rounded-xl bg-blue-600 px-6 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-blue-700"
        >
          홈으로 돌아가기
        </Link>
      </main>

      <Footer />
    </div>
  )
}
