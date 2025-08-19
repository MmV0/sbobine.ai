'use client'

import React, { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  ArrowDownTrayIcon,
  DocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { AudioFile, Summary } from '@/types'
import { formatDuration, formatDate } from '@/utils/formatters'
import LoadingSpinner from './LoadingSpinner'
import { generatePDF, generateMarkdown } from '@/utils/exportHelpers'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  audioFile: AudioFile
  summary: Summary
}

export default function ExportModal({ 
  isOpen, 
  onClose, 
  audioFile, 
  summary 
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'markdown'>('pdf')
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)
  const [includeOptions, setIncludeOptions] = useState({
    overview: true,
    keyConcepts: true,
    definitions: true,
    dates: true,
    qna: true,
    metadata: true
  })

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Simula il processo di export
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const exportData = {
        audioFile,
        summary,
        includeOptions,
        exportDate: new Date().toISOString()
      }

      if (selectedFormat === 'pdf') {
        await generatePDF(exportData)
      } else {
        generateMarkdown(exportData)
      }

      setExportComplete(true)
      
      // Chiudi il modal dopo 2 secondi
      setTimeout(() => {
        setExportComplete(false)
        onClose()
      }, 2000)
      
    } catch (error) {
      console.error('Errore durante l\'export:', error)
      alert('Errore durante l\'export. Riprova.')
    } finally {
      setIsExporting(false)
    }
  }

  const resetModal = () => {
    setExportComplete(false)
    setIsExporting(false)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                
                {exportComplete ? (
                  // Success State
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <CheckIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <Dialog.Title className="text-lg font-medium text-gray-900 mb-2">
                      Export Completato!
                    </Dialog.Title>
                    <p className="text-sm text-gray-600">
                      Il file è stato scaricato con successo.
                    </p>
                  </div>
                ) : (
                  // Export Configuration
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        Esporta Riassunto
                      </Dialog.Title>
                      <button
                        onClick={() => {
                          resetModal()
                          onClose()
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* File Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">{audioFile.fileName}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Durata: {formatDuration(audioFile.durationSeconds)}</p>
                        <p>Creato: {formatDate(audioFile.createdAt)}</p>
                        <p>Lingua: {audioFile.language.toUpperCase()}</p>
                      </div>
                    </div>

                    {/* Format Selection */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Formato di Export</h4>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="pdf"
                            checked={selectedFormat === 'pdf'}
                            onChange={() => setSelectedFormat('pdf')}
                            className="mr-3"
                          />
                          <DocumentTextIcon className="h-5 w-5 mr-2 text-red-500" />
                          <div>
                            <span className="text-sm font-medium">PDF</span>
                            <p className="text-xs text-gray-500">Documento formattato pronto per la stampa</p>
                          </div>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="markdown"
                            checked={selectedFormat === 'markdown'}
                            onChange={() => setSelectedFormat('markdown')}
                            className="mr-3"
                          />
                          <DocumentIcon className="h-5 w-5 mr-2 text-blue-500" />
                          <div>
                            <span className="text-sm font-medium">Markdown</span>
                            <p className="text-xs text-gray-500">Formato testo per editing e condivisione</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Content Options */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Contenuto da Includere</h4>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={includeOptions.overview}
                            onChange={(e) => setIncludeOptions(prev => ({ 
                              ...prev, 
                              overview: e.target.checked 
                            }))}
                            className="mr-3"
                          />
                          <span className="text-sm">Panoramica</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={includeOptions.keyConcepts}
                            onChange={(e) => setIncludeOptions(prev => ({ 
                              ...prev, 
                              keyConcepts: e.target.checked 
                            }))}
                            className="mr-3"
                          />
                          <span className="text-sm">
                            Concetti chiave ({summary.sections.keyConcepts.length})
                          </span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={includeOptions.definitions}
                            onChange={(e) => setIncludeOptions(prev => ({ 
                              ...prev, 
                              definitions: e.target.checked 
                            }))}
                            className="mr-3"
                          />
                          <span className="text-sm">
                            Definizioni ({summary.sections.definitions.length})
                          </span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={includeOptions.dates}
                            onChange={(e) => setIncludeOptions(prev => ({ 
                              ...prev, 
                              dates: e.target.checked 
                            }))}
                            className="mr-3"
                          />
                          <span className="text-sm">
                            Date importanti ({summary.sections.dates.length})
                          </span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={includeOptions.qna}
                            onChange={(e) => setIncludeOptions(prev => ({ 
                              ...prev, 
                              qna: e.target.checked 
                            }))}
                            className="mr-3"
                          />
                          <span className="text-sm">
                            Domande e risposte ({summary.sections.qna.length})
                          </span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={includeOptions.metadata}
                            onChange={(e) => setIncludeOptions(prev => ({ 
                              ...prev, 
                              metadata: e.target.checked 
                            }))}
                            className="mr-3"
                          />
                          <span className="text-sm">Metadati del file</span>
                        </label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          resetModal()
                          onClose()
                        }}
                        className="flex-1 btn-secondary"
                        disabled={isExporting}
                      >
                        Annulla
                      </button>
                      <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex-1 btn-primary flex items-center justify-center"
                      >
                        {isExporting ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Esportando...
                          </>
                        ) : (
                          <>
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                            Esporta {selectedFormat.toUpperCase()}
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
