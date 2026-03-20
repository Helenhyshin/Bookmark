import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--theme-bg)' }}>
      <Sidebar />
      <TopBar />
      <main className="md:ml-[60px] pb-16 md:pb-0 min-h-[calc(100vh-48px)]">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
