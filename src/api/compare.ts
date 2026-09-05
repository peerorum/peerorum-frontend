import { api } from './axios'

export interface CompareSpecProfile {
  anonymousUuid: string
  virtualNickname: string
  university: string
  major: string
  entranceYear: number
  desiredJob: string
  gpa: number
  toeicScore: number
  verificationCount: number
  internCount: number
  activityCount: number
}

export interface CertificateDto {
  certName: string
  issueDate: string
}

export interface ActivityDto {
  activityName: string
}

export interface ProfileDetailResponse {
  anonymousUuid: string
  virtualNickname: string
  university: string
  major: string
  entranceYear: number
  desiredJob: string
  gpa: number
  gpaPercentile: number
  toeicScore: number
  certificates: CertificateDto[]
  activities: ActivityDto[]
}

export interface ComparisonStatisticsResponse {
  totalPeers: number
  averageGpa: number
  averageToeic: number
  myGpaPercentile: number
  peerProfiles: CompareSpecProfile[]
}

export const fetchSearchPeers = async (
  params?: { university?: string, major?: string, entranceYear?: number, desiredJob?: string, minGpa?: number, maxGpa?: number }
): Promise<CompareSpecProfile[]> => {
  const response = await api.get('/comparison/search', { params })
  return response.data.data
}

export const fetchAnonymousProfile = async (
  anonymousUuid: string
): Promise<ProfileDetailResponse> => {
  const response = await api.get(`/comparison/profiles/${anonymousUuid}`)
  return response.data.data
}

export const fetchComparisonStatistics = async (): Promise<ComparisonStatisticsResponse> => {
  const response = await api.get('/comparison/statistics')
  return response.data.data
}
