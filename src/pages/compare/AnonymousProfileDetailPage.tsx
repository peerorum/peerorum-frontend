import { useState, useEffect } from 'react'
import { getProfileDetail } from '../../api/comparison'
import type { ProfileDetailResponse } from '../../api/comparison'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Award,
  ArrowLeft,
  Briefcase,
  Globe2,
  GraduationCap,
  Info,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import PenguinMascot from '../../components/ui/PenguinMascot'
import { fetchMyProfile, type MyProfileData } from '../../api/profile'

const GPA_BUCKETS = [
  { range: '3.0', height: 18, min: 0 },
  { range: '', height: 32, min: 3.13 },
  { range: '3.5', height: 46, min: 3.38 },
  { range: '', height: 68, min: 3.63 },
  { range: '4.0', height: 100, min: 3.88 },
  { range: '', height: 54, min: 4.13 },
  { range: '4.5', height: 20, min: 4.38 },
]

function activeGpaBucketIndex(gpa: number) {
  let index = 0
  GPA_BUCKETS.forEach((bucket, i) => {
    if (gpa >= bucket.min) index = i
  })
  return index
}

export default function AnonymousProfileDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'spec' | 'timeline'>('spec')
  const { studentId } = useParams<{ studentId: string }>()
  const [student, setStudent] = useState<ProfileDetailResponse | null>(null)
  const [myProfile, setMyProfile] = useState<MyProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (studentId) {
      const decodedId = decodeURIComponent(studentId)
      Promise.all([
        getProfileDetail(decodedId),
        fetchMyProfile().catch(() => null),
      ])
        .then(([data, my]) => {
          setStudent(data)
          setMyProfile(my)
          setLoading(false)
        })
        .catch((err) => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [studentId])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50">로딩 중...</div>
  }

  if (!student) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50">사용자를 찾을 수 없습니다.</div>
  }

  const activeGpaIndex = activeGpaBucketIndex(student.gpa)
  
  const gpaPercentile =
    (location.state as { gpaPercentile?: number } | null)?.gpaPercentile ??
    student.gpaPercentile

  const activityString = student.activities && student.activities.length > 0 
    ? `대외활동 ${student.activities.length}회` 
    : '-';
    
  const contestString = student.awards && student.awards.length > 0
    ? `공모전 ${student.awards.length}회`
    : '-';
    
  const internString = student.interns && student.interns.length > 0
    ? `인턴 ${student.interns.length}회`
    : '-';

  const STAT_ROW = [
    {
      icon: GraduationCap,
      label: '학점 (4.5 만점)',
      value: `${student.gpa} / 4.5`,
      percentile: `상위 ${gpaPercentile}%`,
    },
    { icon: Globe2, label: '어학', value: student.toeicScore > 0 ? `TOEIC ${student.toeicScore}` : '없음', percentile: null },
    {
      icon: Award,
      label: '자격증',
      value: `${student.certificates ? student.certificates.length : 0}개`,
      percentile: null,
    },
    {
      icon: Briefcase,
      label: '활동',
      value: contestString === '-' ? activityString : `${activityString} · ${contestString}`,
      percentile: null,
    },
    {
      icon: Users,
      label: '인턴',
      value: internString === '-' ? '경험 없음' : internString,
      percentile: null,
    },
  ]

  const myCertsCount = myProfile?.certificates?.length || 0;
  const myActivityCount = myProfile?.activities?.length || 0;
  const myInternCount = myProfile?.interns?.length || 0;
  
  const COMPARE_ROWS = [
    { label: '학점', mine: myProfile ? `${myProfile.gpa} / 4.5` : '-', theirs: `${student.gpa} / 4.5` },
    { label: '어학', mine: myProfile ? (myProfile.toeicScore > 0 ? `TOEIC ${myProfile.toeicScore}` : '없음') : '-', theirs: student.toeicScore > 0 ? `TOEIC ${student.toeicScore}` : '없음' },
    {
      label: '자격증',
      mine: myProfile ? `${myCertsCount}개` : '-',
      theirs: `${student.certificates ? student.certificates.length : 0}개`,
    },
    {
      label: '활동',
      mine: myProfile ? (myActivityCount > 0 ? `대외활동 ${myActivityCount}회` : '없음') : '-',
      theirs: contestString === '-' ? activityString : `${activityString} · ${contestString}`,
    },
    { label: '인턴', mine: myProfile ? (myInternCount > 0 ? `${myInternCount}회` : '경험 없음') : '-', theirs: internString === '-' ? '경험 없음' : internString },
  ]
return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          비교 결과로 돌아가기
        </button>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-black/[0.02]">
          <div className="flex items-center gap-4">
            <PenguinMascot className="h-14 w-14" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-bold text-ink-900">{student.virtualNickname}</span>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                  상위 {gpaPercentile}%
                </span>
              </div>
              <p className="mt-0.5 text-[13px] text-gray-500">
                {student.major} · {student.desiredJob} 희망
              </p>
              <p className="mt-1 flex items-center gap-1 text-[11.5px] text-gray-400">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                피어오름 인증 데이터
                <Info className="h-3 w-3" />
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/[0.02]">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {STAT_ROW.map((stat) => (
              <div key={stat.label} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                  <stat.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11.5px] text-gray-400">{stat.label}</p>
                  <p className="text-[13px] font-bold leading-snug text-ink-900">{stat.value}</p>
                  {stat.percentile && (
                    <p className="text-[10.5px] font-medium text-blue-600">{stat.percentile}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex gap-2">
              {(
                [
                  { key: 'spec', label: '상세 스펙' },
                  { key: 'timeline', label: '타임라인' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`border-b-2 px-1 pb-2.5 text-[14px] font-semibold transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'spec' ? (
              <div className="mt-4 flex flex-col gap-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/[0.02]">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <GraduationCap className="h-4 w-4" />
                    </span>
                    <h3 className="text-[14.5px] font-bold text-ink-900">학점</h3>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-[20px] font-bold text-ink-900">{student.gpa} / 4.5</span>
                    <span className="text-[12px] font-semibold text-blue-600">
                      상위 {gpaPercentile}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${100 - gpaPercentile}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11.5px] text-gray-400">
                    전공 평균 제공 안됨
                  </p>

                  <div className="mt-5 rounded-xl bg-gray-50 p-4">
                    <p className="mb-3 text-[12.5px] font-semibold text-gray-500">
                      학점 분포 ({student.major})
                    </p>
                    <div className="flex h-24 items-end gap-2">
                      {GPA_BUCKETS.map((bar, index) => (
                        <div
                          key={index}
                          className="flex h-full flex-1 flex-col-reverse items-center gap-1"
                        >
                          <div
                            className={`w-full rounded-t ${index === activeGpaIndex ? 'bg-blue-600' : 'bg-gray-200'}`}
                            style={{ height: `${bar.height}%` }}
                          />
                          {index === activeGpaIndex && (
                            <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                              상위 {gpaPercentile}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 flex justify-between text-[10.5px] text-gray-400">
                      <span>3.0</span>
                      <span>3.5</span>
                      <span>4.0</span>
                      <span>4.5</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/[0.02]">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Globe2 className="h-4 w-4" />
                    </span>
                    <h3 className="text-[14.5px] font-bold text-ink-900">어학</h3>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[18px] font-bold text-ink-900">{student.toeicScore > 0 ? `TOEIC ${student.toeicScore}` : "없음"}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/[0.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Award className="h-4 w-4" />
                      </span>
                      <h3 className="text-[14.5px] font-bold text-ink-900">자격증</h3>
                    </div>
                    <span className="text-[12.5px] text-gray-400">
                      총 {student.certificates ? student.certificates.length : 0}개
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {student.certificates && student.certificates.map((cert, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-gray-100 px-3 py-1.5 text-[12.5px] font-medium text-ink-900"
                      >
                        {cert.certName}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/[0.02]">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Briefcase className="h-4 w-4" />
                    </span>
                    <h3 className="text-[14.5px] font-bold text-ink-900">활동</h3>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[12.5px] text-gray-400">대외활동</p>
                      <p className="text-[13.5px] font-semibold text-ink-900">{activityString}</p>
                    </div>
                    <div>
                      <p className="text-[12.5px] text-gray-400">공모전</p>
                      <p className="text-[13.5px] font-semibold text-ink-900">
                        {contestString === "-" ? "참여 이력 없음" : `${contestString} 수상`}
                      </p>
                    </div>
                  </div>
                  <button className="mt-3 text-[12px] font-medium text-blue-600 hover:underline">
                    더보기 &gt;
                  </button>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/[0.02]">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Users className="h-4 w-4" />
                    </span>
                    <h3 className="text-[14.5px] font-bold text-ink-900">인턴</h3>
                  </div>
                  <div className="mt-3">
                    <p className="text-[13.5px] font-semibold text-ink-900">
                      {internString === "-" ? "인턴 경험 없음" : `인턴 경험 ${internString}`}
                    </p>
                    <p className="text-[12.5px] text-gray-400">
                      {student.interns && student.interns.length > 0 ? student.interns[0].company : "등록된 인턴 이력이 없어요."}
                    </p>
                  </div>
                </div>

                <p className="flex items-center gap-1.5 text-[12px] text-gray-400">
                  <Lock className="h-3.5 w-3.5" />
                  모든 정보는 익명으로 보호되며, 허위 정보가 포함될 수 있습니다.
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-10 text-center text-[13.5px] text-gray-400 shadow-sm shadow-black/[0.02]">
                타임라인 정보가 아직 없어요.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="invisible flex gap-2" aria-hidden="true">
              <span className="border-b-2 border-transparent px-1 pb-2.5 text-[14px] font-semibold">
                상세 스펙
              </span>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/[0.02]">
              <p className="flex items-center gap-1 text-[13.5px] font-bold text-ink-900">
                나와의 비교
                <Info className="h-3.5 w-3.5 text-gray-300" />
              </p>

              <div className="mt-3 grid grid-cols-[1fr_1fr_1fr] gap-2 text-[11px] font-semibold text-gray-400">
                <span />
                <span className="text-center">나</span>
                <span className="text-center text-blue-600">{student.virtualNickname}</span>
              </div>
              <div className="flex flex-col">
                {COMPARE_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[1fr_1fr_1fr] items-center gap-2 border-t border-gray-50 py-2.5 text-[12.5px]"
                  >
                    <span className="text-gray-500">{row.label}</span>
                    <span className="text-center font-semibold text-ink-900">{row.mine}</span>
                    <span className="text-center font-semibold text-blue-600">{row.theirs}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <p className="text-[13.5px] font-bold text-ink-900">AI 맞춤 분석</p>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                    준비 중
                  </span>
                </div>
                <p className="mt-2.5 text-[12.5px] leading-relaxed text-gray-500">
                  AI가 나와 이 학생의 스펙을 분석해 강점과 보완점을 짚어주는 기능을 준비하고 있어요.
                  출시되면 가장 먼저 알려드릴게요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
