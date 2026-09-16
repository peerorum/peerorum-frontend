import { useAuth } from '../../context/AuthContext'
import CompareRequireSpecPage from './CompareRequireSpecPage'
import CompareSpec2Page from './CompareSpec2Page'

export default function ComparePage() {
  const { user, isAdmin } = useAuth()

  if (isAdmin || user?.hasSpec) {
    return <CompareSpec2Page />
  }

  return <CompareRequireSpecPage />
}
