import { SEED_MENTORING_REVIEWS } from '../data/mockMentoring'
import { closeMentoringPost } from './mentoring'

// Deliberately separate from `feedback.ts` — that module is an unrelated
// admin-curated "service feedback" system, not a post-meetup review.

export interface MentoringReview {
  id: number
  postId: number
  menteeNickname: string
  mentorNickname: string
  rating: number
  content: string
  createdAt: string
}

export interface MentoringReviewCreateRequest {
  postId: number
  menteeNickname: string
  mentorNickname: string
  rating: number
  content: string
}

// TODO(backend): swap these bodies for axios calls once a real API exists.
// `closeMentoringPost` below models a side effect a real backend would
// perform server-side when a review is created — delete this local call
// when wiring the real endpoint.

const STORAGE_KEY = 'peerorum:mentoringReviewMockStore:v1'

function loadReviews(): MentoringReview[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // sessionStorage unavailable — fall through to seed data
  }
  return SEED_MENTORING_REVIEWS.map((r) => ({ ...r }))
}

function saveReviews(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
  } catch {
    // sessionStorage unavailable — mock state just won't survive a reload
  }
}

let reviews: MentoringReview[] = loadReviews()
let nextReviewId = Math.max(0, ...reviews.map((r) => r.id)) + 1

export const fetchMentoringReview = async (postId: number): Promise<MentoringReview | null> => {
  return reviews.find((r) => r.postId === postId) ?? null
}

export const createMentoringReview = async (
  data: MentoringReviewCreateRequest,
): Promise<MentoringReview> => {
  const review: MentoringReview = {
    id: nextReviewId++,
    postId: data.postId,
    menteeNickname: data.menteeNickname,
    mentorNickname: data.mentorNickname,
    rating: data.rating,
    content: data.content,
    createdAt: new Date().toISOString(),
  }
  reviews = [...reviews, review]
  saveReviews()
  closeMentoringPost(data.postId)
  return review
}
