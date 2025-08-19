'use client'

import React, { useCallback, useMemo, useState } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  ConnectionLineType,
  MarkerType,
  NodeChange,
  EdgeChange,
} from '@xyflow/react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import '@xyflow/react/dist/style.css'
import { ConceptMap } from '@/types'

interface InteractiveConceptMapProps {
  conceptMap: ConceptMap
}

export default function InteractiveConceptMap({ conceptMap }: InteractiveConceptMapProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [showInstructions, setShowInstructions] = useState(() => {
    return !localStorage.getItem('concept_map_instructions_hidden')
  })
  // Converti i nodi della mappa concettuale in nodi React Flow
  const initialNodes: Node[] = useMemo(() => {
    const baseY = 100
    const nodeSpacing = 200
    const levelSpacing = 150
    
    // Raggruppa i nodi per tipo
    const mainNodes = conceptMap.nodes.filter(n => n.type === 'main')
    const secondaryNodes = conceptMap.nodes.filter(n => n.type === 'secondary')
    const detailNodes = conceptMap.nodes.filter(n => n.type === 'detail')
    
    const nodes: Node[] = []
    
    // Nodo centrale (main)
    mainNodes.forEach((node, index) => {
      nodes.push({
        id: node.id,
        type: 'default',
        position: { x: 400, y: baseY },
        data: { 
          label: (
            <div className="p-2 text-center w-full h-full flex flex-col justify-center">
              <div className="font-bold text-xs leading-tight truncate">{node.label}</div>
              <div className="text-xs opacity-80 mt-1 line-clamp-2 text-ellipsis overflow-hidden">
                {node.description}
              </div>
            </div>
          ),
          originalLabel: node.label,
          originalDescription: node.description,
          nodeType: node.type
        },
        style: {
          background: '#3B82F6',
          color: 'white',
          border: '2px solid #1E40AF',
          borderRadius: '12px',
          width: 180,
          height: 80,
          fontSize: '12px',
          fontWeight: 'bold',
          padding: 0,
          overflow: 'hidden',
        },
      })
    })
    
    // Nodi secondari (disposti in cerchio attorno al centrale)
    secondaryNodes.forEach((node, index) => {
      const angle = (index * 2 * Math.PI) / secondaryNodes.length
      const radius = 250
      const x = 400 + radius * Math.cos(angle)
      const y = baseY + radius * Math.sin(angle)
      
      nodes.push({
        id: node.id,
        type: 'default',
        position: { x: x - 75, y: y - 30 },
        data: { 
          label: (
            <div className="p-2 text-center w-full h-full flex flex-col justify-center">
              <div className="font-semibold text-xs leading-tight truncate">{node.label}</div>
              <div className="text-xs opacity-80 mt-1 line-clamp-2 text-ellipsis overflow-hidden">
                {node.description}
              </div>
            </div>
          ),
          originalLabel: node.label,
          originalDescription: node.description,
          nodeType: node.type
        },
        style: {
          background: '#10B981',
          color: 'white',
          border: '2px solid #047857',
          borderRadius: '10px',
          width: 150,
          height: 70,
          fontSize: '11px',
          padding: 0,
          overflow: 'hidden',
        },
      })
    })
    
    // Nodi di dettaglio (posizionati attorno ai secondari)
    detailNodes.forEach((node, index) => {
      const x = 100 + (index * 200)
      const y = baseY + levelSpacing * 2
      
      nodes.push({
        id: node.id,
        type: 'default',
        position: { x, y },
        data: { 
          label: (
            <div className="p-2 text-center w-full h-full flex flex-col justify-center">
              <div className="font-medium text-xs leading-tight truncate">{node.label}</div>
              <div className="text-xs opacity-80 mt-1 line-clamp-2 text-ellipsis overflow-hidden">
                {node.description}
              </div>
            </div>
          ),
          originalLabel: node.label,
          originalDescription: node.description,
          nodeType: node.type
        },
        style: {
          background: '#F59E0B',
          color: 'white',
          border: '2px solid #D97706',
          borderRadius: '8px',
          width: 130,
          height: 60,
          fontSize: '10px',
          padding: 0,
          overflow: 'hidden',
        },
      })
    })
    
    return nodes
  }, [conceptMap.nodes])

  // Converti le connessioni in edges React Flow
  const initialEdges: Edge[] = useMemo(() => {
    return conceptMap.connections.map((connection, index) => ({
      id: `edge-${index}`,
      source: connection.from,
      target: connection.to,
      label: connection.label,
      type: 'smoothstep',
      style: {
        stroke: connection.strength === 'strong' ? '#3B82F6' : 
               connection.strength === 'medium' ? '#10B981' : '#F59E0B',
        strokeWidth: connection.strength === 'strong' ? 3 : 
                    connection.strength === 'medium' ? 2 : 1,
      },
      labelStyle: {
        fontSize: '10px',
        fontWeight: 'bold',
        background: 'white',
        padding: '2px 6px',
        borderRadius: '4px',
        border: '1px solid #e5e7eb',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: connection.strength === 'strong' ? '#3B82F6' : 
               connection.strength === 'medium' ? '#10B981' : '#F59E0B',
      },
    }))
  }, [conceptMap.connections])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Funzione per gestire il double-click sui nodi (avvia editing)
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setEditingNode(node.id)
    setIsEditing(true)
  }, [])

  // Funzione per aggiornare il contenuto di un nodo
  const updateNodeContent = useCallback((nodeId: string, newLabel: string, newDescription: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const nodeType = node.data.nodeType
          let bgColor = '#6B7280'
          let borderColor = '#4B5563'
          let width = 130
          let height = 60

          if (nodeType === 'main') {
            bgColor = '#3B82F6'
            borderColor = '#1E40AF'
            width = 180
            height = 80
          } else if (nodeType === 'secondary') {
            bgColor = '#10B981'
            borderColor = '#047857'
            width = 150
            height = 70
          } else if (nodeType === 'detail') {
            bgColor = '#F59E0B'
            borderColor = '#D97706'
            width = 130
            height = 60
          }

          return {
            ...node,
            data: {
              ...node.data,
              originalLabel: newLabel,
              originalDescription: newDescription,
              label: (
                <div className="p-2 text-center w-full h-full flex flex-col justify-center">
                  <div className="font-bold text-xs leading-tight truncate">{newLabel}</div>
                  <div className="text-xs opacity-80 mt-1 line-clamp-2 text-ellipsis overflow-hidden">
                    {newDescription}
                  </div>
                </div>
              )
            },
            style: {
              ...node.style,
              background: bgColor,
              border: `2px solid ${borderColor}`,
              width,
              height,
            }
          }
        }
        return node
      })
    )
    setIsEditing(false)
    setEditingNode(null)
  }, [setNodes])

  // Funzione per annullare l'editing
  const cancelEditing = useCallback(() => {
    setIsEditing(false)
    setEditingNode(null)
  }, [])

  const hideInstructions = () => {
    setShowInstructions(false)
    localStorage.setItem('concept_map_instructions_hidden', 'true')
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Mappa Concettuale Interattiva</h2>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-gray-400 hover:text-gray-600"
          title={showInstructions ? "Nascondi istruzioni" : "Mostra istruzioni"}
        >
          <InformationCircleIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Istruzioni */}
      {showInstructions && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🗺️</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Come usare la mappa:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Naviga:</strong> Trascina per muoverti, usa la rotella per zoomare</li>
                  <li>• <strong>Modifica:</strong> Doppio click sui nodi per modificare testo e descrizione</li>
                  <li>• <strong>Controlli:</strong> Usa i pulsanti in basso a sinistra per navigare</li>
                  <li>• <strong>Minimap:</strong> Usa la mappa piccola in basso a destra per orientarti</li>
                </ul>
              </div>
            </div>
            <button
              onClick={hideInstructions}
              className="text-blue-600 hover:text-blue-800 text-sm ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Mappa interattiva - più alta */}
      <div className="h-[600px] w-full border border-gray-200 rounded-lg overflow-hidden mb-6">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          fitViewOptions={{
            padding: 0.1,
          }}
        >
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              const mainNode = conceptMap.nodes.find(n => n.id === node.id)
              if (mainNode?.type === 'main') return '#3B82F6'
              if (mainNode?.type === 'secondary') return '#10B981'
              return '#F59E0B'
            }}
            maskColor="rgb(240, 240, 240, 0.6)"
            style={{
              backgroundColor: 'white',
            }}
          />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={12} 
            size={1}
            color="#e5e7eb"
          />
        </ReactFlow>
      </div>

      {/* Legenda - sotto la mappa */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {/* Tipi di nodi */}
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded bg-blue-600 flex-shrink-0"></div>
            <span>Concetto Principale</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded bg-green-500 flex-shrink-0"></div>
            <span>Concetto Secondario</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded bg-yellow-500 flex-shrink-0"></div>
            <span>Dettaglio</span>
          </div>
          {/* Tipi di collegamenti */}
          <div className="flex items-center space-x-3">
            <div className="w-4 h-0.5 bg-blue-600 flex-shrink-0"></div>
            <span>Collegamento Forte</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-0.5 bg-green-500 flex-shrink-0"></div>
            <span>Collegamento Medio</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-0.5 bg-yellow-500 flex-shrink-0"></div>
            <span>Collegamento Debole</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-300">
          <p className="text-sm text-gray-600">
            <strong>Doppio click</strong> sui nodi per modificarne il contenuto
          </p>
        </div>
      </div>







      {/* Modal di editing */}
      {isEditing && editingNode && (
        <EditNodeModal
          node={nodes.find(n => n.id === editingNode)}
          onSave={updateNodeContent}
          onCancel={cancelEditing}
        />
      )}
    </div>
  )
}

// Componente Modal per l'editing dei nodi
interface EditNodeModalProps {
  node: Node | undefined
  onSave: (nodeId: string, label: string, description: string) => void
  onCancel: () => void
}

function EditNodeModal({ node, onSave, onCancel }: EditNodeModalProps) {
  const [label, setLabel] = useState(node?.data.originalLabel || '')
  const [description, setDescription] = useState(node?.data.originalDescription || '')

  if (!node) return null

  const handleSave = () => {
    if (label.trim()) {
      onSave(node.id, label.trim(), description.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Modifica Nodo ({node.data.nodeType === 'main' ? 'Principale' : 
                          node.data.nodeType === 'secondary' ? 'Secondario' : 'Dettaglio'})
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titolo *
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Inserisci il titolo del concetto"
              autoFocus
              maxLength={50}
            />
            <div className="text-xs text-gray-500 mt-1">
              {label.length}/50 caratteri
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrizione del concetto"
              rows={3}
              maxLength={150}
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/150 caratteri
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={!label.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salva
          </button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          Premi <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl + Enter</kbd> per salvare o <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> per annullare
        </div>
      </div>
    </div>
  )
}
