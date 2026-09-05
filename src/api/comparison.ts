import { api } from './axios'

export interface CertificateDto {
  certName: string
  status: string
}

export interface ActivityDto {
  activityName: string
  status: string
}

export interface InternDto {
  company: string
  detail: string
}

export interface AwardDto {
  awardName: string
  detail: string
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
  interns: InternDto[]
  awards: AwardDto[]
}

export const getProfileDetail = async (uuid: string): Promise<ProfileDetailResponse> => {
  const response = await api.get(`/comparison/profiles/${uuid}`)
  return response.data.data
}
