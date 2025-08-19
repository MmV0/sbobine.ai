import { useRouter } from 'next/navigation'

export const useAppNavigation = () => {
  const router = useRouter()

  const navigateToDashboard = () => {

    try {
      router.push('/dashboard')
      // Forza un refresh della pagina come fallback
      setTimeout(() => {
        if (window.location.pathname !== '/dashboard') {
          window.location.href = '/dashboard'
        }
      }, 100)
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback diretto
      window.location.href = '/dashboard'
    }
  }

  return {
    navigateToDashboard
  }
}
