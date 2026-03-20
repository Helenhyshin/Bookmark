import StatCards from '@/components/dashboard/StatCards'
import CurrentlyReading from '@/components/dashboard/CurrentlyReading'
import WordOfTheDay from '@/components/dashboard/WordOfTheDay'
import AIPicks from '@/components/dashboard/AIPicks'
import NYTBestsellers from '@/components/dashboard/NYTBestsellers'
import OnboardingBanner from '@/components/dashboard/OnboardingBanner'
import FloatingAddButton from '@/components/ui/FloatingAddButton'

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Onboarding — only visible for new users */}
      <OnboardingBanner />

      {/* Stat cards */}
      <StatCards />

      {/* Currently reading */}
      <CurrentlyReading />

      {/* Word of the day */}
      <WordOfTheDay />

      {/* AI picks */}
      <AIPicks />

      {/* NYT Bestsellers */}
      <NYTBestsellers />

      {/* Floating add — mobile only */}
      <FloatingAddButton />
    </div>
  )
}
