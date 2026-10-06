import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import MentoringPostCard from '../mentoring/MentoringPostCard'
import { fetchMentoringPosts, type MentoringPost } from '../../api/mentoring'

const PREVIEW_COUNT = 3

export default function MainRecentPostsSection() {
  const [posts, setPosts] = useState<MentoringPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMentoringPosts()
      .then((data) => setPosts(data.slice(0, PREVIEW_COUNT)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-[28px] font-bold text-ink-900">지금 올라온 질문</h2>
            <p className="mt-2 text-[14.5px] text-gray-500">
              멘토를 기다리고 있는 질문들이에요. 관심 있는 글에 지원해보세요.
            </p>
          </div>
          <Link
            to="/mentoring"
            className="flex items-center gap-1.5 text-[14px] font-semibold text-blue-600 hover:text-blue-700"
          >
            전체 게시판 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {loading ? (
            <div className="col-span-full py-10 text-center text-gray-400">로딩 중...</div>
          ) : posts.length === 0 ? (
            <div className="col-span-full py-10 text-center text-gray-400">아직 등록된 질문이 없어요.</div>
          ) : (
            posts.map((post) => <MentoringPostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
    </section>
  )
}
