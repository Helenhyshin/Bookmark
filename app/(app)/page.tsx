import StatCards from '@/components/dashboard/StatCards'
import CurrentlyReading from '@/components/dashboard/CurrentlyReading'
import AIPicks from '@/components/dashboard/AIPicks'
import FloatingAddButton from '@/components/ui/FloatingAddButton'

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Stat cards */}
      <StatCards />

      {/* Currently reading */}
      <CurrentlyReading />

      {/* AI picks */}
      <AIPicks />

      {/* Floating add — mobile only */}
      <FloatingAddButton />
    </div>
  )
}
