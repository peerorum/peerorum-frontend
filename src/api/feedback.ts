import { api } from './axios'

export type FeedbackStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'

export interface FeedbackCreateRequest {
  content: string
  contact?: string
}

export interface PublishedFeedback {
  id: number
  boardSummary: string
  publishedAt: string
}

export interface MyFeedback {
  id: number
  content: string
  contact: string | null
  status: FeedbackStatus
  answer: string | null
  answeredAt: string | null
  boardSummary: string | null
  createdAt: string
}

export interface AdminFeedback {
  id: number
  authorNickname: string | null
  content: string
  contact: string | null
  status: FeedbackStatus
  answer: string | null
  answeredAt: string | null
  boardSummary: string | null
  publishedAt: string | null
  createdAt: string
}

export const createFeedback = async (data: FeedbackCreateRequest): Promise<void> => {
  await api.post('/feedbacks', data)
}

export const fetchPublishedFeedbacks = async (): Promise<PublishedFeedback[]> => {
  const response = await api.get('/feedbacks')
  return response.data.data
}

export const fetchMyFeedbacks = async (): Promise<MyFeedback[]> => {
  const response = await api.get('/feedbacks/my')
  return response.data.data
}

export const fetchAdminFeedbacks = async (): Promise<AdminFeedback[]> => {
  const response = await api.get('/admin/feedbacks')
  return response.data.data
}

export const updateFeedbackStatus = async (id: number, status: FeedbackStatus): Promise<void> => {
  await api.put(`/admin/feedbacks/${id}/status`, null, { params: { status } })
}

export const answerFeedback = async (id: number, answer: string): Promise<void> => {
  await api.put(`/admin/feedbacks/${id}/answer`, { answer })
}

export const publishFeedback = async (id: number, summary: string): Promise<void> => {
  await api.put(`/admin/feedbacks/${id}/publish`, { summary })
}

export const unpublishFeedback = async (id: number): Promise<void> => {
  await api.delete(`/admin/feedbacks/${id}/publish`)
}
