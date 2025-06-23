'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

const CenteredSpinner = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
  </div>
)

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <CenteredSpinner />
  }

  if (user) {
    return <>{children}</>
  }

  return <CenteredSpinner />
}
