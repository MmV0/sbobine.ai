'use client'

import React, { useState, useEffect } from 'react'
import { Annotation } from '@/types'
import { 
  PlusIcon,
  BookmarkIcon,
  XMarkIcon,
  PencilIcon,
  CheckIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/providers/AuthProvider'
import { formatDate } from '@/utils/formatters'

interface AnnotationsPanelProps {
  transcriptionId: string
  transcriptionText: string
}

export default function AnnotationsPanel({ 
  transcriptionId, 
  transcriptionText 
}: AnnotationsPanelProps) {
  const { user } = useAuth()
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAnnotation, setNewAnnotation] = useState('')
  const [selectedPosition, setSelectedPosition] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  // Carica le annotazioni salvate
  useEffect(() => {
    const savedAnnotations = localStorage.getItem(`annotations_${transcriptionId}`)
    if (savedAnnotations) {
      setAnnotations(JSON.parse(savedAnnotations))
    } else {
      // Aggiungi alcune annotazioni di esempio
      const sampleAnnotations: Annotation[] = [
        {
          id: '1',
          transcriptionId,
          userId: user?.id || '',
          content: 'Concetto importante da rivedere per l\'esame',
          position: 150,
          timestamp: 45,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          transcriptionId,
          userId: user?.id || '',
          content: 'Collegare questo argomento con la lezione precedente',
          position: 320,
          timestamp: 120,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]
      setAnnotations(sampleAnnotations)
      localStorage.setItem(`annotations_${transcriptionId}`, JSON.stringify(sampleAnnotations))
    }
  }, [transcriptionId, user?.id])

  const saveAnnotations = (updatedAnnotations: Annotation[]) => {
    setAnnotations(updatedAnnotations)
    localStorage.setItem(`annotations_${transcriptionId}`, JSON.stringify(updatedAnnotations))
  }

  const handleAddAnnotation = () => {
    if (!newAnnotation.trim()) return

    const annotation: Annotation = {
      id: Date.now().toString(),
      transcriptionId,
      userId: user?.id || '',
      content: newAnnotation.trim(),
      position: selectedPosition,
      timestamp: Math.floor(selectedPosition / 10), // Stima timestamp basata sulla posizione
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedAnnotations = [...annotations, annotation].sort((a, b) => a.position - b.position)
    saveAnnotations(updatedAnnotations)
    
    setNewAnnotation('')
    setShowAddForm(false)
    setSelectedPosition(0)
  }

  const handleEditAnnotation = (id: string, newContent: string) => {
    const updatedAnnotations = annotations.map(annotation =>
      annotation.id === id
        ? { ...annotation, content: newContent, updatedAt: new Date().toISOString() }
        : annotation
    )
    saveAnnotations(updatedAnnotations)
    setEditingId(null)
    setEditingText('')
  }

  const handleDeleteAnnotation = (id: string) => {
    const updatedAnnotations = annotations.filter(annotation => annotation.id !== id)
    saveAnnotations(updatedAnnotations)
  }

  const getContextText = (position: number, length = 50) => {
    const start = Math.max(0, position - length)
    const end = Math.min(transcriptionText.length, position + length)
    return transcriptionText.slice(start, end)
  }

  const highlightText = (text: string, position: number) => {
    const words = text.split(' ')
    const wordPosition = Math.floor(position / (transcriptionText.length / words.length))
    
    return words.map((word, index) => (
      <span
        key={index}
        className={index === wordPosition ? 'bg-yellow-200 px-1 rounded' : ''}
      >
        {word}{' '}
      </span>
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Annotazioni ({annotations.length})
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Aggiungi
          </button>
        </div>

        {/* Istruzioni */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ChatBubbleLeftIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Come aggiungere annotazioni:</p>
              <p>Seleziona una posizione nel testo sottostante e clicca "Aggiungi" per creare una nuova annotazione.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form per nuova annotazione */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Nuova Annotazione</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posizione nel testo (carattere {selectedPosition})
              </label>
              <input
                type="range"
                min="0"
                max={transcriptionText.length}
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(Number(e.target.value))}
                className="w-full"
              />
              <div className="mt-2 p-3 bg-gray-100 rounded text-sm">
                <span className="text-gray-600">Contesto: "</span>
                <span>{highlightText(getContextText(selectedPosition), selectedPosition)}</span>
                <span className="text-gray-600">"</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nota
              </label>
              <textarea
                value={newAnnotation}
                onChange={(e) => setNewAnnotation(e.target.value)}
                placeholder="Scrivi la tua annotazione..."
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewAnnotation('')
                  setSelectedPosition(0)
                }}
                className="btn-secondary"
              >
                Annulla
              </button>
              <button
                onClick={handleAddAnnotation}
                disabled={!newAnnotation.trim()}
                className="btn-primary"
              >
                Salva Annotazione
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista annotazioni */}
      {annotations.length > 0 ? (
        <div className="space-y-4">
          {annotations.map((annotation) => (
            <div key={annotation.id} className="card bg-yellow-50 border-yellow-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <BookmarkIcon className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-yellow-800 font-medium">
                    Posizione: {annotation.position}
                    {annotation.timestamp && ` • ${Math.floor(annotation.timestamp / 60)}:${(annotation.timestamp % 60).toString().padStart(2, '0')}`}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingId(annotation.id)
                      setEditingText(annotation.content)
                    }}
                    className="p-1 text-yellow-600 hover:text-yellow-700"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAnnotation(annotation.id)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Contesto */}
              <div className="mb-3 p-2 bg-white rounded text-sm">
                <span className="text-gray-600">Contesto: "</span>
                <span>{highlightText(getContextText(annotation.position), annotation.position)}</span>
                <span className="text-gray-600">"</span>
              </div>

              {/* Contenuto annotazione */}
              {editingId === annotation.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full h-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setEditingText('')
                      }}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Annulla
                    </button>
                    <button
                      onClick={() => handleEditAnnotation(annotation.id, editingText)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Salva
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-yellow-900 mb-2">{annotation.content}</p>
                  <p className="text-xs text-yellow-700">
                    Creato: {formatDate(annotation.createdAt)}
                    {annotation.updatedAt !== annotation.createdAt && (
                      <span> • Modificato: {formatDate(annotation.updatedAt)}</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-8">
          <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessuna annotazione
          </h3>
          <p className="text-gray-500 mb-4">
            Aggiungi delle note per evidenziare i punti importanti della trascrizione.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Aggiungi Prima Annotazione
          </button>
        </div>
      )}
    </div>
  )
}
