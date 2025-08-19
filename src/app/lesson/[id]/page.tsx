'use client'

import { useAuth } from '@/providers/AuthProvider'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMockData } from '@/hooks/useMockData'
import LoadingSpinner from '@/components/LoadingSpinner'
import DashboardLayout from '@/components/DashboardLayout'
import LessonViewer from '@/components/LessonViewer'
import { AudioFile, Transcription, Summary } from '@/types'

interface LessonPageProps {
  params: {
    id: string
  }
}

export default function LessonPage({ params }: LessonPageProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { audioFiles, getTranscription, getSummary, loading: dataLoading } = useMockData()
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null)
  const [transcription, setTranscription] = useState<Transcription | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    // Aspetta che i dati siano caricati prima di cercare il file
    if (dataLoading) {
      return
    }

    const file = audioFiles.find(f => f.id === params.id)

    if (!file) {
      // Solo redirect se i dati sono stati caricati e il file non esiste

      router.push('/dashboard')
      return
    }
    


    setAudioFile(file)

    // Carica trascrizione e riassunto se disponibili
    if (file.status === 'READY') {
      const transcriptionData = getTranscription(file.id)
      if (transcriptionData) {
        setTranscription(transcriptionData)
        const summaryData = getSummary(transcriptionData.id)
        setSummary(summaryData)
      }
    }

    setLoading(false)
  }, [params.id, audioFiles, user, authLoading, router, getTranscription, getSummary, dataLoading])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user || !audioFile) {
    return null
  }

  return (
    <DashboardLayout>
      <LessonViewer
        audioFile={audioFile}
        transcription={transcription}
        summary={summary}
      />
    </DashboardLayout>
  )
}
