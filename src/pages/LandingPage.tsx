import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import HeroSection from '../components/landing/HeroSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import ComparisonSection from '../components/landing/ComparisonSection'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import FeedbackSection from '../components/landing/FeedbackSection'
import CTASection from '../components/landing/CTASection'
import MainNoticeModal from '../components/landing/MainNoticeModal'
import { scrollToSection } from '../utils/scroll'

export default function LandingPage() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.slice(1)
    requestAnimationFrame(() => {
      scrollToSection(id)
    })
  }, [location.hash])

  return (
    <div className="min-h-screen bg-white">
      <MainNoticeModal />
      <Header />
      <main>
        <div id="service-intro">
          <HeroSection />
          <FeaturesSection />
          <ComparisonSection />
        </div>

        <div id="how-to-use">
          <HowItWorksSection />
        </div>

        <div id="support">
          <FeedbackSection />
        </div>

        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
