import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Users2 } from 'lucide-react'
import MyPageLayout from '../../layouts/MyPageLayout'
import MentoringStatusBadge from '../../components/mentoring/MentoringStatusBadge'
import { useAuth } from '../../context/AuthContext'
import {
  fetchMyMentoringApplications,
  fetchMyMentoringPosts,
  type MentorApplication,
  type MentoringPost,
} from '../../api/mentoring'

type Tab = 'posts' | 'applications'

export default function MyMentoringActivityPage() {
  const { user } = useAuth()
  const myNickname = user?.nickname || user?.name || ''

  const [tab, setTab] = useState<Tab>('posts')
  const [posts, setPosts] = useState<MentoringPost[]>([])
  const [applications, setApplications] = useState<(MentorApplication & { post: MentoringPost })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchMyMentoringPosts(myNickname), fetchMyMentoringApplications(myNickname)])
      .then(([myPosts, myApplications]) => {
        setPosts(myPosts)
        setApplications(myApplications)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [myNickname])

  return (
    <MyPageLayout>
      <div>
        <h1 className="text-[22px] font-bold text-ink-900">멘토멘티 활동</h1>
        <p className="mt-2 text-[14px] text-gray-500">
          내가 올린 질문 글과 멘토로 지원한 게시글을 모아볼 수 있어요.
        </p>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => setTab('posts')}
          className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${
            tab === 'posts' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          내가 쓴 글
        </button>
        <button
          type="button"
          onClick={() => setTab('applications')}
          className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${
            tab === 'applications' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          내가 지원한 글
        </button>
      </div>

      {loading ? (
        <div className="mt-8 py-10 text-center text-gray-400">로딩 중...</div>
      ) : tab === 'posts' ? (
        posts.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm shadow-black/[0.02]">
            <FileText className="h-8 w-8 text-gray-300" />
            <p className="text-[14px] text-gray-400">아직 올린 질문 글이 없어요.</p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/mentoring/${post.id}`}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/[0.02] transition-colors hover:border-gray-200 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <MentoringStatusBadge status={post.status} />
                  <span className="text-[12.5px] text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-[14px] font-bold text-ink-900">{post.title}</p>
                <p className="mt-1 text-[12.5px] text-gray-400">지원 {post.applicantCount}명</p>
              </Link>
            ))}
          </div>
        )
      ) : applications.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm shadow-black/[0.02]">
          <Users2 className="h-8 w-8 text-gray-300" />
          <p className="text-[14px] text-gray-400">아직 지원한 게시글이 없어요.</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {applications.map((application) => (
            <Link
              key={application.id}
              to={`/mentoring/${application.post.id}`}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/[0.02] transition-colors hover:border-gray-200 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between gap-2">
                <MentoringStatusBadge status={application.post.status} />
                <span className="text-[12.5px] text-gray-400">
                  {new Date(application.appliedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-[14px] font-bold text-ink-900">{application.post.title}</p>
              <p className="mt-1 text-[12.5px] text-gray-400">{application.post.authorNickname}님의 질문</p>
            </Link>
          ))}
        </div>
      )}
    </MyPageLayout>
  )
}
