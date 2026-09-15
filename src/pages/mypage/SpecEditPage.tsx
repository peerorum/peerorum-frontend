import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Award,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Globe2,
  Loader2,
  Paperclip,
  Plus,
  ShieldCheck,
  Trash2,
  Trophy,
  Users,
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
  max?: number
}

interface CategoryConfig {
  key: string
  icon: typeof GraduationCap
  title: string
  addLabel: string
  fields: FieldConfig[]
  hasVerification?: boolean
  fileUpload?: {
    exampleImage?: string
    description: string
  }
}

type Entry = Record<string, string>

const GRADE_OPTIONS = ['1학년', '2학년', '3학년', '4학년']

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'gpa',
    icon: GraduationCap,
    title: '학점 정보',
    addLabel: '학점 추가',
    fields: [
      { key: 'gpaAverage', label: '평점평균', type: 'number', max: 4.5 },
      { key: 'convertedScore', label: '환산점수', type: 'number', max: 100 },
      { key: 'majorGpaAverage', label: '전공평점평균', type: 'number', max: 4.5 },
      { key: 'grade', label: '이수 학년', type: 'select', options: GRADE_OPTIONS },
    ],
    fileUpload: {
      exampleImage: gpaExampleImage,
      description: '학교 포털의 \'누적성적 조회\' 화면을 캡처해 첨부해주세요.',
    },
  },
  {
    key: 'language',
    icon: Globe2,
    title: '어학',
    addLabel: '어학 성적 추가',
    fields: [
      { key: 'test', label: '시험 종류', type: 'select', options: ['TOEIC', 'TOEIC Speaking', 'OPIc', 'TOEFL', 'IELTS'] },
      { key: 'score', label: '점수 / 등급', type: 'text' },
      { key: 'date', label: '취득일', type: 'date' },
    ],
    fileUpload: {
      description: '성적표(점수 확인 페이지) 캡처본을 첨부해주세요.',
    },
  },
  {
    key: 'certificate',
    icon: Award,
    title: '자격증',
    addLabel: '자격증 추가',
    fields: [
      { key: 'name', label: '자격증명', type: 'text' },
      { key: 'issuer', label: '발급기관', type: 'text' },
      { key: 'date', label: '취득일', type: 'date' },
    ],
    fileUpload: {
      description: '자격증 사본 또는 발급 확인서를 첨부해주세요.',
    },
  },
  {
    key: 'activity',
    icon: Briefcase,
    title: '대외활동',
    addLabel: '대외활동 추가',
    hasVerification: false,
    fields: [
      { key: 'name', label: '활동명', type: 'text' },
      { key: 'period', label: '활동 기간', type: 'text' },
      { key: 'detail', label: '주요 내용', type: 'textarea' },
    ],
  },
  {
    key: 'intern',
    icon: Users,
    title: '인턴',
    addLabel: '인턴 경험 추가',
    hasVerification: false,
    fields: [
      { key: 'company', label: '회사명', type: 'text' },
      { key: 'period', label: '근무 기간', type: 'text' },
      { key: 'detail', label: '주요 업무', type: 'textarea' },
    ],
  },
  {
    key: 'award',
    icon: Trophy,
    title: '수상',
    addLabel: '수상 추가',
    hasVerification: false,
    fields: [
      { key: 'name', label: '수상명', type: 'text' },
      { key: 'host', label: '주최기관', type: 'text' },
      { key: 'date', label: '수상일', type: 'date' },
      { key: 'detail', label: '수상 내용', type: 'textarea' },
    ],
  },
]

type EvidenceStatus = 'none' | 'pending' | 'verified'

const getEvidenceStatus = (entry: Entry): EvidenceStatus =>
  entry._status === 'verified' ? 'verified' : entry._status === 'pending' ? 'pending' : 'none'

const SPEC_EDIT_DRAFT_KEY = 'specEditDraft'

function loadEditDraft(): Record<string, Entry[]> | null {
  try {
    const raw = sessionStorage.getItem(SPEC_EDIT_DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function clearEditDraft() {
  sessionStorage.removeItem(SPEC_EDIT_DRAFT_KEY)
}

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

export default function SpecEditPage() {
  const navigate = useNavigate()
  const { setHasSpec, updateProfile, user } = useAuth()
  const { entries: savedEntries, loadFromProfile } = useSpec()
  const [entries, setEntries] = useState<Record<string, Entry[]>>(() => {
    const draft = loadEditDraft()
    if (draft) return draft

    const gradeValue = localStorage.getItem('grade') || '4학년';
    const initialized = { ...savedEntries };
    if (initialized.gpa && initialized.gpa.length > 0 && !initialized.gpa[0].grade) {
      initialized.gpa[0] = { ...initialized.gpa[0], grade: gradeValue };
    }
    return initialized;
  })
  const [uploadTarget, setUploadTarget] = useState<{ categoryKey: string; index: number } | null>(null)

  useEffect(() => {
    sessionStorage.setItem(SPEC_EDIT_DRAFT_KEY, JSON.stringify(entries))
  }, [entries])

  const addEntry = (categoryKey: string) => {
    setEntries((prev) => ({ 
      ...prev, 
      [categoryKey]: [
        ...prev[categoryKey], 
        categoryKey === 'gpa' ? { grade: user?.grade || '4학년' } : {}
      ] 
    }))
  }

  const removeEntry = (categoryKey: string, index: number) => {
    if (categoryKey === 'gpa' && entries.gpa.length <= 1) return
    setEntries((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey].filter((_, i) => i !== index),
    }))
  }

  const updateEntry = (categoryKey: string, index: number, fieldKey: string, value: string) => {
    setEntries((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey].map((entry, i) => {
        if (i !== index) return entry
        const updated = { ...entry, [fieldKey]: value }
        if (!fieldKey.startsWith('_') && entry._status && entry._status !== 'none') {
          delete updated._status
        }
        return updated
      }),
    }))
  }

  const isGpaComplete = entries.gpa.some((entry) => (entry.gpaAverage ?? '').trim().length > 0)

  const hasUnverifiedRequiredEntry = CATEGORIES.some((category) => {
    if (category.hasVerification === false) return false
    return entries[category.key].some((entry) => {
      const hasValue = Object.entries(entry).some(
        ([key, value]) => !key.startsWith('_') && value.trim().length > 0,
      )
      return hasValue && entry._status !== 'verified'
    })
  })

  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async () => {
    if (!isGpaComplete) return
    setIsSubmitting(true)
    
    try {
      // 1. Submit unverified categories (Activity, Intern, Award)
      // Note: Full edit/delete is not supported by backend yet, so we just append them if they are complete.
      for (const entry of entries.activity) {
        if (entry.name && entry.name.trim().length > 0 && entry._status !== 'verified' && entry._isFromDB !== 'true') {
          await submitActivity({
            activityName: entry.name,
            period: entry.period || '',
            detail: entry.detail || '',
          }, null)
        }
      }
      for (const entry of entries.intern) {
        if (entry.company && entry.company.trim().length > 0 && entry._status !== 'verified' && entry._isFromDB !== 'true') {
          await submitIntern({
            company: entry.company,
            period: entry.period || '',
            detail: entry.detail || '',
          })
        }
      }
      for (const entry of entries.award) {
        if (entry.name && entry.name.trim().length > 0 && entry._status !== 'verified' && entry._isFromDB !== 'true') {
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
      updateProfile({
        name: profileData.name,
        nickname: profileData.nickname,
        school: profileData.university,
        department: profileData.major,
        grade: profileData.entranceYear ? `${Math.min(4, Math.max(1, new Date().getFullYear() - profileData.entranceYear + 1))}학년` : undefined,
        desiredJob: profileData.desiredJob || '',
      })
      
      setHasSpec(true)
      clearEditDraft()
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
          <h1 className="text-[22px] font-bold text-ink-900">내 스펙 수정하기</h1>
          <p className="mt-1 text-[13.5px] text-gray-500">
            등록한 스펙을 관리하고, 성장 과정을 한눈에 확인해보세요.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => {
              clearEditDraft()
              navigate('/mypage/specs')
            }}
            className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-medium text-ink-900 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            disabled={hasUnverifiedRequiredEntry || !isGpaComplete || isSubmitting}
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {isSubmitting ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>

      {!isGpaComplete && (
        <p className="mt-3 text-[12.5px] font-medium text-red-500">
          * 학점은 필수 항목이에요. 평점평균을 입력해야 저장할 수 있어요.
        </p>
      )}
      {hasUnverifiedRequiredEntry && (
        <p className="mt-3 text-[12.5px] font-medium text-amber-600">
          * 인증이 필요한 항목이 있어요. 증빙자료를 첨부해 인증을 완료해야 저장할 수 있어요.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-4">
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
              <div className="mb-3 flex items-start justify-between gap-3">
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

              <div className="flex flex-col gap-3">
                {entries[category.key].map((entry, index) => (
                  <div
                    key={index}
                    className={index > 0 ? 'border-t border-gray-100 pt-4' : ''}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[12px] font-semibold text-gray-400">
                        {category.title} {index + 1}
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
                          disabled={category.key === 'gpa' && entries.gpa.length <= 1}
                          aria-label="삭제"
                          className="text-gray-300 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-gray-300"
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
                            <label className="mb-1 block text-[12px] font-medium text-gray-500">
                              {field.label}
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
                        <label className="mb-1 block text-[12px] font-medium text-gray-500">
                          {field.label}
                        </label>
                        <FieldInput
                          field={field}
                          value={entry[field.key] ?? ''}
                          onChange={(value) => updateEntry(category.key, index, field.key, value)}
                        />
                      </div>
                    ))}
                  </div>
                ))}
                {entries[category.key].length === 0 && (
                  <p className="rounded-xl bg-gray-50 px-4 py-3 text-[12.5px] text-gray-400">
                    등록된 {category.title} 항목이 없어요.
                  </p>
                )}
              </div>

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
      </div>

      {!isGpaComplete && (
        <p className="mt-5 text-[12.5px] font-medium text-red-500">
          * 학점은 필수 항목이에요. 평점평균을 입력해야 저장할 수 있어요.
        </p>
      )}
      {hasUnverifiedRequiredEntry && (
        <p className="mt-5 text-[12.5px] font-medium text-amber-600">
          * 인증이 필요한 항목이 있어요. 증빙자료를 첨부해 인증을 완료해야 저장할 수 있어요.
        </p>
      )}

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            clearEditDraft()
            navigate('/mypage/specs')
          }}
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-[13.5px] font-medium text-ink-900 hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="button"
          disabled={hasUnverifiedRequiredEntry || !isGpaComplete || isSubmitting}
          onClick={handleSave}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          {isSubmitting ? '저장 중...' : '저장하기'}
        </button>
      </div>

      {uploadTarget && (() => {
        const target = uploadTarget
        const activeCategory = CATEGORIES.find((c) => c.key === target.categoryKey)
        if (!activeCategory?.fileUpload) return null
        return (
          <EvidenceUploadModal
            open
            onClose={() => setUploadTarget(null)}
            title={activeCategory.title}
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
