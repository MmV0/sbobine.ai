'use client'

import React, { useState, useEffect } from 'react'
import { Transcription } from '@/types'
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface TranscriptionEditorProps {
  transcription: Transcription
  isEditing: boolean
  onSave: (updatedText: string) => void
  onToggleEdit?: () => void
  currentTime?: number
  highlightingEnabled?: boolean
  onSeek?: (time: number) => void
  audioDuration?: number
}

export default function TranscriptionEditor({ 
  transcription, 
  isEditing, 
  onSave,
  onToggleEdit,
  currentTime = 0,
  highlightingEnabled = false,
  onSeek,
  audioDuration = 1800
}: TranscriptionEditorProps) {
  const [editedText, setEditedText] = useState(transcription.cleanText)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setEditedText(transcription.cleanText)
    setHasChanges(false)
  }, [transcription.cleanText])

  const handleTextChange = (value: string) => {
    setEditedText(value)
    setHasChanges(value !== transcription.cleanText)
  }

  const handleSave = () => {
    onSave(editedText)
    setHasChanges(false)
  }

  const handleCancel = () => {
    setEditedText(transcription.cleanText)
    setHasChanges(false)
  }

  // Simula la formattazione del testo con timestamp e highlighting
  const formatTextWithTimestamps = (text: string) => {
    const sentences = text.split('. ')
    
    return sentences.map((sentence, index) => {
      if (!sentence.trim()) return null
      
      // Calcola timestamp per ogni frase basato sulla posizione nel testo
      const startTime = (index / sentences.length) * audioDuration
      const endTime = ((index + 1) / sentences.length) * audioDuration
      const timestamp = Math.floor(startTime)
      const minutes = Math.floor(timestamp / 60)
      const seconds = timestamp % 60
      
      // Determina se questa frase dovrebbe essere evidenziata
      const isCurrentSentence = highlightingEnabled && 
        currentTime >= startTime && 
        currentTime < endTime
      
      const isNearCurrentSentence = highlightingEnabled &&
        Math.abs(currentTime - startTime) < 10 // 10 secondi di tolleranza
      
      return (
        <div 
          key={index} 
          className={`mb-4 group transition-all duration-300 ${
            isCurrentSentence ? 'bg-yellow-50 border-l-4 border-yellow-400 pl-4 py-2 rounded-r-lg' : ''
          }`}
        >
          <div className="flex items-start space-x-3">
            <button
              className={`text-xs font-mono mt-1 min-w-[50px] text-left hover:text-primary-600 transition-colors ${
                isCurrentSentence ? 'text-yellow-600 font-medium' : 'text-gray-400'
              }`}
              onClick={() => {
                onSeek?.(timestamp)
              }}
            >
              {minutes}:{seconds.toString().padStart(2, '0')}
            </button>
            <p className={`leading-relaxed flex-1 transition-all duration-300 ${
              isCurrentSentence ? 'text-gray-900 font-medium' : 
              isNearCurrentSentence ? 'text-gray-800' : 'text-gray-700'
            }`}>
              <span className={highlightingEnabled && isCurrentSentence ? 'text-highlighted-active' : ''}>
                {sentence.trim()}{index < sentences.length - 1 ? '.' : ''}
              </span>
            </p>
          </div>
        </div>
      )
    }).filter(Boolean)
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Trascrizione</h2>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <span className="text-xs text-orange-600">Modifiche non salvate</span>
          )}
          {isEditing && hasChanges && (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:text-green-700"
              >
                <CheckIcon className="h-5 w-5" />
              </button>
            </div>
          )}
          {onToggleEdit && (
            <button
              onClick={onToggleEdit}
              className={`btn-secondary text-sm ${isEditing ? 'bg-yellow-100 border-yellow-300' : ''}`}
            >
              {isEditing ? 'Salva e Chiudi' : 'Modifica'}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">

        {/* Contenuto trascrizione */}
        {isEditing ? (
          <div>
            <textarea
              value={editedText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              placeholder="Modifica la trascrizione..."
            />
            <div className="mt-2 flex justify-between items-center text-sm text-gray-600">
              <span>{editedText.length} caratteri</span>
              {hasChanges && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleSave}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Salva modifiche
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-2">
              {formatTextWithTimestamps(editedText)}
            </div>
          </div>
        )}


      </div>
    </div>
  )
}
