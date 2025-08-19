'use client'

import { useAuth } from '@/providers/AuthProvider'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthPage from '@/components/AuthPage'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return <AuthPage />
}
