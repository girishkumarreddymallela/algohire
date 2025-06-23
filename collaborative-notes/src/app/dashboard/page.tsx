'use client'

import ProtectedRoute from '@/customComponents/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { auth } from '@/firebase/client'
import { useRouter } from 'next/navigation'
import { CreateCandidateDialog } from '@/customComponents/CreateCandidateDialog'
import CandidateList from '@/customComponents/CandidateList'
import NotificationCard from '@/customComponents/NotificationCard'

function DashboardContent() {
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Welcome, {user?.name || 'User'}
          </span>
          <CreateCandidateDialog />
          <Button onClick={handleLogout} variant="outline" size="sm">
            Logout
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <NotificationCard />

        <CandidateList />
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
