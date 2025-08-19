'use client'

import React, { useState } from 'react'
import { ConceptMap } from '@/types'
import InteractiveConceptMap from './InteractiveConceptMap'

interface ConceptMapViewerProps {
  conceptMap: ConceptMap
}

export default function ConceptMapViewer({ conceptMap }: ConceptMapViewerProps) {
  const [viewMode, setViewMode] = useState<'simple' | 'interactive'>('interactive')
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'main':
        return 'bg-blue-600 text-white'
      case 'secondary':
        return 'bg-green-500 text-white'
      case 'detail':
        return 'bg-yellow-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getConnectionColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'border-blue-600'
      case 'medium':
        return 'border-green-500'
      case 'weak':
        return 'border-yellow-500'
      default:
        return 'border-gray-400'
    }
  }

  // Se la modalità è interattiva, usa il componente InteractiveConceptMap
  if (viewMode === 'interactive') {
    return <InteractiveConceptMap conceptMap={conceptMap} />
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Mappa Concettuale</h2>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'interactive'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Interattiva
            </button>
            <button
              onClick={() => setViewMode('simple')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'simple'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semplice
            </button>
          </div>

        </div>
      </div>

      <div className="bg-purple-50 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">🗺️</span>
          </div>
          <div>
            <h3 className="font-medium text-purple-900 mb-2">Argomento Centrale</h3>
            <p className="text-lg font-semibold text-purple-800">
              {conceptMap.centralTopic}
            </p>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Legenda</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-blue-600"></div>
            <span>Concetto Principale</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span>Concetto Secondario</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-yellow-500"></div>
            <span>Dettaglio</span>
          </div>
        </div>
      </div>

      {/* Visualizzazione semplificata dei nodi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {conceptMap.nodes.map((node) => (
          <div
            key={node.id}
            className="p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mb-2 ${getNodeColor(node.type)}`}>
              {node.type === 'main' ? '🎯' : node.type === 'secondary' ? '📍' : '💡'} {node.label}
            </div>
            <p className="text-sm text-gray-600">{node.description}</p>
          </div>
        ))}
      </div>

      {/* Connessioni */}
      {conceptMap.connections.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Collegamenti</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {conceptMap.connections.map((connection, index) => {
              const fromNode = conceptMap.nodes.find(n => n.id === connection.from)
              const toNode = conceptMap.nodes.find(n => n.id === connection.to)
              
              if (!fromNode || !toNode) return null
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded border-l-4 bg-gray-50 ${getConnectionColor(connection.strength)}`}
                >
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium text-gray-800">{fromNode.label}</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-blue-600 font-medium">{connection.label}</span>
                    <span className="text-gray-500">→</span>
                    <span className="font-medium text-gray-800">{toNode.label}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Intensità: {connection.strength === 'strong' ? 'Forte' : connection.strength === 'medium' ? 'Media' : 'Debole'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}


    </div>
  )
}
