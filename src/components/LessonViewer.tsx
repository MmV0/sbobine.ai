'use client'

import React, { useState } from 'react'
import { AudioFile, Transcription, Summary } from '@/types'
import { useMockData } from '@/hooks/useMockData'
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  BookmarkIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
import { formatDuration, formatDate, getStatusText, getStatusColor } from '@/utils/formatters'
import { useAppNavigation } from '@/utils/navigation'
import TranscriptionEditor from './TranscriptionEditor'
import SummaryViewer from './SummaryViewer'
import ElaborationViewer from './ElaborationViewer'
import ConceptMapViewer from './ConceptMapViewer'
import QuizViewer from './QuizViewer'
import AnnotationsPanel from './AnnotationsPanel'
import ExportModal from './ExportModal'
import AudioPlayer from './AudioPlayer'

interface LessonViewerProps {
  audioFile: AudioFile
  transcription: Transcription | null
  summary: Summary | null
}

export default function LessonViewer({ audioFile, transcription, summary }: LessonViewerProps) {
  const { navigateToDashboard } = useAppNavigation()
  const { getElaboration, getConceptMap, getQuiz, deleteAudioFile } = useMockData()
  
  const [activeTab, setActiveTab] = useState<'transcription' | 'summary' | 'elaboration' | 'concept-map' | 'quiz' | 'annotations'>('transcription')
  const [showExportModal, setShowExportModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newFileName, setNewFileName] = useState(audioFile.fileName)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Stati per il player audio
  const [currentTime, setCurrentTime] = useState(0)
  const [highlightingEnabled, setHighlightingEnabled] = useState(true)
  const [seekTime, setSeekTime] = useState<number | undefined>(undefined)
  
  // Funzione per il seek nell'audio
  const handleSeek = (time: number) => {
    setSeekTime(time)
    // Reset seekTime dopo un breve delay per evitare loop
    setTimeout(() => setSeekTime(undefined), 100)
  }

  // Recupera i nuovi contenuti se disponibili
  const elaboration = transcription ? getElaboration(transcription.id) : null
  const conceptMap = transcription ? getConceptMap(transcription.id) : null
  const quiz = transcription ? getQuiz(transcription.id) : null

  // Debug log


  const handleDeleteLesson = () => {
    deleteAudioFile(audioFile.id)
    navigateToDashboard('library')
  }

  const handleSaveFileName = () => {
    // TODO: Implementare salvataggio nome file nel backend/localStorage

    setIsEditingName(false)
  }

  const handleBackToDashboard = () => {
    navigateToDashboard('library')
  }

  const canEdit = audioFile.status === 'READY' && transcription

  const tabs = [
    {
      id: 'transcription' as const,
      name: 'Trascrizione',
      icon: DocumentTextIcon,
      disabled: !transcription
    },
    {
      id: 'summary' as const,
      name: 'Sintesi Strutturata',
      icon: ChatBubbleLeftRightIcon,
      disabled: !summary
    },
    {
      id: 'elaboration' as const,
      name: 'Rielaborato',
      icon: DocumentDuplicateIcon,
      disabled: !elaboration
    },
    {
      id: 'concept-map' as const,
      name: 'Mappa Concettuale',
      icon: ShareIcon,
      disabled: !conceptMap
    },
    {
      id: 'quiz' as const,
      name: 'Quiz',
      icon: QuestionMarkCircleIcon,
      disabled: !quiz
    },
    {
      id: 'annotations' as const,
      name: 'Annotazioni',
      icon: BookmarkIcon,
      disabled: !transcription
    }
  ]

  if (audioFile.status !== 'READY') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={navigateToDashboard}
            type="button"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Torna alla dashboard
          </button>
        </div>

        <div className="card text-center py-12">
          <div className="animate-pulse-soft">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Elaborazione in corso...
          </h3>
          <p className="text-gray-500 mb-4">
            La tua lezione "{audioFile.fileName}" è in fase di elaborazione.
          </p>
          <div className="max-w-md mx-auto">
            <div className="bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-primary-600 h-2 rounded-full w-2/3 animate-pulse"></div>
            </div>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(audioFile.status)}`}>
              {getStatusText(audioFile.status)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToDashboard}
            type="button"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Torna alla dashboard
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="btn-primary flex items-center"
              disabled={!summary}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Esporta
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-secondary text-red-600 border-red-300 hover:bg-red-50 flex items-center"
            >
              Elimina
            </button>
          </div>
        </div>
      </div>

      {/* Lesson Info */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-700"
                  autoFocus
                />
                <button
                  onClick={handleSaveFileName}
                  className="text-green-600 hover:text-green-700 px-2 py-1 text-sm"
                >
                  Salva
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false)
                    setNewFileName(audioFile.fileName)
                  }}
                  className="text-red-600 hover:text-red-700 px-2 py-1 text-sm"
                >
                  Annulla
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {newFileName}
                </h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Durata: {formatDuration(audioFile.durationSeconds)}</span>
              <span>Lingua: {audioFile.language.toUpperCase()}</span>
              <span>Creato: {formatDate(audioFile.createdAt)}</span>
            </div>
          </div>
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(audioFile.status)}`}>
            {getStatusText(audioFile.status)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  type="button"
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : tab.disabled
                      ? 'border-transparent text-gray-400 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className={`grid grid-cols-1 gap-6 ${activeTab === 'summary' && summary ? 'lg:grid-cols-4' : ''}`}>
        <div className={activeTab === 'summary' && summary ? 'lg:col-span-3' : ''}>
          {activeTab === 'transcription' && transcription && (
            <div className="space-y-6">
              {/* Audio Player */}
              <AudioPlayer
                audioUrl={audioFile.fileUrl}
                duration={audioFile.durationSeconds}
                onTimeUpdate={setCurrentTime}
                highlightingEnabled={highlightingEnabled}
                onToggleHighlighting={() => setHighlightingEnabled(!highlightingEnabled)}
                seekTime={seekTime}
              />
              
              {/* Transcription Editor */}
              <TranscriptionEditor
                transcription={transcription}
                isEditing={isEditing}
                onSave={(updatedText) => {
                  setIsEditing(false)
                }}
                onToggleEdit={() => setIsEditing(!isEditing)}
                currentTime={currentTime}
                highlightingEnabled={highlightingEnabled}
                onSeek={handleSeek}
                audioDuration={audioFile.durationSeconds}
              />
            </div>
          )}
          
          {activeTab === 'summary' && summary && (
            <SummaryViewer summary={summary} />
          )}

          {activeTab === 'elaboration' && elaboration && (
            <ElaborationViewer elaboration={elaboration} />
          )}

          {activeTab === 'concept-map' && conceptMap && (
            <ConceptMapViewer conceptMap={conceptMap} />
          )}

          {activeTab === 'quiz' && quiz && (
            <QuizViewer quiz={quiz} />
          )}
          
          {activeTab === 'annotations' && transcription && (
            <AnnotationsPanel
              transcriptionId={transcription.id}
              transcriptionText={transcription.cleanText}
            />
          )}
        </div>

        {/* Sidebar - visibile solo per la sintesi strutturata */}
        {activeTab === 'summary' && summary && (
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">


              {/* Stats */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiche</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Concetti chiave:</span>
                    <span className="font-medium">{summary.sections.keyConcepts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Definizioni:</span>
                    <span className="font-medium">{summary.sections.definitions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date importanti:</span>
                    <span className="font-medium">{summary.sections.dates.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Domande:</span>
                    <span className="font-medium">{summary.sections.qna.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && summary && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          audioFile={audioFile}
          summary={summary}
        />
      )}

      {/* Modal conferma eliminazione */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Conferma Eliminazione
            </h3>
            <p className="text-gray-600 mb-6">
              Sei sicuro di voler eliminare la lezione "<strong>{audioFile.fileName}</strong>"? 
              Questa azione non può essere annullata.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annulla
              </button>
              <button
                onClick={handleDeleteLesson}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}