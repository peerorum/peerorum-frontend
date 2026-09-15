import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Award,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Globe2,
  Info,
  Loader2,
  Paperclip,
  Plus,
  ShieldCheck,
  Trash2,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import MyPageLayout from '../../layouts/MyPageLayout'
import { useAuth } from '../../context/AuthContext'
import { useSpec } from '../../context/SpecContext'
import EvidenceUploadModal from '../../components/mypage/EvidenceUploadModal'

import { submitGpa, submitLanguage, submitCertificate, submitActivity, submitIntern, submitAward } from '../../api/spec'
import { fetchMyProfile } from '../../api/profile'

import gpaExampleImage from '../../assets/images/gpa-example.png'

type FieldType = 'text' | 'number' | 'date' | 'textarea' | 'select' | 'buttongroup'

interface FieldConfig {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  options?: string[]
  required?: boolean
  max?: number
}

interface CategoryConfig {
  key: string
  icon: typeof GraduationCap
  title: string
  description: string
  addLabel: string
  fields: FieldConfig[]
  hasVerification?: boolean
  fileUpload?: {
    exampleImage?: string
    description: string
  }
}

const GRADE_OPTIONS = ['1학년', '2학년', '3학년', '4학년']

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'gpa',
    icon: GraduationCap,
    title: '학점 정보 입력',
    description: '누적성적 조회 화면 기준으로 입력해주세요.',
    addLabel: '학점 추가',
    fields: [
      { key: 'gpaAverage', label: '평점평균', type: 'number', required: true, placeholder: '4.29', max: 4.5 },
      { key: 'convertedScore', label: '환산점수', type: 'number', placeholder: '95.3', max: 100 },
      { key: 'majorGpaAverage', label: '전공평점평균', type: 'number', placeholder: '3.85', max: 4.5 },
      { key: 'grade', label: '이수 학년', type: 'select', options: GRADE_OPTIONS, required: true },
    ],
    fileUpload: {
      exampleImage: gpaExampleImage,
      description: '학교 포털의 \'누적성적 조회\' 화면을 캡처해 첨부해주세요.',
    },
  },
  {
    key: 'language',
    icon: Globe2,
    title: '어학 성적 입력',
    description: '보유한 어학 성적을 입력해주세요.',
    addLabel: '어학 성적 추가',
    fields: [
      { key: 'test', label: '시험 종류', type: 'select', options: ['TOEIC', 'TOEIC Speaking', 'OPIc', 'TOEFL', 'IELTS'] },
      { key: 'score', label: '점수', type: 'text', required: true, placeholder: '예) 900, IH' },
      { key: 'date', label: '취득일', type: 'date' },
    ],
    fileUpload: {
      description: '성적표(점수 확인 페이지) 캡처본을 첨부해주세요.',
    },
  },
  {
    key: 'certificate',
    icon: Award,
    title: '자격증 입력',
    description: '보유한 자격증을 입력해주세요.',
    addLabel: '자격증 추가',
    fields: [
      { key: 'name', label: '자격증명', type: 'text', required: true, placeholder: '예) ADsP' },
      { key: 'issuer', label: '발급기관', type: 'text', placeholder: '예) 한국데이터산업진흥원' },
      { key: 'date', label: '취득일', type: 'date' },
    ],
    fileUpload: {
      description: '자격증 사본 또는 발급 확인서를 첨부해주세요.',
    },
  },
  {
    key: 'activity',
    icon: Briefcase,
    title: '대외활동 입력',
    description: '대외활동 및 봉사활동 경험을 입력해주세요.',
    addLabel: '대외활동 추가',
    hasVerification: false,
    fields: [
      { key: 'name', label: '활동명', type: 'text', required: true, placeholder: '예) 마케팅 서포터즈 3기' },
      { key: 'period', label: '활동 기간', type: 'text', placeholder: '예) 2024.03 - 2024.11' },
      { key: 'detail', label: '주요 내용', type: 'textarea', placeholder: '수행한 역할과 성과를 간단히 적어주세요.' },
    ],
  },
  {
    key: 'intern',
    icon: Users,
    title: '인턴 경험 입력',
    description: '인턴 경험을 입력해주세요.',
    addLabel: '인턴 경험 추가',
    hasVerification: false,
    fields: [
      { key: 'company', label: '회사명', type: 'text', required: true, placeholder: '예) ABC 마케팅' },
      { key: 'period', label: '근무 기간', type: 'text', placeholder: '예) 2024.06 - 2024.08' },
      { key: 'detail', label: '주요 업무', type: 'textarea', placeholder: '담당했던 업무를 간단히 적어주세요.' },
    ],
  },
  {
    key: 'award',
    icon: Trophy,
    title: '수상 입력',
    description: '수상 경험을 입력해주세요.',
    addLabel: '수상 추가',
    hasVerification: false,
    fields: [
      { key: 'name', label: '수상명', type: 'text', required: true, placeholder: '예) 마케팅 아이디어 공모전 장려상' },
      { key: 'host', label: '주최기관', type: 'text', placeholder: '예) 한국마케팅협회' },
      { key: 'date', label: '수상일', type: 'date' },
      { key: 'detail', label: '수상 내용', type: 'textarea', placeholder: '수상 계기와 성과를 간단히 적어주세요.' },
    ],
  },
]

const GUIDE_ITEMS = [
  '정확한 정보를 입력해주세요.',
  '증빙자료 기반으로 인증되면 신뢰도 높은 비교가 가능해요.',
  '등록한 스펙은 전체 수정이 가능해요.',
  '등록한 스펙은 안전하게 보호돼요.',
]

type Entry = Record<string, string>
type EvidenceStatus = 'none' | 'pending' | 'verified'

const SPEC_REGISTER_DRAFT_KEY = 'specRegisterDraft'

function loadRegisterDraft(): Record<string, Entry[]> | null {
  try {
    const raw = sessionStorage.getItem(SPEC_REGISTER_DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function clearRegisterDraft() {
  sessionStorage.removeItem(SPEC_REGISTER_DRAFT_KEY)
}

const getEvidenceStatus = (entry: Entry): EvidenceStatus =>
  entry._status === 'verified' ? 'verified' : entry._status === 'pending' ? 'pending' : 'none'

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldConfig
  value: string
  onChange: (value: string) => void
}) {
  if (field.type === 'textarea') {
    return (
      <textarea
        rows={2}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] outline-none placeholder:text-gray-400 focus:border-blue-500"
      />
    )
  }

  if (field.type === 'select') {
    return (
      <select
        value={value || field.options?.[0] || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-blue-500"
      >
        {field.options?.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    )
  }

  if (field.type === 'buttongroup') {
    return (
      <div className="flex flex-wrap gap-1.5">
        {field.options?.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => onChange(option)}
            className={`rounded-lg border px-2.5 py-2 text-[12px] font-medium transition-colors ${
              value === option
                ? 'border-blue-600 bg-blue-50 text-blue-600'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    )
  }

  return (
    <input
      type={field.type}
      placeholder={field.placeholder}
      value={value}
      max={field.max}
      onChange={(e) => {
        const raw = e.target.value
        if (field.max !== undefined && raw !== '') {
          const parsed = Number.parseFloat(raw)
          if (!Number.isNaN(parsed) && parsed > field.max) {
            onChange(String(field.max))
            return
          }
        }
        onChange(raw)
      }}
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] outline-none placeholder:text-gray-400 focus:border-blue-500"
    />
  )
}

export default function SpecRegisterPage() {
  const navigate = useNavigate()
  const { setHasSpec } = useAuth()
  const { loadFromProfile } = useSpec()

  const [entries, setEntries] = useState<Record<string, Entry[]>>(
    () => loadRegisterDraft() ?? Object.fromEntries(CATEGORIES.map((c) => [c.key, []])),
  )
  const [uploadTarget, setUploadTarget] = useState<{ categoryKey: string; index: number } | null>(null)

  useEffect(() => {
    sessionStorage.setItem(SPEC_REGISTER_DRAFT_KEY, JSON.stringify(entries))
  }, [entries])

  const isEntryComplete = (category: CategoryConfig, entry: Entry) =>
    category.fields
      .filter((field) => field.required)
      .every((field) => (entry[field.key] ?? '').trim().length > 0)

  const completeCountByCategory = (category: CategoryConfig) =>
    entries[category.key].filter((entry) => isEntryComplete(category, entry)).length

  const isGpaComplete = completeCountByCategory(CATEGORIES.find((c) => c.key === 'gpa')!) > 0

  const addEntry = (categoryKey: string) => {
    setEntries((prev) => ({ ...prev, [categoryKey]: [...prev[categoryKey], {}] }))
  }

  const removeEntry = (categoryKey: string, index: number) => {
    setEntries((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey].filter((_, i) => i !== index),
    }))
  }

  const updateEntry = (categoryKey: string, index: number, fieldKey: string, value: string) => {
    setEntries((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey].map((entry, i) =>
        i === index ? { ...entry, [fieldKey]: value } : entry,
      ),
    }))
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!isGpaComplete) return
    setIsSubmitting(true)
    
    try {
      // 1. Submit unverified categories (Activity, Intern, Award)
      for (const entry of entries.activity) {
        if (isEntryComplete(CATEGORIES.find(c => c.key === 'activity')!, entry)) {
          await submitActivity({
            activityName: entry.name,
            period: entry.period || '',
            detail: entry.detail || '',
          }, null)
        }
      }
      for (const entry of entries.intern) {
        if (isEntryComplete(CATEGORIES.find(c => c.key === 'intern')!, entry)) {
          await submitIntern({
            company: entry.company,
            period: entry.period || '',
            detail: entry.detail || '',
          })
        }
      }
      for (const entry of entries.award) {
        if (isEntryComplete(CATEGORIES.find(c => c.key === 'award')!, entry)) {
          await submitAward({
            name: entry.name,
            host: entry.host || '',
            date: entry.date || '',
            detail: entry.detail || '',
          })
        }
      }

      // 2. Fetch fresh data from backend and load it into context
      const profileData = await fetchMyProfile()
      loadFromProfile(profileData)

      setHasSpec(true)
      clearRegisterDraft()
      navigate('/mypage/specs')
    } catch (e) {
      console.error('Failed to submit specs', e)
      alert('스펙 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MyPageLayout>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-ink-900">스펙 등록하기</h1>
          <p className="mt-1 text-[13.5px] text-gray-500">
            나의 스펙을 등록하고 다른 학생들과 비교해보세요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            clearRegisterDraft()
            navigate('/mypage/specs')
          }}
          className="flex shrink-0 items-center gap-1 text-[13px] font-medium text-gray-400 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
          등록 취소
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((category, index) => {
          const filled = completeCountByCategory(category) > 0
          return (
            <div key={category.key} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold ${
                    filled ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {filled ? <CheckCircle2 className="h-4.5 w-4.5" /> : index + 1}
                </span>
                <span className="whitespace-nowrap text-[11.5px] font-medium text-gray-500">
                  {category.title.replace(' 정보 입력', '').replace(' 성적 입력', '').replace(' 경험 입력', '').replace(' 입력', '')}
                </span>
              </div>
              {index < CATEGORIES.length - 1 && <div className="mb-4 h-px w-6 bg-gray-200" />}
            </div>
          )
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-4">
          {CATEGORIES.map((category) => {
            const rowFields = category.fields.filter((f) => f.type !== 'textarea')
            const textareaFields = category.fields.filter((f) => f.type === 'textarea')
            const requiresVerification = category.hasVerification !== false

            return (
              <div
                key={category.key}
                className={`rounded-2xl p-5 shadow-sm shadow-black/[0.02] ${
                  requiresVerification
                    ? 'border border-blue-200 bg-blue-50/40'
                    : 'border border-gray-100 bg-white'
                }`}
              >
                <div className="mb-1 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        requiresVerification ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <category.icon className="h-4 w-4" />
                    </span>
                    <h3 className="text-[14.5px] font-bold text-ink-900">{category.title}</h3>
                    {category.key === 'gpa' && (
                      <span className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[10.5px] font-semibold text-red-500">
                        필수
                      </span>
                    )}
                    {requiresVerification && (
                      <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10.5px] font-semibold text-blue-600">
                        인증 필수
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[12.5px] text-gray-400">{category.description}</p>

                {entries[category.key].length > 0 && (
                  <div className="mt-4 flex flex-col gap-4">
                    {entries[category.key].map((entry, index) => (
                      <div
                        key={index}
                        className={index > 0 ? 'border-t border-gray-100 pt-4' : ''}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 text-[12px] font-semibold text-gray-400">
                            {entries[category.key].length > 1 && (
                              <>
                                {category.title.replace(' 입력', '')} {index + 1}
                                {!isEntryComplete(category, entry) && (
                                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold text-amber-600">
                                    필수 항목을 입력해주세요
                                  </span>
                                )}
                              </>
                            )}
                          </span>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {category.fileUpload && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setUploadTarget({ categoryKey: category.key, index })}
                                  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11.5px] font-semibold text-gray-500 transition-colors hover:bg-gray-50"
                                >
                                  <Paperclip className="h-3.5 w-3.5" />
                                  파일선택
                                </button>
                                {(() => {
                                  const status = getEvidenceStatus(entry)
                                  return (
                                    <span
                                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11.5px] font-semibold ${
                                        status === 'verified'
                                          ? 'border-emerald-200 bg-white text-emerald-600'
                                          : status === 'pending'
                                            ? 'border-blue-200 bg-white text-blue-600'
                                            : 'border-amber-200 bg-white text-amber-600'
                                      }`}
                                    >
                                      {status === 'verified' && <CheckCircle2 className="h-3.5 w-3.5" />}
                                      {status === 'pending' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                      {status === 'none' && <ShieldCheck className="h-3.5 w-3.5" />}
                                      {status === 'verified' ? '인증됨' : status === 'pending' ? '확인중' : '인증 필요'}
                                    </span>
                                  )
                                })()}
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => removeEntry(category.key, index)}
                              aria-label="삭제"
                              className="text-gray-300 hover:text-red-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {entry._fileName && (
                          <p className="mb-2 flex items-center gap-1.5 text-[11.5px] font-medium text-blue-600">
                            <Paperclip className="h-3.5 w-3.5" />
                            {entry._fileName}
                          </p>
                        )}

                        {rowFields.length > 0 && (
                          <div
                            className="grid gap-3"
                            style={{
                              gridTemplateColumns: `repeat(${rowFields.length}, minmax(0, 1fr))`,
                            }}
                          >
                            {rowFields.map((field) => (
                              <div key={field.key}>
                                <label className="mb-1 flex items-center gap-1 text-[12px] font-medium text-gray-500">
                                  {field.label}
                                  {field.required && <span className="text-red-500">*</span>}
                                </label>
                                <FieldInput
                                  field={field}
                                  value={entry[field.key] ?? ''}
                                  onChange={(value) => updateEntry(category.key, index, field.key, value)}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {textareaFields.map((field) => (
                          <div key={field.key} className={rowFields.length > 0 ? 'mt-3' : ''}>
                            <label className="mb-1 flex items-center gap-1 text-[12px] font-medium text-gray-500">
                              {field.label}
                              {field.required && <span className="text-red-500">*</span>}
                            </label>
                            <FieldInput
                              field={field}
                              value={entry[field.key] ?? ''}
                              onChange={(value) => updateEntry(category.key, index, field.key, value)}
                            />
                          </div>
                        ))}

                        {entries[category.key].length === 1 && !isEntryComplete(category, entry) && (
                          <p className="mt-2 text-[11.5px] font-medium text-amber-600">
                            * 표시된 필수 항목을 입력해주세요.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => addEntry(category.key)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-[12.5px] font-medium text-ink-900 hover:bg-gray-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {category.addLabel}
                  </button>
                </div>
              </div>
            )
          })}

          <button
            type="button"
            disabled={!isGpaComplete || isSubmitting}
            onClick={handleSubmit}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-[12px] text-gray-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            학점 등록은 필수예요. 학점·어학·자격증은 인증 완료 후에만 등록할 수 있어요.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-black/[0.02]">
            <p className="mb-3 flex items-center gap-1.5 text-[13px] font-bold text-ink-900">
              <Info className="h-4 w-4 text-blue-600" />
              안내사항
            </p>
            <ul className="flex flex-col gap-2">
              {GUIDE_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[12px] text-gray-500">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-black/[0.02]">
            <p className="mb-3 text-[13px] font-bold text-ink-900">등록 진행 상황</p>
            <ul className="flex flex-col gap-2.5">
              {CATEGORIES.map((category, index) => {
                const filled = completeCountByCategory(category) > 0
                return (
                  <li key={category.key} className="flex items-center gap-2.5 text-[12.5px]">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10.5px] font-bold ${
                        filled ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className={filled ? 'font-medium text-ink-900' : 'text-gray-400'}>
                      {category.title.replace(' 정보 입력', '').replace(' 성적 입력', '').replace(' 경험 입력', '').replace(' 입력', '')}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>

      {uploadTarget && (() => {
        const target = uploadTarget
        const activeCategory = CATEGORIES.find((c) => c.key === target.categoryKey)
        if (!activeCategory?.fileUpload) return null
        return (
          <EvidenceUploadModal
            open
            onClose={() => setUploadTarget(null)}
            title={activeCategory.title.replace(' 입력', '')}
            exampleImage={activeCategory.fileUpload.exampleImage}
            description={activeCategory.fileUpload.description}
            onConfirm={async (fileName, file) => {
              updateEntry(target.categoryKey, target.index, '_fileName', fileName)
              updateEntry(target.categoryKey, target.index, '_status', 'pending')
              
              const entry = entries[target.categoryKey][target.index]
              try {
                let result
                if (target.categoryKey === 'gpa') {
                  result = await submitGpa({
                    gpa: parseFloat(entry.gpaAverage) || 0,
                    scoreType: '4.5',
                    percentile: parseFloat(entry.convertedScore) || 0,
                    majorAverage: parseFloat(entry.majorGpaAverage) || 0,
                  }, file)
                } else if (target.categoryKey === 'language') {
                  result = await submitLanguage({
                    testName: entry.test || '',
                    score: entry.score || '',
                    date: entry.date || '',
                  }, file)
                } else if (target.categoryKey === 'certificate') {
                  result = await submitCertificate({
                    certName: entry.name || '',
                    certNo: '',
                    issueDate: entry.date || '',
                  }, file)
                }
                
                const statusStr = result?.data?.status
                if (statusStr === 'VERIFIED') {
                  updateEntry(target.categoryKey, target.index, '_status', 'verified')
                  alert('성공적으로 인증되었습니다!')
                } else {
                  updateEntry(target.categoryKey, target.index, '_status', 'rejected')
                  alert('인증에 실패했습니다. 사진이나 입력값을 다시 확인해주세요.')
                }
              } catch (e) {
                console.error('File upload failed', e)
                updateEntry(target.categoryKey, target.index, '_status', 'rejected')
                alert('파일 업로드 중 오류가 발생했습니다.')
              }
            }}
          />
        )
      })()}
    </MyPageLayout>
  )
}
