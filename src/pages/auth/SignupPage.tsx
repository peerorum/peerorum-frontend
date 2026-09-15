import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  FolderOpen,
  Info,
  Lock,
  RefreshCw,
  SquareCheck,
} from 'lucide-react'
import Logo from '../../components/ui/Logo'
import PenguinMascot from '../../components/ui/PenguinMascot'
import AuthLayout from '../../layouts/AuthLayout'
import { LEGAL_TERMS } from '../../data/legalTerms'
import { JOB_CATEGORIES } from '../../data/jobCategories'
import { COLLEGES } from '../../data/departments'
import { useAuth } from '../../context/AuthContext'
import { createMyProfile } from '../../api/profile'
import {
  getApiErrorMessage,
  refreshAuthentication,
  saveAuthenticationSession,
  signupLocal,
  updateRealName,
} from '../../api/auth'

type Step = 'method' | 'account' | 'terms' | 'basic' | 'compare' | 'nickname' | 'complete'
type SignupMethod = 'local' | 'oauth'

const STEP_ORDER: Step[] = ['terms', 'basic', 'compare', 'nickname']

const TERMS = [
  {
    key: 'age',
    title: '만 14세 이상입니다 (필수)',
    body: '서비스는 개인정보보호법에 따라 만 14세 이상만 이용하실 수 있습니다.',
  },
  {
    key: 'service',
    title: '이용약관 (필수)',
    body: LEGAL_TERMS['이용약관'].body,
  },
  {
    key: 'privacy',
    title: '개인정보처리방침 (필수)',
    body: LEGAL_TERMS['개인정보처리방침'].body,
  },
  {
    key: 'certification',
    title: '스펙 인증 운영정책 (필수)',
    body: LEGAL_TERMS['스펙 인증 운영정책'].body,
  },
  {
    key: 'anonymous',
    title: '익명 정보 제공 및 활용 동의 (필수)',
    body: LEGAL_TERMS['익명 정보 제공 및 활용 동의'].body,
  },
  {
    key: 'marketing',
    title: '마케팅 정보 수신 동의 (선택)',
    body: '이벤트, 혜택, 서비스 소식 등의 마케팅 정보를 이메일로 받아보실 수 있습니다. 동의하지 않아도 서비스 이용에는 제한이 없습니다.',
  },
]

const REQUIRED_TERM_KEYS = TERMS.filter((t) => t.key !== 'marketing').map((t) => t.key)

const GRADES = ['1학년', '2학년', '3학년', '4학년', '기타']

const NICKNAME_SUGGESTIONS = [
  '성장하는펭귄',
  '오름러',
  '스펙마스터',
  '도전왕개미',
  '열정펭귄',
  '상위1%도전자',
  '꾸준한다람쥐',
  '취준왕독수리',
  '갓생러',
  '자소서장인',
  '면접뿌셔클럽',
  '불꽃취준러',
  '스펙업파이터',
  '오늘도최선',
  '내일은합격',
  '초록불청춘',
  '느긋한거북이',
  '용맹한호랑이',
  '지혜로운부엉이',
  '민첩한여우',
  '단단한곰돌이',
  '날쌘치타',
  '든든한불곰',
  '재빠른다람쥐',
  '평화로운비둘기',
  '용감한사자',
  '성실한개미',
  '반짝이는별',
  '두근두근합격',
  '차근차근성장',
  '작심삼일탈출',
  '불타는의지',
  '한걸음씩전진',
]

const SPEC_LINK_GUIDE = [
  { title: '마이페이지로 이동', description: '우측 상단 프로필 아이콘을 클릭하세요.' },
  { title: '내 스펙 메뉴 선택', description: "사이드 메뉴에서 '내 스펙'을 선택하세요." },
  {
    title: '스펙 항목 연동',
    description: '학점, 어학, 자격증 등 스펙을 등록하고 인증하여 비교를 시작해보세요.',
  },
]

function ProgressHeader({ step, totalSteps }: { step: number; totalSteps: number }) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>
      <span className="text-[12px] font-medium text-gray-400">
        {step}/{totalSteps}
      </span>
    </div>
  )
}

function StepHeader({
  title,
  onBack,
  stepIndex,
}: {
  title: string
  onBack?: () => void
  stepIndex: number
}) {
  return (
    <div className="flex items-center gap-3">
      {onBack ? (
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600" aria-label="이전">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
      ) : (
        <span className="text-[14px] font-semibold text-ink-900">{title}</span>
      )}
      {onBack && <span className="text-[14px] font-semibold text-ink-900">{title}</span>}
      <ProgressHeader step={stepIndex + 1} totalSteps={STEP_ORDER.length} />
    </div>
  )
}

export default function SignupPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isOnboarding =
    searchParams.get('mode') === 'onboarding' &&
    Boolean(localStorage.getItem('token'))

  const [step, setStep] = useState<Step>(isOnboarding ? 'terms' : 'method')
  const [signupMethod, setSignupMethod] = useState<SignupMethod | null>(
    isOnboarding ? 'oauth' : null,
  )
  const [checked, setChecked] = useState<Record<string, boolean>>({
    age: false,
    service: false,
    privacy: false,
    certification: false,
    anonymous: false,
    marketing: false,
  })

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  const [school] = useState('단국대학교')
  const [department, setDepartment] = useState('')
  const [grade, setGrade] = useState('4학년')

  const [desiredJob, setDesiredJob] = useState('')

  const [nickname, setNickname] = useState('')

  const allRequiredChecked = REQUIRED_TERM_KEYS.every((key) => checked[key])
  const allChecked = Object.values(checked).every(Boolean)
  const toggleAll = () => {
    const next = !allChecked
    setChecked({
      age: next,
      service: next,
      privacy: next,
      certification: next,
      anonymous: next,
      marketing: next,
    })
  }

  const stepIndex = STEP_ORDER.indexOf(step)

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    if (password.length < 8) {
      setPasswordError('비밀번호는 8자 이상이어야 해요.')
      return
    }
    if (password !== passwordConfirm) {
      setPasswordError('비밀번호가 일치하지 않아요.')
      return
    }
    setPasswordError('')
    setSignupMethod('local')
    setStep('terms')
  }

  const handleTermsContinue = async () => {
    if (signupMethod === 'oauth') {
      setStep('basic')
      return
    }

    if (signupMethod !== 'local') {
      setStep('method')
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const session = await signupLocal({
        name: name.trim(),
        email: email.trim(),
        password,
      })

      saveAuthenticationSession(session)
      login({
        name: session.name,
        email: email.trim(),
        role: 'user',
        hasSpec: false,
        provider: 'LOCAL',
      })
      setStep('basic')
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.',
        ),
      )
      setStep('account')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillRandomNickname = () => {
    const pool = NICKNAME_SUGGESTIONS.filter((n) => n !== nickname)
    setNickname(pool[Math.floor(Math.random() * pool.length)])
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setIsCompleting(true)

    try {
      const gradeNum = parseInt(grade.replace(/[^0-9]/g, '')) || 4
      const currentYear = new Date().getFullYear()
      const entranceYear = currentYear - gradeNum + 1

      if (signupMethod === 'oauth' && name.trim()) {
        await updateRealName(name.trim())
      }

      await createMyProfile({
        university: school,
        major: department || '미정',
        entranceYear,
        desiredJob,
        nickname,
      })

      const session = await refreshAuthentication()
      saveAuthenticationSession(session)
      login({
        name: session.name,
        email,
        school,
        department,
        grade,
        desiredJob,
        nickname,
        hasSpec: false,
        role: session.role === 'ROLE_ADMIN' ? 'admin' : 'user',
        provider: signupMethod === 'oauth' ? 'SOCIAL' : 'LOCAL',
      })
      setStep('complete')
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          '프로필 생성에 실패했습니다. 잠시 후 다시 시도해주세요.',
        ),
      )
    } finally {
      setIsCompleting(false)
    }
  }

  const finishSignup = (destination: '/mypage/specs' | '/') => {
    navigate(destination)
  }

  if (step === 'method') {
    return (
      <AuthLayout>
        <div>
          <h1 className="text-[22px] font-bold text-ink-900">회원가입</h1>
          <p className="mt-1.5 text-[13.5px] text-gray-500">
            가입할 방법을 선택해주세요.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSignupMethod('local')
                setStep('account')
              }}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 text-[14px] font-semibold text-white hover:bg-blue-700"
            >
              이메일로 회원가입
            </button>
            <button
              type="button"
              onClick={() => window.location.href = '/oauth2/authorization/google'}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-[14px] font-medium text-ink-900 hover:bg-gray-50"
            >
              <span className="text-[15px] font-bold text-[#4285F4]">G</span>
              Google로 회원가입
            </button>
            <button
              type="button"
              onClick={() => window.location.href = '/oauth2/authorization/kakao'}
              className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-[#FEE500] py-3 text-[14px] font-medium text-[#191600] hover:brightness-95"
            >
              카카오로 회원가입
            </button>
          </div>

          <p className="mt-6 text-center text-[13px] text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </AuthLayout>
    )
  }

  if (step === 'account') {
    return (
      <AuthLayout>
        <div>
          <h1 className="text-[22px] font-bold text-ink-900">회원가입</h1>
          <p className="mt-1.5 text-[13.5px] text-gray-500">
            피어오름 계정을 만들어 서비스를 이용해보세요.
          </p>

          <form className="mt-6 flex flex-col gap-3.5" onSubmit={handleAccountSubmit}>
            <input
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="실명을 입력해주세요"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none placeholder:text-gray-400 focus:border-blue-500"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해주세요"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none placeholder:text-gray-400 focus:border-blue-500"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해주세요"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none placeholder:text-gray-400 focus:border-blue-500"
            />
            <input
              type="password"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호를 한 번 더 입력해주세요"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none placeholder:text-gray-400 focus:border-blue-500"
            />
            {passwordError && (
              <p className="text-[11.5px] font-medium text-rose-500">{passwordError}</p>
            )}
            {errorMessage && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-600"
              >
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="mt-1 w-full rounded-xl bg-blue-600 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700"
            >
              회원가입
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setErrorMessage('')
              setStep('method')
            }}
            className="mt-4 w-full text-center text-[13px] font-medium text-gray-500 hover:text-blue-600"
          >
            다른 가입 방식 선택하기
          </button>

          <p className="mt-6 text-center text-[13px] text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </AuthLayout>
    )
  }

  const maxWidthClassName = step === 'terms' || step === 'complete' ? 'max-w-2xl' : 'max-w-[440px]'

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-10">
      <Link to="/" className="mb-6 flex items-center">
        <Logo />
      </Link>

      <div className={`w-full ${maxWidthClassName} rounded-3xl bg-white p-8 shadow-xl sm:p-10`}>
        {step === 'terms' && (
          <div>
            <div className="flex justify-end text-[13px] text-gray-400">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="ml-1 font-semibold text-blue-600 hover:underline">
                로그인
              </Link>
            </div>

            <h1 className="mt-2 text-[22px] font-bold text-ink-900">회원가입</h1>
            <p className="mt-1 text-[13.5px] text-gray-500">
              서비스 이용을 위해 약관 및 정책에 동의해주세요.
            </p>

            <div className="mt-6 flex flex-col gap-4">
              {TERMS.map((term) => (
                <div key={term.key} className="rounded-2xl border border-gray-100 p-4">
                  <label className="flex items-center gap-2.5 text-[14px] font-semibold text-ink-900">
                    <input
                      type="checkbox"
                      checked={checked[term.key]}
                      onChange={(e) =>
                        setChecked((prev) => ({ ...prev, [term.key]: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    {term.title}
                  </label>
                  <div className="mt-3 h-20 overflow-y-auto whitespace-pre-line rounded-xl bg-gray-50 p-3 text-[12px] leading-relaxed text-gray-500">
                    {term.body}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={toggleAll}
              className="mt-5 flex w-full items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3.5"
            >
              <span className="flex items-center gap-2 text-[13.5px] font-medium text-blue-700">
                <SquareCheck className="h-4.5 w-4.5" />
                모든 약관 및 정책에 동의합니다. (선택 포함)
              </span>
              <span
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold ${
                  allChecked ? 'bg-blue-600 text-white' : 'bg-white text-gray-400'
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                전체 동의
              </span>
            </button>

            <button
              type="button"
              disabled={!allRequiredChecked || isSubmitting}
              onClick={() => void handleTermsContinue()}
              className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? '가입 처리 중...' : '동의하고 계속하기'}
            </button>
          </div>
        )}

        {step === 'basic' && (
          <div>
            <StepHeader title="회원가입" onBack={() => setStep('terms')} stepIndex={stepIndex} />

            <h2 className="mt-6 text-[19px] font-bold text-ink-900">기본 정보를 입력해주세요</h2>
            <p className="mt-1.5 text-[13.5px] text-gray-500">정확한 비교를 위해 필요한 정보입니다.</p>

            <form
              className="mt-6 flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault()
                setStep('compare')
              }}
            >
              {signupMethod === 'oauth' && (
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink-900">
                    실명 *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="실명을 입력해주세요"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-900">학교</label>
                <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-ink-900">
                  {school}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-900">
                  학과(전공) *
                </label>
                <div className="relative">
                  <select
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-ink-900 outline-none focus:border-blue-500"
                  >
                    <option value="" disabled>
                      학과를 선택해주세요
                    </option>
                    {COLLEGES.map((college) => (
                      <optgroup key={college.college} label={college.college}>
                        {college.departments.map((department) => (
                          <option key={department}>{department}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-900">학년 *</label>
                <div className="flex flex-wrap gap-2">
                  {GRADES.map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => setGrade(option)}
                      className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                        grade === option
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-blue-600 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700"
              >
                다음 →
              </button>
            </form>
          </div>
        )}

        {step === 'compare' && (
          <div>
            <StepHeader title="회원가입" onBack={() => setStep('basic')} stepIndex={stepIndex} />

            <h2 className="mt-6 text-[19px] font-bold text-ink-900">비교 조건을 설정해주세요</h2>
            <p className="mt-1.5 text-[13.5px] text-gray-500">나와 비슷한 학생들을 추적할 수 있어요.</p>

            <form
              className="mt-6 flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault()
                setStep('nickname')
              }}
            >
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-900">
                  희망 직무 *
                </label>
                <div className="flex flex-wrap gap-2">
                  {JOB_CATEGORIES.map((job) => (
                    <button
                      type="button"
                      key={job}
                      onClick={() => setDesiredJob(job)}
                      className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                        desiredJob === job
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {job}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3.5">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <p className="text-[12.5px] leading-relaxed text-blue-700">
                  선택하신 정보는 나중에 마이페이지에서 언제든지 변경하실 수 있습니다.
                </p>
              </div>

              <button
                type="submit"
                disabled={!desiredJob}
                className="mt-1 w-full rounded-xl bg-blue-600 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                다음 →
              </button>
            </form>
          </div>
        )}

        {step === 'nickname' && (
          <div>
            <StepHeader title="회원가입" onBack={() => setStep('compare')} stepIndex={stepIndex} />

            <h2 className="mt-6 text-[19px] font-bold text-ink-900">익명 이름을 정해주세요</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-gray-500">
              스펙을 비교할 때 실명 대신 이 이름으로 다른 사용자에게 공개돼요. 실명은 절대
              공개되지 않으니 안심하세요.
            </p>

            <form
              className="mt-6 flex flex-col gap-4"
              onSubmit={handleProfileSubmit}
            >
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-900">
                  익명 이름 *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={10}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="2~10자로 입력해주세요"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none placeholder:text-gray-400 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={fillRandomNickname}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 text-[13px] font-medium text-ink-900 hover:bg-gray-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    랜덤 추천
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="mb-3 text-[12.5px] font-semibold text-gray-500">익명 프로필 미리보기</p>
                <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-sm shadow-black/[0.02]">
                  <PenguinMascot className="h-10 w-10 shrink-0" />
                  <div>
                    <p className="text-[14px] font-bold text-ink-900">
                      {nickname || '익명 이름을 입력해주세요'}
                    </p>
                    <p className="text-[12px] text-gray-400">
                      {school || '학교'} · {grade} · {desiredJob ? `${desiredJob} 희망` : '희망 직무'}
                    </p>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-600"
                >
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isCompleting}
                className="mt-1 w-full rounded-xl bg-blue-600 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700"
              >
                {isCompleting ? '프로필 저장 중...' : '다음 →'}
              </button>
            </form>
          </div>
        )}

        {step === 'complete' && (
          <div>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FolderOpen className="h-7 w-7" />
            </span>

            <h1 className="mt-4 text-center text-[20px] font-bold leading-snug text-ink-900">
              {nickname}님, 회원가입이 완료됐어요!
            </h1>
            <p className="mt-2 text-center text-[13.5px] leading-relaxed text-gray-500">
              스펙 등록은 마이페이지에서 연동할 수 있어요.
              <br />
              메인 서비스를 이용하기 전에 내 스펙을 등록하여 더 정확한 비교와 분석을 받아보세요.
            </p>

            <div className="mt-6 rounded-2xl bg-gray-50 p-4">
              <p className="mb-3 text-[13px] font-semibold text-ink-900">스펙 등록 방법</p>
              <div className="flex flex-col gap-3">
                {SPEC_LINK_GUIDE.map((item, index) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[12px] font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-[13.5px] font-semibold text-ink-900">{item.title}</p>
                      <p className="text-[12.5px] leading-relaxed text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => finishSignup('/')}
                className="w-full rounded-xl border border-gray-200 py-3 text-[14.5px] font-semibold text-ink-900 hover:bg-gray-50"
              >
                서비스 둘러보기
              </button>
              <button
                type="button"
                onClick={() => finishSignup('/mypage/specs')}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-blue-700"
              >
                마이페이지로 이동
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-5 flex items-center justify-center gap-1.5 text-[12px] text-gray-400">
              <Lock className="h-3.5 w-3.5" />
              안전한 회원 정보 보호를 위해 SSL 암호화를 적용하고 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
