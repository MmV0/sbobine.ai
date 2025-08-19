export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}

export function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, i)).toFixed(1)
  
  return `${size} ${sizes[i]}`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = diffInMs / (1000 * 60 * 60)
  const diffInDays = diffInHours / 24

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInMs / (1000 * 60))
    return `${minutes} minuti fa`
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours)
    return `${hours} ore fa`
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays)
    return `${days} giorni fa`
  } else {
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }
}

export function getStatusText(status: string): string {
  const statusMap = {
    'UPLOADED': 'In elaborazione',
    'PROCESSING': 'In elaborazione',
    'TRANSCRIBED': 'In elaborazione',
    'SUMMARIZING': 'In elaborazione',
    'READY': 'Completato',
    'ERROR': 'Errore'
  }
  
  return statusMap[status as keyof typeof statusMap] || status
}

export function getStatusColor(status: string): string {
  const colorMap = {
    'UPLOADED': 'bg-gray-100 text-gray-800',
    'PROCESSING': 'bg-gray-100 text-gray-800',
    'TRANSCRIBED': 'bg-gray-100 text-gray-800',
    'SUMMARIZING': 'bg-gray-100 text-gray-800',
    'READY': 'bg-gray-100 text-gray-800',
    'ERROR': 'bg-red-100 text-red-800'
  }
  
  return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'
}
