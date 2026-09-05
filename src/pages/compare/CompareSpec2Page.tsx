import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Filter,
  List,
  RotateCcw,
  Search,
} from 'lucide-react'
import PenguinMascot from '../../components/ui/PenguinMascot'
import Logo from '../../components/ui/Logo'
import Footer from '../../components/layout/Footer'
import ProfileMenu from '../../components/layout/ProfileMenu'
import RankBadge from '../../components/compare/RankBadge'
import RankPagination from '../../components/compare/RankPagination'
import { fetchSearchPeers, type CompareSpecProfile } from '../../api/compare'
import { fetchMyProfile } from '../../api/profile'
import { useEffect } from 'react'
import { JOB_CATEGORIES } from '../../data/jobCategories'
import { COLLEGES } from '../../data/departments'


const HERO_STEPS = [
  { icon: Filter, label: '조건 선택' },
  { icon: List, label: '스펙 비교' },
  { icon: BarChart3, label: '나의 위치' },
]

const NAV_ITEMS = [
  { label: '스펙 비교', to: '/compare' },
  { label: '서비스 소개', to: '/#service-intro' },
  { label: '이용 방법', to: '/#how-to-use' },
  { label: '고객지원', to: '/#support' },
]

const GRADES = ['1학년', '2학년', '3학년', '4학년']
const GPA_RANGES = ['4.5 ~ 4.0', '3.9 ~ 3.5', '3.4 ~ 3.0', '2.9 ~ 2.5', '2.4 이하']
const COMPARE_CRITERIA = ['전공 학점만', '평균 학점만']
const DEFAULT_GRADE = '4학년'
const DEFAULT_GPA_RANGE = GPA_RANGES[0]
const DEFAULT_COMPARE_CRITERION = COMPARE_CRITERIA[0]
const RANK_PAGE_SIZE = 10


export default function CompareSpec2Page() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const hasSavedComparison = searchParams.get('searched') === '1'

  const initialGrade = hasSavedComparison ? searchParams.get('grade') : DEFAULT_GRADE
  const initialGpaRange = searchParams.get('gpaRange') || DEFAULT_GPA_RANGE
  const initialJob = searchParams.get('job') || null
  const initialCriterion = searchParams.get('criterion') || DEFAULT_COMPARE_CRITERION
  const initialMajor = searchParams.get('major') || '경영학부'
  const initialPage = Math.max(1, Number(searchParams.get('page')) || 1)

  const [pendingGrade, setPendingGrade] = useState<string | null>(initialGrade)
  const [pendingGpaRange, setPendingGpaRange] = useState(initialGpaRange)
  const [pendingJob, setPendingJob] = useState<string | null>(initialJob)
  const [pendingCompareCriterion, setPendingCompareCriterion] = useState(initialCriterion)
  const [appliedGrade, setAppliedGrade] = useState<string | null>(initialGrade)
  const [appliedJob, setAppliedJob] = useState<string | null>(initialJob)
  const [myNickname, setMyNickname] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [appliedGpaRange, setAppliedGpaRange] = useState(initialGpaRange)
  const [appliedCompareCriterion, setAppliedCompareCriterion] = useState(initialCriterion)
  const [page, setPage] = useState(initialPage)
  const [searchRequest, setSearchRequest] = useState(0)

  const [pendingMajor, setPendingMajor] = useState(initialMajor)
  const [appliedMajor, setAppliedMajor] = useState(initialMajor)
  const [profiles, setProfiles] = useState<CompareSpecProfile[]>([])
  

  
  const initializedRef = React.useRef(false)
  
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    
    fetchMyProfile().then((myProfile) => {
      const gradeNum = Math.max(
        1,
        Math.min(4, new Date().getFullYear() - myProfile.entranceYear + 1),
      )
      const grade = `${gradeNum}학년`
      if (!hasSavedComparison) {
        setPendingMajor(myProfile.major)
        setAppliedMajor(myProfile.major)
        setPendingGrade(grade)
        setAppliedGrade(grade)
        setPendingJob(myProfile.desiredJob || null)
        setAppliedJob(myProfile.desiredJob || null)
      }
      setMyNickname(myProfile.nickname);
      setIsReady(true);
    }).catch((e) => {
      console.error(e);
      alert('스펙 등록을 먼저 완료해주세요.');
      navigate('/mypage/specs/register');
    });
  }, [hasSavedComparison, navigate])

  const gpaColumnLabel = appliedCompareCriterion === '전공 학점만' ? '전공 학점' : '평균 학점'

  useEffect(() => {
    let minGpa = 0; let maxGpa = 4.5;
    if (appliedGpaRange === '4.5 ~ 4.0') { minGpa = 4.0; maxGpa = 4.5; }
    else if (appliedGpaRange === '3.9 ~ 3.5') { minGpa = 3.5; maxGpa = 3.99; }
    else if (appliedGpaRange === '3.4 ~ 3.0') { minGpa = 3.0; maxGpa = 3.49; }
    else if (appliedGpaRange === '2.9 ~ 2.5') { minGpa = 2.5; maxGpa = 2.99; }
    else { minGpa = 0.0; maxGpa = 2.49; }

    
    if (!isReady) return;
    const entranceYear = appliedGrade
      ? new Date().getFullYear() - parseInt(appliedGrade) + 1
      : undefined
    fetchSearchPeers({ major: appliedMajor, entranceYear, desiredJob: appliedJob || undefined, minGpa, maxGpa })
      .then((res: CompareSpecProfile[]) => setProfiles(res || []))
      .catch((e: Error) => console.error(e))
      
  }, [isReady, appliedMajor, appliedGpaRange, appliedGrade, appliedJob, searchRequest]);

  const sortedProfiles = [...profiles].sort((a, b) => b.gpa - a.gpa)
  const rankByGpa = new Map<string, number>()
  sortedProfiles.forEach((profile, index) => {
    const gpaKey = profile.gpa.toFixed(2)
    if (!rankByGpa.has(gpaKey)) rankByGpa.set(gpaKey, index + 1)
  })

  const filteredStudents = sortedProfiles.map((p) => {
    const rank = rankByGpa.get(p.gpa.toFixed(2)) || 1
    return {
      anonId: p.virtualNickname || p.anonymousUuid.substring(0, 8),
      uuid: p.anonymousUuid,
      department: p.major,
      gpa: p.gpa.toFixed(2),
      gpaPercentile: Math.max(1, Math.ceil((rank / (sortedProfiles.length || 1)) * 100)),
      isMe: p.virtualNickname === myNickname,
      lang: p.toeicScore > 0 ? 'TOEIC ' + p.toeicScore : '없음',
      certs: p.verificationCount + '개',
      intern: p.internCount > 0 ? p.internCount + '회' : '없음',
      rank,
    }
  })

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / RANK_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStudents = filteredStudents.slice(
    (currentPage - 1) * RANK_PAGE_SIZE,
    currentPage * RANK_PAGE_SIZE,
  )

  const handleSearch = () => {
    setAppliedMajor(pendingMajor)
    setAppliedGrade(pendingGrade)
    setAppliedJob(pendingJob)
    setAppliedGpaRange(pendingGpaRange)
    setAppliedCompareCriterion(pendingCompareCriterion)
    setPage(1)
    const nextParams = new URLSearchParams({
      searched: '1',
      major: pendingMajor,
      gpaRange: pendingGpaRange,
      criterion: pendingCompareCriterion,
      page: '1',
    })
    if (pendingGrade) nextParams.set('grade', pendingGrade)
    if (pendingJob) nextParams.set('job', pendingJob)
    setSearchParams(nextParams, { replace: true })
    setSearchRequest((request) => request + 1)
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('page', String(nextPage))
    setSearchParams(nextParams, { replace: true })
  }

  const handleReset = () => {
    setPendingGrade(DEFAULT_GRADE)
    setPendingGpaRange(DEFAULT_GPA_RANGE)
    setPendingJob(null)
    setPendingCompareCriterion(DEFAULT_COMPARE_CRITERION)
    setPendingMajor('경영학부')
    setAppliedGrade(DEFAULT_GRADE)
    setAppliedGpaRange(DEFAULT_GPA_RANGE)
    setAppliedCompareCriterion(DEFAULT_COMPARE_CRITERION)
    setAppliedMajor('경영학부')
    setAppliedJob(null)
    setPage(1)
    setSearchParams({}, { replace: true })
    setSearchRequest((request) => request + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-linear-to-br from-blue-500 to-blue-700 pb-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center">
              <Logo variant="white" />
            </Link>
            <nav className="hidden items-center gap-9 md:flex">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-[15px] font-medium text-white/90 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <ProfileMenu variant="dark" />
          </div>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-8">
            <div>
              <h1 className="text-[26px] font-bold leading-snug text-white">
                비교할 조건을 선택하고
                <br />
                익명 스펙을 확인해보세요
              </h1>
              <p className="mt-2 text-[13.5px] text-white/80">
                같은 조건의 학생들이 어디까지 왔는지 확인하고,
                <br />
                나의 위치를 파악해보세요.
              </p>
            </div>

            <div className="flex items-center">
              {HERO_STEPS.map((step, index) => (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full ${
                        index === 0 ? 'bg-white text-blue-600' : 'bg-white/15 text-white'
                      }`}
                    >
                      <step.icon className="h-5 w-5" />
                    </span>
                    <span className="text-[12px] font-medium text-white/90">{step.label}</span>
                  </div>
                  {index < HERO_STEPS.length - 1 && <div className="mx-3 mb-6 h-px w-10 bg-white/30" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[336px_1fr]">
        <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/[0.02]">
          <p className="mb-4 text-[14px] font-bold text-ink-900">비교 조건 선택</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-gray-500">
                1. 학과 선택
              </label>
              <div className="relative">
                <select
                  value={pendingMajor}
                  onChange={(e) => setPendingMajor(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2.5 text-[13px] text-ink-900 outline-none focus:border-blue-500"
                >
                  {COLLEGES.map((college) => (
                    <optgroup key={college.college} label={college.college}>
                      {college.departments.map((department) => (
                        <option key={department} value={department}>{department}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-gray-500">
                2. 학년 선택
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setPendingGrade(grade === pendingGrade ? null : grade)}
                    className={`rounded-lg border py-2 text-[12px] font-medium transition-colors ${
                      grade === pendingGrade
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-gray-500">
                3. 희망 직무
              </label>
              <div className="grid grid-cols-4 gap-1">
                {JOB_CATEGORIES.map((job) => (
                  <button
                    key={job}
                    type="button"
                    onClick={() => setPendingJob((prev) => (prev === job ? null : job))}
                    className={`rounded-md border px-1.5 py-1.5 text-[11px] font-medium leading-tight transition-colors ${
                      job === pendingJob
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {job}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-gray-500">
                4. 비교 기준
              </label>
              <div className="relative">
                <select
                  value={pendingCompareCriterion}
                  onChange={(e) => setPendingCompareCriterion(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2.5 text-[13px] text-ink-900 outline-none focus:border-blue-500"
                >
                  {COMPARE_CRITERIA.map((criterion) => (
                    <option key={criterion}>{criterion}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-gray-500">
                5. 학점 구간 선택
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {GPA_RANGES.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setPendingGpaRange(range)}
                    className={`rounded-lg border px-2 py-2 text-[12px] font-medium transition-colors ${
                      range === pendingGpaRange
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <p className="rounded-lg bg-gray-50 p-3 text-[11.5px] leading-relaxed text-gray-400">
              조건에 맞는 익명 데이터를 기반으로 참여됩니다.
            </p>

            <button
              type="button"
              onClick={handleSearch}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-3 text-[14px] font-semibold text-white hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
              스펙 비교하기 →
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2.5 text-[13px] font-medium text-gray-500 hover:bg-gray-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              조건 초기화
            </button>
          </div>
        </aside>

        <section>
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-gray-500">
            {[appliedMajor, appliedGrade, `학점 ${appliedGpaRange}`].map((condition, index) => (
              <span key={condition} className="flex items-center gap-2">
                {index > 0 && <span className="text-gray-300">|</span>}
                <span className="font-medium text-ink-900">{condition}</span>
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-end justify-between">
            <p className="flex items-center gap-1 text-[15px] font-bold text-ink-900">
              학점 내림차순 (동일 조건 내)
            </p>
            <p className="text-[14px] font-bold text-ink-900">총 {filteredStudents.length}명</p>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="mt-3 flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
              <p className="text-[14px] font-semibold text-ink-900">조건에 맞는 학생이 없어요</p>
              <p className="text-[12.5px] text-gray-400">다른 학년 또는 학점 구간을 선택해보세요.</p>
            </div>
          ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm shadow-black/[0.02]">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[12px] text-gray-400">
                  <th className="px-4 py-3 font-medium">순위</th>
                  <th className="px-4 py-3 font-medium">익명 ID</th>
                  <th className="px-4 py-3 font-medium">{gpaColumnLabel} (4.5)</th>
                  <th className="px-4 py-3 font-medium">어학</th>
                  <th className="px-4 py-3 font-medium">자격증</th>
                  <th className="px-4 py-3 font-medium">교내활동</th>
                  <th className="px-4 py-3 font-medium">대외활동</th>
                  <th className="px-4 py-3 font-medium">인턴</th>
                  <th className="px-4 py-3 font-medium">기타 스펙</th>
                </tr>
              </thead>
              <tbody>
                {pageStudents.map((student) => (
                  <tr
                    key={student.uuid}
                    onClick={() => navigate(
                      `/compare/${encodeURIComponent(student.uuid)}`,
                      { state: { gpaPercentile: student.gpaPercentile } },
                    )}
                    className={`cursor-pointer border-b border-gray-50 last:border-none hover:bg-gray-50/70 ${student.isMe ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="px-4 py-3.5">
                      <RankBadge rank={student.rank} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <PenguinMascot className="h-8 w-8" />
                        <div>
                          <p className="text-[13px] font-semibold text-ink-900">
                            {student.anonId}
                            {student.isMe && <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800">내 스펙</span>}
                          </p>
                          <p className="text-[11px] text-gray-400">{student.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13.5px] font-bold text-ink-900">{student.gpa}</p>
                      <p className="text-[11px] text-blue-600">상위 {student.gpaPercentile}%</p>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-ink-900">{student.lang}</td>
                    <td className="px-4 py-3.5 text-[13px] text-ink-900">{student.certs}</td>
                    <td className="px-4 py-3.5 text-[13px] text-ink-900">
                      {Math.max(1, student.rank % 3 + 1)}개
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-ink-900">
                      {Math.max(1, (student.rank % 4) + 1)}개
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-ink-900">{student.intern}</td>
                    <td className="px-4 py-3.5">
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <RankPagination currentPage={currentPage} totalPages={totalPages} onChange={handlePageChange} />
          </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
