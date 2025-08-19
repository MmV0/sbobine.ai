'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/providers/AuthProvider'
import { useMockData } from '@/hooks/useMockData'
import LoadingSpinner from './LoadingSpinner'
import { formatDuration, formatFileSize } from '@/utils/formatters'
import PaymentModal from './PaymentModal'
import AudioProcessingAPI, { TranscriptionJob } from '@/services/api'

interface UploadSectionProps {
  onUploadComplete: () => void
  onRefreshData?: () => void
}

interface FileWithPreview extends File {
  preview?: string
  duration?: number
}

export default function UploadSection({ onUploadComplete, onRefreshData }: UploadSectionProps) {
  const { user } = useAuth()
  const { addAudioFile, updateAudioFile, saveTranscription, saveSummary } = useMockData()
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [estimatedCost, setEstimatedCost] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState('it')
  const [processingStatus, setProcessingStatus] = useState<string>('')
  const [processingProgress, setProcessingProgress] = useState<number>(0)
  const [currentJob, setCurrentJob] = useState<TranscriptionJob | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const audioFiles = acceptedFiles.filter(file => 
      file.type.startsWith('audio/') || 
      ['mp3', 'wav', 'm4a', 'aac', 'ogg'].some(ext => file.name.toLowerCase().endsWith(ext))
    )

    if (audioFiles.length !== acceptedFiles.length) {
      alert('Alcuni file non sono stati accettati. Sono supportati solo file audio (MP3, WAV, M4A, AAC, OGG).')
    }

    const filesWithPreview = audioFiles.map(file => {
      const audioFile = file as FileWithPreview
      // Simula la durata del file basata sulla dimensione
      audioFile.duration = Math.floor(file.size / 100000) + Math.random() * 1800 // Simulazione
      return audioFile
    })

    setSelectedFiles(prev => [...prev, ...filesWithPreview])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg']
    },
    maxSize: 200 * 1024 * 1024, // 200MB
    multiple: true
  })

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const calculateCost = () => {
    const totalDuration = selectedFiles.reduce((sum, file) => sum + (file.duration || 0), 0)
    const costPerMinute = 0.08 // €0.08 per minuto
    return (totalDuration / 60) * costPerMinute
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    const cost = calculateCost()
    const totalDuration = selectedFiles.reduce((sum, file) => sum + (file.duration || 0), 0)

    // MODALITÀ TEST: Salta il controllo pagamenti per ora
    // Simula sempre che l'utente abbia il trial disponibile
    const canUseTrial = true // Forza sempre il trial per i test
    
    // Commentiamo temporaneamente il controllo pagamenti
    // if (!canUseTrial && !user?.hasPaymentMethod) {
    //   setEstimatedCost(cost)
    //   setShowPaymentModal(true)
    //   return
    // }

    setIsUploading(true)
    setProcessingStatus('Aggiunta file alla libreria...')
    setProcessingProgress(0)

    // Array per tenere traccia dei file aggiunti
    const addedFileIds: string[] = []

    try {
      // STEP 1: Aggiungi immediatamente tutti i file alla lista con stato "UPLOADED"
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        
        const audioFile = addAudioFile({
          userId: user?.id || '',
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          durationSeconds: file.duration || 0,
          status: 'UPLOADED', // Stato iniziale
          language: selectedLanguage,
        })
        
        addedFileIds.push(audioFile.id)
        
        // Avvia immediatamente il processing in background per questo file
        processFileInBackground(file, audioFile.id, selectedLanguage, updateAudioFile, saveTranscription, saveSummary)
      }

      // STEP 2: Passa immediatamente alla vista "Le mie lezioni"
      setProcessingStatus('File aggiunti! Elaborazione in corso in background...')
      setProcessingProgress(100)
      
      // Breve delay per dare feedback visivo
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setSelectedFiles([])
      setProcessingStatus('')
      setProcessingProgress(0)
      setCurrentJob(null)
      
      // Invia evento per forzare refresh in tutto l'app
      window.dispatchEvent(new CustomEvent('refreshAudioFiles'))
      
      // Chiama refresh se disponibile
      if (onRefreshData) {
        onRefreshData()
      }
      
      onUploadComplete()
      
    } catch (error) {
      console.error('Errore generale nell\'upload:', error)
      alert(`Errore durante l'upload: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
      
      // Rimuovi i file che potrebbero essere stati aggiunti in caso di errore
      addedFileIds.forEach(fileId => {
        updateAudioFile(fileId, { status: 'ERROR' })
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Nuova funzione per processare in background
    const processFileInBackground = async (
    file: FileWithPreview,
    fileId: string,
    language: string,
    updateFileFn: typeof updateAudioFile,
    saveTranscriptionFn: typeof saveTranscription,
    saveSummaryFn: typeof saveSummary
  ) => {
    
    // Funzione helper per aggiornare direttamente il localStorage
    const updateFileInStorage = (id: string, updates: any) => {
      try {
        const currentData = localStorage.getItem('sbobine_audio_files')
        if (!currentData) return
        
        const files = JSON.parse(currentData)
        const updatedFiles = files.map((file: any) =>
          file.id === id
            ? { ...file, ...updates, updatedAt: new Date().toISOString() }
            : file
        )
        
        localStorage.setItem('sbobine_audio_files', JSON.stringify(updatedFiles))
        
        // Forza anche l'update tramite hook
        updateFileFn(id, updates)
        
        // Trigger evento globale per refresh
        window.dispatchEvent(new CustomEvent('refreshAudioFiles'))
      } catch (error) {
        console.error('❌ Errore aggiornamento storage:', error)
      }
    }
    try {
      // Aggiorna stato a PROCESSING
      updateFileInStorage(fileId, { status: 'PROCESSING' })
      
      // Avvia il processo completo (trascrizione + riassunto)
      const job = await AudioProcessingAPI.processAudioFile(
        file, 
        language, 
        user?.id || ''
      )
      
      // Monitora il progresso del job
      const completedJob = await AudioProcessingAPI.pollJobStatus(
        job.jobId,
        (updatedJob) => {
          // Mappa gli stati del job agli stati dell'AudioFile
          let status: 'UPLOADED' | 'PROCESSING' | 'TRANSCRIBED' | 'SUMMARIZING' | 'READY' | 'ERROR' = 'PROCESSING'
          
          switch (updatedJob.status) {
            case 'TRANSCRIBING':
              status = 'PROCESSING'
              break
            case 'SUMMARIZING':
            case 'ELABORATING':
            case 'GENERATING_MAP':
            case 'GENERATING_QUIZ':
              status = 'SUMMARIZING'
              break
            case 'COMPLETED':
              status = 'READY'
              break
            case 'ERROR':
              status = 'ERROR'
              break
          }
          
          // Aggiorna il file nella lista in real-time
          updateFileInStorage(fileId, { status })
        }
      )

      if (completedJob.result) {
        // Aggiorna il file con i dati finali
        updateFileInStorage(fileId, {
          status: 'READY',
          durationSeconds: completedJob.result.transcription.duration
        })

        // Salva tutti i risultati generati
        saveTranscriptionFn(fileId, completedJob.result.transcription)
        saveSummaryFn(completedJob.result.transcription.id, completedJob.result.summary)
        
        // Salva i nuovi contenuti nel localStorage per la demo
        if (completedJob.result.elaboration) {
          const elaborations = JSON.parse(localStorage.getItem('sbobine_elaborations') || '{}')
          elaborations[completedJob.result.transcription.id] = completedJob.result.elaboration
          localStorage.setItem('sbobine_elaborations', JSON.stringify(elaborations))
        }
        
        if (completedJob.result.conceptMap) {
          const conceptMaps = JSON.parse(localStorage.getItem('sbobine_concept_maps') || '{}')
          conceptMaps[completedJob.result.transcription.id] = completedJob.result.conceptMap
          localStorage.setItem('sbobine_concept_maps', JSON.stringify(conceptMaps))
        }
        
        if (completedJob.result.quiz) {
          const quizzes = JSON.parse(localStorage.getItem('sbobine_quizzes') || '{}')
          quizzes[completedJob.result.transcription.id] = completedJob.result.quiz
          localStorage.setItem('sbobine_quizzes', JSON.stringify(quizzes))
        }

      } else {
        // Nessun risultato - imposta errore
        updateFileInStorage(fileId, { status: 'ERROR' })
      }

    } catch (error) {
      console.error(`Errore nell'elaborazione background di ${file.name}:`, error)
      updateFileInStorage(fileId, { status: 'ERROR' })
    }
  }

  const handlePaymentComplete = () => {
    setShowPaymentModal(false)
    handleUpload()
  }

  const totalDuration = selectedFiles.reduce((sum, file) => sum + (file.duration || 0), 0)
  const canUseTrial = !user?.trialUsed && totalDuration <= 600
  const cost = calculateCost()

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Carica una nuova registrazione
        </h2>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-lg text-primary-600">Rilascia i file qui...</p>
          ) : (
            <div>
              <p className="text-lg text-gray-600 mb-2">
                Trascina i file audio qui o <span className="text-primary-600 font-medium">clicca per scegliere</span>
              </p>
              <p className="text-sm text-gray-500">
                Supportati: MP3, WAV, M4A, AAC, OGG (max 200MB per file)
              </p>
            </div>
          )}
        </div>

        {/* Language Selection */}
        <div className="mt-4">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
            Lingua della registrazione
          </label>
          <select
            id="language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="input-field w-48"
          >
            <option value="it">Italiano</option>
            <option value="en">Inglese</option>
            <option value="es">Spagnolo</option>
            <option value="fr">Francese</option>
            <option value="de">Tedesco</option>
          </select>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            File selezionati ({selectedFiles.length})
          </h3>
          
          <div className="space-y-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • ~{formatDuration(file.duration || 0)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Cost Estimation */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Durata totale: {formatDuration(totalDuration)}
                </p>
                <p className="text-sm text-green-600">
                  ✅ Modalità Test - Elaborazione Gratuita
                </p>
                <p className="text-xs text-gray-500">
                  Costo reale stimato: €{cost.toFixed(2)} (OpenAI API)
                </p>
              </div>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="btn-primary flex items-center"
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Caricamento...
                  </>
                ) : (
                  'Avvia Trascrizione'
                )}
              </button>
            </div>

            <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
              <p className="text-xs text-green-700">
                🧪 <strong>Modalità Test Attiva</strong> - Nessun pagamento richiesto
              </p>
            </div>

            {/* Progress Display */}
            {isUploading && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    {processingStatus}
                  </span>
                  <span className="text-sm text-blue-700">
                    {processingProgress}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
                {currentJob && (
                  <p className="text-xs text-blue-600 mt-2">
                    Job ID: {currentJob.jobId}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handlePaymentComplete}
          estimatedCost={estimatedCost}
          duration={totalDuration}
        />
      )}
    </div>
  )
}
