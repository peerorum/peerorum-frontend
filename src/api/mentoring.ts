import {
  SEED_CHAT_MESSAGES,
  SEED_CHAT_ROOMS,
  SEED_MENTOR_APPLICATIONS,
  SEED_MENTORING_POSTS,
} from '../data/mockMentoring'

export type MentoringPostStatus = '모집중' | '진행중' | '마감'

export interface MentoringPost {
  id: number
  title: string
  content: string
  category: string
  authorNickname: string
  status: MentoringPostStatus
  createdAt: string
  applicantCount: number
  matchedMentorNickname: string | null
  matchedApplicationId: number | null
}

export interface MentorApplication {
  id: number
  postId: number
  mentorNickname: string
  university: string
  major: string
  desiredJob: string
  gpa?: number
  toeicScore?: number
  internCount?: number
  activityCount?: number
  awardCount?: number
  message: string
  appliedAt: string
}

export interface MentoringPostDetail extends MentoringPost {
  applications: MentorApplication[]
}

export interface ChatRoomSummary {
  id: number
  postId: number
  postTitle: string
  counterpartNickname: string
  lastMessage: string
  lastMessageAt: string
}

export interface ChatMessage {
  id: number
  roomId: number
  senderNickname: string
  content: string
  sentAt: string
}

export interface MentoringPostCreateRequest {
  title: string
  content: string
  category: string
  authorNickname: string
}

export interface MentorApplyRequest {
  postId: number
  mentorNickname: string
  university: string
  major: string
  desiredJob: string
  gpa?: number
  toeicScore?: number
  internCount?: number
  activityCount?: number
  awardCount?: number
  message: string
}

// TODO(backend): this module is a mock in-memory store. Once the real API exists,
// replace each function body below with an `api.get/post/patch(...)` call —
// call sites elsewhere in the app don't need to change, since every export
// already returns a Promise of the same shape a real response would have.

interface MockStore {
  posts: MentoringPost[]
  applications: MentorApplication[]
  chatRooms: ChatRoomSummary[]
  chatMessages: ChatMessage[]
}

// sessionStorage-backed so a page refresh mid-demo doesn't silently undo a
// match/review — state still resets on tab close or when storage is unavailable.
const STORAGE_KEY = 'peerorum:mentoringMockStore:v1'

function loadStore(): MockStore {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // sessionStorage unavailable — fall through to seed data
  }
  return {
    posts: SEED_MENTORING_POSTS.map((p) => ({ ...p })),
    applications: SEED_MENTOR_APPLICATIONS.map((a) => ({ ...a })),
    chatRooms: SEED_CHAT_ROOMS.map((r) => ({ ...r })),
    chatMessages: SEED_CHAT_MESSAGES.map((m) => ({ ...m })),
  }
}

function saveStore(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ posts, applications, chatRooms, chatMessages }))
  } catch {
    // sessionStorage unavailable — mock state just won't survive a reload
  }
}

const initialStore = loadStore()
let posts: MentoringPost[] = initialStore.posts
let applications: MentorApplication[] = initialStore.applications
let chatRooms: ChatRoomSummary[] = initialStore.chatRooms
let chatMessages: ChatMessage[] = initialStore.chatMessages

let nextPostId = Math.max(0, ...posts.map((p) => p.id)) + 1
let nextApplicationId = Math.max(0, ...applications.map((a) => a.id)) + 1
let nextRoomId = Math.max(0, ...chatRooms.map((r) => r.id)) + 1
let nextMessageId = Math.max(0, ...chatMessages.map((m) => m.id)) + 1

export const fetchMentoringPosts = async (): Promise<MentoringPost[]> => {
  return [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const fetchMentoringPost = async (postId: number): Promise<MentoringPostDetail | null> => {
  const post = posts.find((p) => p.id === postId)
  if (!post) return null

  return {
    ...post,
    applications: applications.filter((a) => a.postId === postId),
  }
}

export const createMentoringPost = async (
  data: MentoringPostCreateRequest,
): Promise<MentoringPost> => {
  const post: MentoringPost = {
    id: nextPostId++,
    title: data.title,
    content: data.content,
    category: data.category,
    authorNickname: data.authorNickname,
    status: '모집중',
    createdAt: new Date().toISOString(),
    applicantCount: 0,
    matchedMentorNickname: null,
    matchedApplicationId: null,
  }
  posts = [post, ...posts]
  saveStore()
  return post
}

export const applyToMentoringPost = async (
  data: MentorApplyRequest,
): Promise<MentorApplication> => {
  const application: MentorApplication = {
    id: nextApplicationId++,
    postId: data.postId,
    mentorNickname: data.mentorNickname,
    university: data.university,
    major: data.major,
    desiredJob: data.desiredJob,
    gpa: data.gpa,
    toeicScore: data.toeicScore,
    internCount: data.internCount,
    activityCount: data.activityCount,
    awardCount: data.awardCount,
    message: data.message,
    appliedAt: new Date().toISOString(),
  }
  applications = [...applications, application]
  posts = posts.map((p) =>
    p.id === data.postId ? { ...p, applicantCount: p.applicantCount + 1 } : p,
  )
  saveStore()
  return application
}

export const selectMentorApplication = async (
  postId: number,
  applicationId: number,
): Promise<ChatRoomSummary> => {
  const post = posts.find((p) => p.id === postId)
  const application = applications.find((a) => a.id === applicationId)
  if (!post || !application) {
    throw new Error('게시글 또는 지원 정보를 찾을 수 없습니다.')
  }

  posts = posts.map((p) =>
    p.id === postId
      ? {
          ...p,
          status: '진행중',
          matchedMentorNickname: application.mentorNickname,
          matchedApplicationId: application.id,
        }
      : p,
  )

  const existingRoom = chatRooms.find((r) => r.postId === postId)
  if (existingRoom) {
    saveStore()
    return existingRoom
  }

  const room: ChatRoomSummary = {
    id: nextRoomId++,
    postId,
    postTitle: post.title,
    counterpartNickname: application.mentorNickname,
    lastMessage: '매칭이 완료되었어요. 오프라인 만남 일정을 정해보세요!',
    lastMessageAt: new Date().toISOString(),
  }
  chatRooms = [room, ...chatRooms]
  saveStore()
  return room
}

export const closeMentoringPost = (postId: number): void => {
  posts = posts.map((p) => (p.id === postId ? { ...p, status: '마감' } : p))
  saveStore()
}

export const fetchChatRooms = async (nickname: string): Promise<ChatRoomSummary[]> => {
  return chatRooms
    .filter((room) => {
      const post = posts.find((p) => p.id === room.postId)
      return room.counterpartNickname === nickname || post?.authorNickname === nickname
    })
    .map((room) => {
      const post = posts.find((p) => p.id === room.postId)
      const counterpartNickname =
        post?.authorNickname === nickname ? room.counterpartNickname : post?.authorNickname ?? room.counterpartNickname
      return { ...room, counterpartNickname }
    })
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
}

export const fetchChatRoom = async (roomId: number): Promise<ChatRoomSummary | null> => {
  return chatRooms.find((r) => r.id === roomId) ?? null
}

export const fetchChatRoomByPost = async (postId: number): Promise<ChatRoomSummary | null> => {
  return chatRooms.find((r) => r.postId === postId) ?? null
}

export const fetchChatMessages = async (roomId: number): Promise<ChatMessage[]> => {
  return chatMessages
    .filter((m) => m.roomId === roomId)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt))
}

export const sendChatMessage = async (
  roomId: number,
  senderNickname: string,
  content: string,
): Promise<ChatMessage> => {
  const message: ChatMessage = {
    id: nextMessageId++,
    roomId,
    senderNickname,
    content,
    sentAt: new Date().toISOString(),
  }
  chatMessages = [...chatMessages, message]
  chatRooms = chatRooms.map((r) =>
    r.id === roomId ? { ...r, lastMessage: content, lastMessageAt: message.sentAt } : r,
  )
  saveStore()
  return message
}

export const fetchMyMentoringPosts = async (nickname: string): Promise<MentoringPost[]> => {
  return posts
    .filter((p) => p.authorNickname === nickname)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const fetchMyMentoringApplications = async (
  nickname: string,
): Promise<(MentorApplication & { post: MentoringPost })[]> => {
  return applications
    .filter((a) => a.mentorNickname === nickname)
    .map((a) => ({ ...a, post: posts.find((p) => p.id === a.postId)! }))
    .filter((a) => Boolean(a.post))
    .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))
}
