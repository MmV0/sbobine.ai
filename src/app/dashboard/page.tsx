'use client'

import { useAuth } from '@/providers/AuthProvider'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import DashboardLayout from '@/components/DashboardLayout'
import { AudioFile } from '@/types'
import UploadSection from '@/components/UploadSection'
import LessonLibrary from '@/components/LessonLibrary'

import { useMockData } from '@/hooks/useMockData'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    audioFiles,
    folders,
    refreshData,
    deleteAudioFile,
    createFolder,
    updateFolder,
    deleteFolder,
    moveLessonToFolder
  } = useMockData()

  // Inizializza il tab in base ai search params o al numero di lezioni
  const getInitialTab = (): 'upload' | 'library' => {
    const tabParam = searchParams.get('tab') as 'upload' | 'library' | null
    if (tabParam && (tabParam === 'upload' || tabParam === 'library')) {
      return tabParam
    }
    // Se l'utente ha già delle lezioni, mostra la libreria per default
    return audioFiles.length > 0 ? 'library' : 'upload'
  }

  const [selectedTab, setSelectedTab] = useState<'upload' | 'library'>(getInitialTab())

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Aggiorna il tab quando cambiano i search params
  useEffect(() => {
    const tabParam = searchParams.get('tab') as 'upload' | 'library' | null
    if (tabParam && (tabParam === 'upload' || tabParam === 'library')) {
      setSelectedTab(tabParam)
    }
  }, [searchParams])

  // Refresh automatico dei dati ogni 5 secondi quando si è sulla tab "library" 
  useEffect(() => {
    if (selectedTab === 'library') {
      const interval = setInterval(() => {
        refreshData()
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [selectedTab, refreshData])

  // Listener per eventi di refresh globali
  useEffect(() => {
    const handleRefreshEvent = () => {
      refreshData()
    }

    window.addEventListener('refreshAudioFiles', handleRefreshEvent)
    return () => window.removeEventListener('refreshAudioFiles', handleRefreshEvent)
  }, [refreshData])

  // Force refresh se non ci sono file dopo il caricamento iniziale
  useEffect(() => {
    if (!loading && audioFiles.length === 0) {
      const timer = setTimeout(() => {
        refreshData()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [loading, audioFiles.length, refreshData])



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Benvenuto, {user.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Trasforma le tue registrazioni audio in trascrizioni e riassunti strutturati per lo studio.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setSelectedTab('upload')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'upload'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Nuova Trascrizione
            </button>
            <button
              onClick={() => setSelectedTab('library')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'library'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Le Mie Lezioni
            </button>

          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === 'upload' ? (
          <UploadSection 
            onUploadComplete={() => {
              refreshData()
              setSelectedTab('library')
            }}
            onRefreshData={refreshData}
          />
        )         : selectedTab === 'library' ? (
          <LessonLibrary
            audioFiles={audioFiles}
            folders={folders}
            onRefresh={refreshData}
            onDeleteFile={deleteAudioFile}
            onMoveLessonToFolder={moveLessonToFolder}
            onCreateFolder={createFolder}
            onUpdateFolder={updateFolder}
            onDeleteFolder={deleteFolder}
          />
        ) : null}
      </div>
    </DashboardLayout>
  )
}
