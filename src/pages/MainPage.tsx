import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import MainHeroSection from '../components/mainpage/MainHeroSection'
import MainRecentPostsSection from '../components/mainpage/MainRecentPostsSection'
import MainFlowSection from '../components/mainpage/MainFlowSection'
import MainCtaSection from '../components/mainpage/MainCtaSection'

export default function MainPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <MainHeroSection />
        <MainRecentPostsSection />
        <MainFlowSection />
        <MainCtaSection />
      </main>
      <Footer />
    </div>
  )
}
