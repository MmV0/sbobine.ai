'use client'

import React, { useState } from 'react'
import { Folder } from '@/types'
import { 
  FolderIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon
} from '@heroicons/react/24/outline'

interface FolderManagerProps {
  folders: Folder[]
  onCreateFolder: (name: string, color: string) => void
  onUpdateFolder: (id: string, updates: Partial<Omit<Folder, 'id' | 'createdAt'>>) => void
  onDeleteFolder: (id: string) => void
}

const FOLDER_COLORS = [
  'bg-blue-500',
  'bg-red-500', 
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500'
]



export default function FolderManager({ 
  folders, 
  onCreateFolder, 
  onUpdateFolder, 
  onDeleteFolder
}: FolderManagerProps) {
  const [showNewFolderForm, setShowNewFolderForm] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0])
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [editFolderName, setEditFolderName] = useState('')

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), newFolderColor)
      setNewFolderName('')
      setNewFolderColor(FOLDER_COLORS[0])
      setShowNewFolderForm(false)
    }
  }



  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder.id)
    setEditFolderName(folder.name)
  }

  const handleSaveEdit = () => {
    if (editingFolder && editFolderName.trim()) {
      onUpdateFolder(editingFolder, { name: editFolderName.trim() })
      setEditingFolder(null)
      setEditFolderName('')
    }
  }

  const handleCancelEdit = () => {
    setEditingFolder(null)
    setEditFolderName('')
  }

  return (
    <div>
      {/* Gestione Cartelle */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FolderIcon className="h-5 w-5 mr-2" />
            Cartelle
          </h3>
          <button
            onClick={() => setShowNewFolderForm(true)}
            className="btn-primary text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Nuova Cartella
          </button>
        </div>

        {/* Form nuova cartella */}
        {showNewFolderForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome cartella
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Es. Matematica, Storia..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colore
                </label>
                <div className="flex space-x-2">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewFolderColor(color)}
                      className={`w-8 h-8 rounded-full ${color} ${
                        newFolderColor === color ? 'ring-2 ring-gray-400' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={handleCreateFolder} className="btn-primary text-sm">
                  Crea
                </button>
                <button 
                  onClick={() => setShowNewFolderForm(false)}
                  className="btn-secondary text-sm"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista cartelle */}
        <div className="space-y-2">
          {folders.map((folder) => (
            <div key={folder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded ${folder.color}`} />
                {editingFolder === folder.id ? (
                  <input
                    type="text"
                    value={editFolderName}
                    onChange={(e) => setEditFolderName(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                    onBlur={handleSaveEdit}
                    autoFocus
                  />
                ) : (
                  <span className="font-medium text-gray-900">{folder.name}</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {editingFolder === folder.id ? (
                  <>
                    <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-800">
                      ✓
                    </button>
                    <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-800">
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleEditFolder(folder)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteFolder(folder.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {folders.length === 0 && !showNewFolderForm && (
            <p className="text-gray-500 text-center py-4">Nessuna cartella creata</p>
          )}
        </div>
      </div>

    </div>
  )
}
