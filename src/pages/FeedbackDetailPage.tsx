import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Megaphone } from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { fetchPublishedFeedbacks, type PublishedFeedback } from '../api/feedback'

export default function FeedbackDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<PublishedFeedback | null | undefined>(undefined)

  useEffect(() => {
    fetchPublishedFeedbacks()
      .then((data) => setItem(data.find((f) => f.id === Number(id)) ?? null))
      .catch(() => setItem(null))
  }, [id])

  if (item === undefined) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 text-center text-gray-400">
          로딩 중...
        </main>
        <Footer />
      </div>
    )
  }

  if (!item) return <Navigate to="/feedback" replace />

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <Link
          to="/feedback"
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-gray-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          피드백 보드로 돌아가기
        </Link>

        <div className="mt-6 rounded-3xl bg-white p-8 shadow-xl sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Megaphone className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[12.5px] text-gray-400">
                {new Date(item.publishedAt).toLocaleDateString()}
              </span>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink-900">
                {item.boardSummary}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
