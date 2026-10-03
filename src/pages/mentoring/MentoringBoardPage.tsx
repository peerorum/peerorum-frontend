import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Plus, Users2 } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import MentoringPostCard from '../../components/mentoring/MentoringPostCard'
import { useAuth } from '../../context/AuthContext'
import { JOB_CATEGORIES } from '../../data/jobCategories'
import { fetchMentoringPosts, type MentoringPost } from '../../api/mentoring'

export default function MentoringBoardPage() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<MentoringPost[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchMentoringPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleWriteClick = () => {
    navigate(isLoggedIn ? '/mentoring/write' : '/login')
  }

  const handleChatClick = () => {
    navigate(isLoggedIn ? '/mentoring/chat' : '/login')
  }

  const filteredPosts = category ? posts.filter((p) => p.category === category) : posts

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <div className="rounded-3xl bg-white p-8 shadow-xl sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[14px] font-semibold text-blue-600">멘토멘티 오프라인 게시판</span>
              <h1 className="mt-3 text-[26px] font-bold leading-snug text-ink-900">
                궁금한 질문을 올리고
                <br />
                선배 멘토와 오프라인에서 만나보세요
              </h1>
              <p className="mt-3 flex items-center gap-1.5 text-[14px] leading-relaxed text-gray-500">
                <Users2 className="h-4 w-4" />
                멘토가 스펙을 등록(지원)하면, 마음에 드는 멘토를 선택해 매칭할 수 있어요.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleChatClick}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 px-5 py-3 text-[14px] font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                <MessageCircle className="h-4 w-4" />
                채팅
              </button>
              <button
                type="button"
                onClick={handleWriteClick}
                className="flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                질문 글쓰기
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                category === null
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              전체
            </button>
            {JOB_CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                  category === item
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {loading ? (
              <div className="col-span-full py-10 text-center text-gray-400">로딩 중...</div>
            ) : filteredPosts.length === 0 ? (
              <div className="col-span-full py-10 text-center text-gray-400">
                아직 등록된 질문 글이 없어요.
              </div>
            ) : (
              filteredPosts.map((post) => <MentoringPostCard key={post.id} post={post} />)
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
