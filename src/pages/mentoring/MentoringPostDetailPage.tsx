import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import MentoringStatusBadge from '../../components/mentoring/MentoringStatusBadge'
import ApplicantListItem from '../../components/mentoring/ApplicantListItem'
import MentorApplyModal from '../../components/mentoring/MentorApplyModal'
import ReviewWriteModal from '../../components/mentoring/ReviewWriteModal'
import ReviewCard from '../../components/mentoring/ReviewCard'
import { useAuth } from '../../context/AuthContext'
import {
  fetchChatRoomByPost,
  fetchMentoringPost,
  selectMentorApplication,
  type MentoringPostDetail,
} from '../../api/mentoring'
import { fetchMentoringReview, type MentoringReview } from '../../api/mentoringReview'

export default function MentoringPostDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()
  const myNickname = user?.nickname || user?.name || ''

  const [post, setPost] = useState<MentoringPostDetail | null | undefined>(undefined)
  const [review, setReview] = useState<MentoringReview | null>(null)
  const [chatRoomId, setChatRoomId] = useState<number | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [selectingId, setSelectingId] = useState<number | null>(null)

  const load = async () => {
    const id = Number(postId)
    const detail = await fetchMentoringPost(id)
    setPost(detail)

    if (detail?.status === '진행중' || detail?.status === '마감') {
      const room = await fetchChatRoomByPost(id)
      setChatRoomId(room?.id ?? null)
    }
    if (detail?.status === '마감') {
      const existingReview = await fetchMentoringReview(id)
      setReview(existingReview)
    }
  }

  useEffect(() => {
    load().catch((e) => {
      console.error(e)
      setPost(null)
    })
  }, [postId])

  if (post === undefined) {
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

  if (!post) return <Navigate to="/mentoring" replace />

  const isAuthor = isLoggedIn && myNickname === post.authorNickname
  const myApplication = post.applications.find((a) => a.mentorNickname === myNickname)
  const isMatchedMentor = isLoggedIn && myNickname === post.matchedMentorNickname

  const handleSelect = async (applicationId: number) => {
    try {
      setSelectingId(applicationId)
      await selectMentorApplication(post.id, applicationId)
      await load()
    } catch (e) {
      console.error(e)
      alert('멘토 선택에 실패했습니다.')
    } finally {
      setSelectingId(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <Link
          to="/mentoring"
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-gray-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          멘토멘티 게시판으로 돌아가기
        </Link>

        <div className="mt-6 rounded-3xl bg-white p-8 shadow-xl sm:p-10">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11.5px] font-semibold text-gray-500">
              {post.category}
            </span>
            <MentoringStatusBadge status={post.status} />
          </div>

          <h1 className="mt-4 text-[22px] font-bold leading-snug text-ink-900">{post.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-[12.5px] text-gray-400">
            <span>{post.authorNickname}</span>
            <span>·</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          <p className="mt-5 whitespace-pre-line text-[14.5px] leading-relaxed text-ink-900">
            {post.content}
          </p>

          {post.status !== '모집중' && post.matchedMentorNickname && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3.5">
              <p className="text-[13.5px] font-semibold text-emerald-700">
                {post.matchedMentorNickname} 멘토님과 매칭되었어요
              </p>
              {(isAuthor || isMatchedMentor) && chatRoomId !== null && (
                <button
                  type="button"
                  onClick={() => navigate(`/mentoring/chat/${chatRoomId}`)}
                  className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  채팅하기
                </button>
              )}
            </div>
          )}

          {post.status === '진행중' && isAuthor && (
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-blue-700"
            >
              후기 작성하고 마감하기
            </button>
          )}

          {post.status === '마감' && review && (
            <div className="mt-6">
              <ReviewCard review={review} />
            </div>
          )}

          {post.status === '모집중' && (
            <div className="mt-8">
              {isAuthor ? (
                <>
                  <p className="text-[15px] font-bold text-ink-900">
                    지원한 멘토 ({post.applications.length})
                  </p>
                  <div className="mt-3 flex flex-col gap-3">
                    {post.applications.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center text-[13.5px] text-gray-400">
                        아직 지원한 멘토가 없어요.
                      </div>
                    ) : (
                      post.applications.map((application) => (
                        <ApplicantListItem
                          key={application.id}
                          application={application}
                          onSelect={() => handleSelect(application.id)}
                          selecting={selectingId === application.id}
                        />
                      ))
                    )}
                  </div>
                </>
              ) : myApplication ? (
                <div className="rounded-xl bg-blue-50 px-4 py-3.5 text-[13.5px] font-medium text-blue-700">
                  이미 이 게시글에 지원했어요. 작성자가 선택하면 알려드릴게요.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => (isLoggedIn ? setApplyOpen(true) : navigate('/login'))}
                  className="w-full rounded-xl bg-blue-600 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  멘토로 지원하기 (스펙 등록)
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <MentorApplyModal
        postId={post.id}
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        onApplied={() => {
          setApplyOpen(false)
          load().catch(console.error)
        }}
      />

      <ReviewWriteModal
        postId={post.id}
        menteeNickname={post.authorNickname}
        mentorNickname={post.matchedMentorNickname ?? ''}
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSubmitted={() => {
          setReviewOpen(false)
          load().catch(console.error)
        }}
      />
    </div>
  )
}
