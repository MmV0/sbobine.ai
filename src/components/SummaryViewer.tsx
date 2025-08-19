'use client'

import React from 'react'
import { Summary } from '@/types'
import { 
  EyeIcon,
  LightBulbIcon,
  BookOpenIcon,
  CalendarIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

interface SummaryViewerProps {
  summary: Summary
}

export default function SummaryViewer({ summary }: SummaryViewerProps) {
  const { sections } = summary

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Riassunto Strutturato</h2>
          <div className="text-sm text-gray-500">
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <EyeIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Panoramica</h3>
              <p className="text-blue-800 leading-relaxed">{sections.overview}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Concetti Chiave */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <LightBulbIcon className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Concetti Chiave
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sections.keyConcepts.map((concept, index) => (
            <div key={index} className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center space-x-2">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <span className="text-yellow-900 font-medium">{concept}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Definizioni */}
      {sections.definitions.length > 0 && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpenIcon className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Definizioni
            </h3>
          </div>
          
          <div className="space-y-4">
            {sections.definitions.map((definition, index) => (
              <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">{definition.term}</h4>
                <p className="text-green-800 leading-relaxed">{definition.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Date Importanti */}
      {sections.dates.length > 0 && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <CalendarIcon className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Date Importanti
            </h3>
          </div>
          
          <div className="space-y-3">
            {sections.dates.map((dateItem, index) => (
              <div key={index} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 bg-purple-600 text-white text-sm px-2 py-1 rounded font-medium">
                    {dateItem.date}
                  </span>
                  <span className="text-purple-900">{dateItem.event}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Domande e Risposte */}
      {sections.qna.length > 0 && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Domande e Risposte
            </h3>
          </div>
          
          <div className="space-y-4">
            {sections.qna.map((qna, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3 mb-3">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <h4 className="font-semibold text-blue-900">{qna.question}</h4>
                </div>
                <div className="flex items-start space-x-3 ml-8">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-800 leading-relaxed">{qna.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadati */}
      <div className="card bg-gray-50">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Informazioni di Generazione</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Modello:</span>
            <span className="ml-2 font-medium">{summary.modelUsed}</span>
          </div>
          <div>
            <span className="text-gray-600">Stile:</span>
            <span className="ml-2 font-medium capitalize">{summary.style}</span>
          </div>
          <div>
            <span className="text-gray-600">Generato:</span>
            <span className="ml-2 font-medium">
              {new Date(summary.createdAt).toLocaleString('it-IT')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
