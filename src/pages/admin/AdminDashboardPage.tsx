import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, ClipboardList, UserPlus, Users } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout'
import StatTile from '../../components/admin/StatTile'
import SignupTrendChart from '../../components/admin/SignupTrendChart'
import GenderDonutChart from '../../components/admin/GenderDonutChart'
import PenguinHero from '../../components/ui/PenguinHero'
import { fetchAdminDashboard, type AdminDashboardData } from '../../api/admin'

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminDashboard()
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const rawGenderSegments = data?.genderDistribution ?? []
  const totalGender = rawGenderSegments.reduce((sum, item) => sum + item.value, 0)
  const strokeClasses = ['stroke-blue-500', 'stroke-pink-400', 'stroke-gray-300']
  const dotClasses = ['bg-blue-500', 'bg-pink-400', 'bg-gray-300']
  const genderSegments = rawGenderSegments.map((item, i) => ({
    label: item.name,
    value: item.value,
    percent: totalGender > 0 ? Math.round(item.value / totalGender * 100) : 0,
    strokeClass: strokeClasses[i] ?? 'stroke-gray-300',
    dotClass: dotClasses[i] ?? 'bg-gray-300',
  }))
  const signupTrend = data?.signupTrend ?? []
  const recentSignups = data?.recentSignups ?? []

  return (
    <AdminLayout>
      <h1 className="text-[22px] font-bold text-ink-900">대시보드</h1>

      <div className="mt-4 flex items-center justify-between gap-6 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 px-8 py-6 text-white">
        <div>
          <p className="text-[18px] font-bold">안녕하세요, 관리자님! 👋</p>
          <p className="mt-1 text-[13.5px] text-white/80">피어오름 서비스 현황을 한눈에 확인하세요.</p>
        </div>
        <PenguinHero className="h-20 w-20 shrink-0" />
      </div>

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-10 text-gray-400">로딩 중...</div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile
              icon={Users}
              iconClassName="bg-blue-50 text-blue-600"
              label="전체 사용자"
              value={`${(data?.totalUsers ?? 0).toLocaleString()}명`}
              delta={{ direction: 'up', text: `${data?.newSignups ?? 0} (오늘 신규)` }}
            />
            <StatTile
              icon={UserPlus}
              iconClassName="bg-emerald-50 text-emerald-600"
              label="오늘 신규 가입자"
              value={`${(data?.newSignups ?? 0)}명`}
              delta={{ direction: 'up', text: '오늘 기준' }}
            />
            <StatTile
              icon={ClipboardList}
              iconClassName="bg-violet-50 text-violet-600"
              label="등록 스펙 카드"
              value={`${(data?.totalSpecCards ?? 0).toLocaleString()}건`}
              delta={{ direction: 'up', text: '전체 누적' }}
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-black/[0.02]">
              <p className="text-[14.5px] font-bold text-ink-900">사용자 가입 추이</p>
              <div className="mt-4">
                <SignupTrendChart data={signupTrend} />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-black/[0.02]">
              <p className="text-[14.5px] font-bold text-ink-900">사용자 성별 분포</p>
              <div className="mt-6">
                <GenderDonutChart segments={genderSegments} total={totalGender} />
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-black/[0.02]">
              <div className="flex items-center justify-between">
                <p className="text-[14.5px] font-bold text-ink-900">최근 가입 사용자</p>
              </div>
              <ul className="mt-4 flex flex-col gap-3.5">
                {recentSignups.map((signup, i) => (
                  <li key={i} className="flex items-center justify-between text-[13.5px]">
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[12px] font-bold text-gray-500">
                        {signup.name.slice(0, 1)}
                      </span>
                      <span>
                        <span className="font-semibold text-ink-900">{signup.name}</span>{' '}
                        <span className="text-gray-400">{signup.handle}</span>
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-gray-400">
                      {signup.time}
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                        일반
                      </span>
                    </span>
                  </li>
                ))}
                {recentSignups.length === 0 && (
                  <li className="text-center text-[13px] text-gray-400 py-4">최근 가입 사용자가 없습니다.</li>
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-black/[0.02]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <BarChart3 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[14.5px] font-bold text-ink-900">스펙 비교 관리</p>
                    <p className="text-[12.5px] text-gray-400">관리자 전용 스펙 비교 도구로 바로가기</p>
                  </div>
                </div>
                <Link
                  to="/compare"
                  className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-blue-700"
                >
                  스펙 비교 바로가기
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
