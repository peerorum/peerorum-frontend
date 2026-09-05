import { Download, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout'
import { fetchAdminVerifications, type AdminVerificationData } from '../../api/admin'

const STATUS_STYLE: Record<string, string> = {
  '대기 중': 'bg-orange-50 text-orange-600',
  '검토 중': 'bg-blue-50 text-blue-600',
  '처리 완료': 'bg-emerald-50 text-emerald-600',
  '거절됨': 'bg-rose-50 text-rose-600',
}

const TABS = [
  { key: 'all', label: '전체' },
  { key: '대기 중', label: '대기 중' },
  { key: '처리 완료', label: '승인 완료' },
  { key: '거절됨', label: '거절됨' },
] as const

export default function AdminVerificationsPage() {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [verifications, setVerifications] = useState<AdminVerificationData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminVerifications()
      .then((d) => setVerifications(d.verifications))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = activeTab === 'all' ? verifications : verifications.filter(v => v.status === activeTab)

  return (
    <AdminLayout>
      <h1 className="text-[22px] font-bold text-ink-900">사용자 인증</h1>
      <p className="mt-1.5 text-[13.5px] text-gray-500">
        사용자가 제출한 인증 요청을 검토하고 승인 또는 거절할 수 있습니다.
      </p>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-white shadow-sm shadow-black/[0.02]">
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 px-5 pt-3">
          {TABS.map((tab) => {
            const count = tab.key === 'all' ? verifications.length : verifications.filter(v => v.status === tab.key).length
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 border-b-2 px-3 pb-3 text-[13.5px] font-semibold transition-colors ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                {tab.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${activeTab === tab.key ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="이름, 사용자명, 이메일 검색" className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-[13.5px] outline-none placeholder:text-gray-400 focus:border-blue-500" />
          </div>
          <button type="button" className="ml-auto flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50">
            <Download className="h-3.5 w-3.5" />
            엑셀 다운로드
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-[13px] text-gray-400">로딩 중...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-y border-gray-100 text-gray-400">
                  <th className="px-5 py-3 font-medium">사용자</th>
                  <th className="px-3 py-3 font-medium">인증 유형</th>
                  <th className="px-3 py-3 font-medium">제출 파일</th>
                  <th className="px-3 py-3 font-medium">제출일</th>
                  <th className="px-3 py-3 font-medium">상태</th>
                  <th className="px-3 py-3 text-right font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-500">
                          {row.name.slice(0, 1)}
                        </span>
                        <span>
                          <span className="block font-semibold text-ink-900">{row.name}</span>
                          <span className="block text-[12px] text-gray-400">{row.handle}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11.5px] font-semibold text-gray-600">{row.type}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <FileText className="h-3.5 w-3.5 text-rose-400" />
                        {row.file}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-gray-500">{row.submittedAt}</td>
                    <td className="px-3 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${STATUS_STYLE[row.status] ?? 'bg-gray-50 text-gray-500'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button type="button" className="rounded-lg border border-blue-200 px-3 py-1.5 text-[12px] font-semibold text-blue-600 hover:bg-blue-50">승인</button>
                        <button type="button" className="rounded-lg border border-rose-200 px-3 py-1.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-50">거절</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={6} className="py-10 text-center text-[13px] text-gray-400">인증 요청이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
