import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SpecProvider } from './context/SpecContext'
import RequireAdmin from './components/auth/RequireAdmin'
import ScrollToTop from './components/ScrollToTop'
import LandingPage from './pages/LandingPage'
import FeedbackBoardPage from './pages/FeedbackBoardPage'
import FeedbackDetailPage from './pages/FeedbackDetailPage'
import OAuth2RedirectHandler from './pages/auth/OAuth2RedirectHandler'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import SignupPage from './pages/auth/SignupPage'
import MySpecsPage from './pages/mypage/MySpecsPage'
import SpecRegisterPage from './pages/mypage/SpecRegisterPage'
import SpecEditPage from './pages/mypage/SpecEditPage'
import VerificationStatusPage from './pages/mypage/VerificationStatusPage'
import PersonalInfoEditPage from './pages/mypage/PersonalInfoEditPage'
import AccountSettingsPage from './pages/mypage/AccountSettingsPage'
import ComparePage from './pages/compare/ComparePage'
import AnonymousProfileDetailPage from './pages/compare/AnonymousProfileDetailPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminVerificationsPage from './pages/admin/AdminVerificationsPage'
import AdminSuspensionsPage from './pages/admin/AdminSuspensionsPage'
import AdminPlaceholderPage from './pages/admin/AdminPlaceholderPage'
import AdminFeedbacksPage from './pages/admin/AdminFeedbacksPage'

const ADMIN_PLACEHOLDER_ROUTES = [
  { path: '/admin/spec-cards', title: '스펙 카드 관리' },
  { path: '/admin/notices', title: '공지사항 관리' },
  { path: '/admin/stats', title: '서비스 통계' },
  { path: '/admin/analytics', title: '사용자 분석' },
  { path: '/admin/activity-log', title: '활동 로그' },
  { path: '/admin/settings', title: '설정 관리' },
  { path: '/admin/policies', title: '사원/정책 관리' },
  { path: '/admin/system', title: '시스템 관리' },
]

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SpecProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/feedback" element={<FeedbackBoardPage />} />
            <Route path="/feedback/:id" element={<FeedbackDetailPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route path="/mypage/specs" element={<MySpecsPage />} />
            <Route path="/mypage/specs/register" element={<SpecRegisterPage />} />
            <Route path="/mypage/specs/edit" element={<SpecEditPage />} />
            <Route path="/mypage/verification" element={<VerificationStatusPage />} />
            <Route path="/mypage/verification/edit-info" element={<PersonalInfoEditPage />} />
            <Route path="/mypage/settings/account" element={<AccountSettingsPage />} />

            <Route path="/compare" element={<ComparePage />} />
            <Route path="/compare/:studentId" element={<AnonymousProfileDetailPage />} />

            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminDashboardPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RequireAdmin>
                  <AdminUsersPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/verifications"
              element={
                <RequireAdmin>
                  <AdminVerificationsPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/suspensions"
              element={
                <RequireAdmin>
                  <AdminSuspensionsPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/feedbacks"
              element={
                <RequireAdmin>
                  <AdminFeedbacksPage />
                </RequireAdmin>
              }
            />
            {ADMIN_PLACEHOLDER_ROUTES.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <RequireAdmin>
                    <AdminPlaceholderPage title={route.title} />
                  </RequireAdmin>
                }
              />
            ))}
          </Routes>
        </SpecProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
