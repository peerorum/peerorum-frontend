import type { ChatMessage, ChatRoomSummary, MentorApplication, MentoringPost } from '../api/mentoring'

export const SEED_MENTORING_POSTS: MentoringPost[] = [
  {
    id: 1,
    title: 'IT 대기업 서류 전형 준비, 선배님의 조언이 필요해요',
    content:
      '안녕하세요, 내년 상반기 IT 대기업 공채를 준비하는 3학년 학생입니다.\n자기소개서 방향과 포트폴리오 구성에 대해 오프라인에서 직접 조언을 받고 싶어요.\n강남/홍대 근처에서 1시간 정도 뵐 수 있으면 좋을 것 같습니다.',
    category: 'IT/개발',
    authorNickname: '열심히하는펭귄',
    status: '모집중',
    createdAt: '2026-09-28T09:12:00.000Z',
    applicantCount: 2,
    matchedMentorNickname: null,
    matchedApplicationId: null,
  },
  {
    id: 2,
    title: '마케팅 직무 전환, 현직자 분 조언 구합니다',
    content:
      '문과생인데 마케팅 직무로 취업을 준비하고 있습니다.\n실제 현직자분이 어떤 역량을 중요하게 보시는지, 포트폴리오는 어떻게 준비해야 할지 오프라인으로 여쭤보고 싶어요.',
    category: '마케팅/광고',
    authorNickname: '마케터지망생',
    status: '진행중',
    createdAt: '2026-09-20T03:40:00.000Z',
    applicantCount: 1,
    matchedMentorNickname: '현직마케터5년차',
    matchedApplicationId: 3,
  },
  {
    id: 3,
    title: '금융권 필기/면접 후기 듣고 싶습니다',
    content:
      '금융권 하반기 공채를 준비 중인데, 필기와 면접 모두 처음이라 막막합니다.\n실제 합격하신 선배님의 경험을 직접 듣고 싶어 글 남깁니다.',
    category: '금융',
    authorNickname: '금융권준비생',
    status: '마감',
    createdAt: '2026-09-01T06:00:00.000Z',
    applicantCount: 1,
    matchedMentorNickname: '은행원5년차',
    matchedApplicationId: 4,
  },
]

export const SEED_MENTOR_APPLICATIONS: MentorApplication[] = [
  {
    id: 1,
    postId: 1,
    mentorNickname: '백엔드개발자형',
    university: '서울대학교',
    major: '컴퓨터공학과',
    desiredJob: 'IT/개발',
    gpa: 4.1,
    toeicScore: 915,
    internCount: 2,
    activityCount: 3,
    awardCount: 1,
    message: '대기업 백엔드 개발자로 3년째 근무 중입니다. 자기소개서/포트폴리오 첨삭 도와드릴게요.',
    appliedAt: '2026-09-28T11:00:00.000Z',
  },
  {
    id: 2,
    postId: 1,
    mentorNickname: '프론트엔드언니',
    university: '연세대학교',
    major: '소프트웨어학과',
    desiredJob: 'IT/개발',
    gpa: 3.9,
    toeicScore: 880,
    internCount: 1,
    activityCount: 4,
    awardCount: 2,
    message: '프론트엔드 개발자입니다. 취업 준비 전반적으로 같이 얘기 나눠요!',
    appliedAt: '2026-09-28T14:30:00.000Z',
  },
  {
    id: 3,
    postId: 2,
    mentorNickname: '현직마케터5년차',
    university: '고려대학교',
    major: '경영학과',
    desiredJob: '마케팅/광고',
    gpa: 3.8,
    toeicScore: 905,
    internCount: 2,
    activityCount: 5,
    awardCount: 1,
    message: '브랜드 마케팅 5년차입니다. 직무 전환 준비 과정 경험 많이 공유해드릴 수 있어요.',
    appliedAt: '2026-09-20T05:10:00.000Z',
  },
  {
    id: 4,
    postId: 3,
    mentorNickname: '은행원5년차',
    university: '성균관대학교',
    major: '경제학과',
    desiredJob: '금융',
    gpa: 4.0,
    toeicScore: 920,
    internCount: 1,
    activityCount: 2,
    awardCount: 0,
    message: '시중은행 5년차입니다. 필기/면접 준비 과정 실제 경험 기반으로 도와드릴게요.',
    appliedAt: '2026-09-01T07:00:00.000Z',
  },
]

export const SEED_CHAT_ROOMS: ChatRoomSummary[] = [
  {
    id: 1,
    postId: 2,
    postTitle: '마케팅 직무 전환, 현직자 분 조언 구합니다',
    counterpartNickname: '마케터지망생',
    lastMessage: '네! 그럼 토요일 오후 2시에 강남역에서 뵐까요?',
    lastMessageAt: '2026-09-21T10:05:00.000Z',
  },
]

export const SEED_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    roomId: 1,
    senderNickname: '마케터지망생',
    content: '안녕하세요! 지원해주셔서 감사해요. 오프라인으로 한 번 뵐 수 있을까요?',
    sentAt: '2026-09-20T13:00:00.000Z',
  },
  {
    id: 2,
    roomId: 1,
    senderNickname: '현직마케터5년차',
    content: '안녕하세요! 네 좋습니다. 주말 중에 시간 괜찮으신가요?',
    sentAt: '2026-09-20T13:10:00.000Z',
  },
  {
    id: 3,
    roomId: 1,
    senderNickname: '마케터지망생',
    content: '네! 그럼 토요일 오후 2시에 강남역에서 뵐까요?',
    sentAt: '2026-09-21T10:05:00.000Z',
  },
]

export const SEED_MENTORING_REVIEWS = [
  {
    id: 1,
    postId: 3,
    menteeNickname: '금융권준비생',
    mentorNickname: '은행원5년차',
    rating: 5,
    content: '실제 필기/면접 경험을 바탕으로 구체적인 조언을 받을 수 있어서 정말 큰 도움이 됐습니다. 감사합니다!',
    createdAt: '2026-09-05T09:00:00.000Z',
  },
]
