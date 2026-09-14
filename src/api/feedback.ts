import { api } from './axios'

export type FeedbackStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'

export interface FeedbackResponse {
  id: number
  content: string
  contact: string
  status: FeedbackStatus
  upvotes: number
  createdAt: string
}

export interface FeedbackCreateRequest {
  content: string
  contact?: string
}

export const createFeedback = async (data: FeedbackCreateRequest): Promise<void> => {
  await api.post('/feedbacks', data)
}

export const fetchFeedbacks = async (): Promise<FeedbackResponse[]> => {
  const response = await api.get('/feedbacks')
  return response.data.data
}

export const upvoteFeedback = async (id: number): Promise<void> => {
  await api.post(`/feedbacks/${id}/upvote`)
}

export const updateFeedbackStatus = async (id: number, status: FeedbackStatus): Promise<void> => {
  await api.put(`/feedbacks/${id}/status`, null, { params: { status } })
}
