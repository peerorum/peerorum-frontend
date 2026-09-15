import { createContext, useContext, useState, type ReactNode } from 'react'
import type { MyProfileData } from '../api/profile'

export type SpecCategoryKey = 'gpa' | 'language' | 'certificate' | 'activity' | 'intern' | 'award'

export type SpecEntry = Record<string, string>

export type SpecEntries = Record<SpecCategoryKey, SpecEntry[]>

const EMPTY_ENTRIES: SpecEntries = {
  gpa: [],
  language: [],
  certificate: [],
  activity: [],
  intern: [],
  award: [],
}

interface SpecContextValue {
  entries: SpecEntries
  setCategoryEntries: (categoryKey: SpecCategoryKey, categoryEntries: SpecEntry[]) => void
  resetEntries: () => void
  loadFromProfile: (profile: MyProfileData) => void
}

const SpecContext = createContext<SpecContextValue | null>(null)

export function SpecProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<SpecEntries>(EMPTY_ENTRIES)

  const setCategoryEntries: SpecContextValue['setCategoryEntries'] = (categoryKey, categoryEntries) => {
    setEntries((prev) => ({ ...prev, [categoryKey]: categoryEntries }))
  }

  const resetEntries = () => setEntries(EMPTY_ENTRIES)

  const loadFromProfile = (profile: MyProfileData) => {
    const languageEntries = [];
    if (profile.toeicScore) {
      languageEntries.push({ test: 'TOEIC', score: String(profile.toeicScore), _status: 'verified', _isFromDB: 'true' });
    }
    if (profile.opicGrade) {
      languageEntries.push({ test: 'OPIc', score: profile.opicGrade, _status: 'verified', _isFromDB: 'true' });
    }
    if (profile.toeicSpeakingGrade) {
      languageEntries.push({ test: 'TOEIC Speaking', score: profile.toeicSpeakingGrade, _status: 'verified', _isFromDB: 'true' });
    }

    const newEntries: SpecEntries = {
      gpa: profile.gpa ? [{ 
        gpaAverage: String(profile.gpa),
        ...(profile.majorGpa ? { majorGpaAverage: String(profile.majorGpa) } : {}),
        ...(profile.convertedScore ? { convertedScore: String(profile.convertedScore) } : {}),
        _status: 'verified', _isFromDB: 'true'
      } as SpecEntry] : [],
      language: languageEntries as any,
      certificate: profile.certificates.map(c => ({
        name: c.certName,
        issuer: 'Q-Net (Mock)',
        date: c.issueDate,
        _status: c.status === 'VERIFIED' ? 'verified' : c.status === 'PENDING' ? 'pending' : 'rejected', _isFromDB: 'true'
      })),
      activity: profile.activities.map(a => ({
        name: a.activityName,
        period: a.period,
        detail: a.detail,
        _status: a.status === 'VERIFIED' ? 'verified' : a.status === 'PENDING' ? 'pending' : a.status === 'NONE' ? 'none' : 'rejected', _isFromDB: 'true'
      })),
      intern: profile.interns.map(i => ({
        company: i.company,
        period: i.period,
        detail: i.detail,
        _status: 'none',
        _isFromDB: 'true'
      })),
      award: profile.awards.map(a => ({
        name: a.name,
        host: a.host,
        date: a.date,
        detail: a.detail,
        _status: 'none',
        _isFromDB: 'true'
      }))
    }

    if (profile.toeicScore) {
      newEntries.language.push({ test: 'TOEIC', score: String(profile.toeicScore) })
    }
    if (profile.opicGrade) {
      newEntries.language.push({ test: 'OPIc', score: profile.opicGrade })
    }
    if (profile.toeicSpeakingGrade) {
      newEntries.language.push({ test: 'TOEIC Speaking', score: profile.toeicSpeakingGrade })
    }

    setEntries(newEntries)
  }

  return (
    <SpecContext.Provider value={{ entries, setCategoryEntries, resetEntries, loadFromProfile }}>
      {children}
    </SpecContext.Provider>
  )
}

export function useSpec() {
  const ctx = useContext(SpecContext)
  if (!ctx) throw new Error('useSpec must be used within SpecProvider')
  return ctx
}
