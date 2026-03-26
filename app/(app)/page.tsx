import HeroSection from '@/components/dashboard/HeroSection'
import AIPicks from '@/components/dashboard/AIPicks'
import NYTBestsellers from '@/components/dashboard/NYTBestsellers'
import FloatingAddButton from '@/components/ui/FloatingAddButton'

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Hero — greeting, stats, currently reading, word of the day */}
      <HeroSection />

      {/* AI picks */}
      <AIPicks />

      {/* NYT Bestsellers */}
      <NYTBestsellers />

      {/* Floating add — mobile only */}
      <FloatingAddButton />
    </div>
  )
}
