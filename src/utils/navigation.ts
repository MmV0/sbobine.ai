import { useRouter } from 'next/navigation'

export const useAppNavigation = () => {
  const router = useRouter()

  const navigateToDashboard = (tab?: 'upload' | 'library') => {
    const targetUrl = tab ? `/dashboard?tab=${tab}` : '/dashboard'
    
    try {
      router.push(targetUrl)
      // Forza un refresh della pagina come fallback
      setTimeout(() => {
        if (window.location.pathname !== '/dashboard') {
          window.location.href = targetUrl
        }
      }, 100)
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback diretto
      window.location.href = targetUrl
    }
  }

  return {
    navigateToDashboard
  }
}
