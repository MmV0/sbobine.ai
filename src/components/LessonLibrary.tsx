'use client'

import React, { useState } from 'react'
import { AudioFile, Folder } from '@/types'
import { formatDuration, formatDate, getStatusText, getStatusColor } from '@/utils/formatters'
import { 
  DocumentTextIcon, 
  EllipsisHorizontalIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  FolderIcon,
  PlusIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowPathIcon,
  PencilIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import Link from 'next/link'

interface LessonLibraryProps {
  audioFiles: AudioFile[]
  folders: Folder[]
  onRefresh: () => void
  onDeleteFile: (fileId: string) => void
  onMoveLessonToFolder: (lessonId: string, folderId?: string) => void
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

export default function LessonLibrary({ 
  audioFiles, 
  folders, 
  onRefresh, 
  onDeleteFile, 
  onMoveLessonToFolder,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder
}: LessonLibraryProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, file: AudioFile | null}>({
    show: false,
    file: null
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0])
  const [draggedFile, setDraggedFile] = useState<AudioFile | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('sbobine_view_mode') as 'grid' | 'list') || 'grid'
    }
    return 'grid'
  })
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState<{show: boolean, folder: Folder | null}>({
    show: false,
    folder: null
  })
  const [editingFolder, setEditingFolder] = useState<{id: string, name: string} | null>(null)

  const handleDeleteClick = (file: AudioFile) => {
    setDeleteConfirm({ show: true, file })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirm.file) {
      onDeleteFile(deleteConfirm.file.id)
      setDeleteConfirm({ show: false, file: null })
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirm({ show: false, file: null })
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), newFolderColor)
      setNewFolderName('')
      setNewFolderColor(FOLDER_COLORS[0])
      setShowNewFolderModal(false)
    }
  }

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId)
    setShowSearch(false)
    setSearchTerm('')
  }

  const handleBackClick = () => {
    setCurrentFolderId(null)
    setShowSearch(false)
    setSearchTerm('')
  }

  const handleSearchToggle = () => {
    setShowSearch(!showSearch)
    if (showSearch) {
      setSearchTerm('')
    }
  }

  const handleViewModeChange = (newMode: 'grid' | 'list') => {
    setViewMode(newMode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sbobine_view_mode', newMode)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UPLOADED':
      case 'PROCESSING':
      case 'TRANSCRIBED':
      case 'SUMMARIZING':
        return (
          <div className="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent text-gray-600 rounded-full" role="status" aria-label="loading">
            <span className="sr-only">Loading...</span>
          </div>
        )
      case 'READY':
        return null // Nessuna icona per "Completato"
      case 'ERROR':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const handleDeleteFolderClick = (folder: Folder) => {
    setDeleteFolderConfirm({ show: true, folder })
  }

  const handleConfirmDeleteFolder = () => {
    if (deleteFolderConfirm.folder) {
      // Elimina tutti i file nella cartella
      const filesToDelete = audioFiles.filter(f => f.folderId === deleteFolderConfirm.folder!.id)
      filesToDelete.forEach(file => onDeleteFile(file.id))
      
      // Elimina la cartella
      onDeleteFolder(deleteFolderConfirm.folder.id)
      
      // Se siamo dentro la cartella che stiamo eliminando, torna alla vista principale
      if (currentFolderId === deleteFolderConfirm.folder.id) {
        setCurrentFolderId(null)
      }
      
      setDeleteFolderConfirm({ show: false, folder: null })
    }
  }

  const handleCancelDeleteFolder = () => {
    setDeleteFolderConfirm({ show: false, folder: null })
  }

  const handleEditFolderStart = (folder: Folder) => {
    setEditingFolder({ id: folder.id, name: folder.name })
  }

  const handleEditFolderSave = () => {
    if (editingFolder && editingFolder.name.trim()) {
      onUpdateFolder(editingFolder.id, { name: editingFolder.name.trim() })
      setEditingFolder(null)
    }
  }

  const handleEditFolderCancel = () => {
    setEditingFolder(null)
  }

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, file: AudioFile) => {
    e.dataTransfer.effectAllowed = 'move'
    setDraggedFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetFolderId?: string) => {
    e.preventDefault()
    if (draggedFile) {
      onMoveLessonToFolder(draggedFile.id, targetFolderId)
      setDraggedFile(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedFile(null)
  }

  // Funzioni di utilità
  const getCurrentFolder = () => {
    return folders.find(f => f.id === currentFolderId)
  }

  const getFolderName = (folderId?: string) => {
    if (!folderId) return 'Senza cartella'
    const folder = folders.find(f => f.id === folderId)
    return folder?.name || 'Cartella sconosciuta'
  }

  // Filtri
  const filteredFiles = audioFiles.filter(file => {
    // Filtro per ricerca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (!file.fileName.toLowerCase().includes(searchLower)) return false
    }
    
    // Filtro per cartella corrente
    if (currentFolderId) {
      return file.folderId === currentFolderId
    } else {
      // Vista principale: mostra solo file senza cartella
      return !file.folderId
    }
  })

  // In vista principale, mostra anche le cartelle (se non stiamo cercando o siamo in vista lista)
  const itemsToShow = currentFolderId ? filteredFiles : [
    ...(searchTerm && viewMode === 'grid' ? [] : folders.filter(folder => 
      !searchTerm || folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    )),
    ...filteredFiles
  ]

  if (audioFiles.length === 0) {
    return (
      <div className="card text-center py-12">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna lezione caricata</h3>
        <p className="text-gray-500">
          Carica il tuo primo file audio per iniziare.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con navigazione */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          {currentFolderId ? (
            <>
              <button
                onClick={handleBackClick}
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Indietro
              </button>
              <span className="text-gray-400">/</span>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded ${getCurrentFolder()?.color || 'bg-gray-400'} mr-2`} />
                <h2 className="text-2xl font-bold text-gray-900">
                  {getCurrentFolder()?.name || 'Cartella'}
                </h2>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900">Le mie Lezioni</h2>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {!currentFolderId && (
            <button
              onClick={() => handleViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
              className={`btn-secondary text-sm flex items-center ${viewMode === 'list' ? 'bg-blue-100 border-blue-300' : ''}`}
            >
              {viewMode === 'grid' ? (
                <ListBulletIcon className="h-4 w-4 mr-1" />
              ) : (
                <Squares2X2Icon className="h-4 w-4 mr-1" />
              )}
              {viewMode === 'grid' ? 'Vista Lista' : 'Vista Griglia'}
            </button>
          )}
          
          <button
            onClick={handleSearchToggle}
            className={`btn-secondary text-sm flex items-center ${showSearch ? 'bg-blue-100 border-blue-300' : ''}`}
          >
            {showSearch ? (
              <XMarkIcon className="h-4 w-4 mr-1" />
            ) : (
              <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
            )}
            {showSearch ? 'Chiudi' : 'Cerca'}
          </button>
          
          {!currentFolderId && (
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="btn-secondary text-sm flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Nuova Cartella
            </button>
          )}
          <button
            onClick={onRefresh}
            className="btn-secondary text-sm p-2"
            title="Aggiorna lista file"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
          

        </div>
      </div>

      {/* Breadcrumb più dettagliato */}
      {currentFolderId && (
        <div className="flex items-center text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-2">
          <button onClick={handleBackClick} className="hover:text-gray-700">
            Le mie Lezioni
          </button>
          <span className="mx-2">&gt;</span>
          <span className="font-medium text-gray-900">
            {getCurrentFolder()?.name} ({filteredFiles.length} file)
          </span>
        </div>
      )}

      {/* Ricerca espandibile */}
      {showSearch && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-blue-600" />
            <input
              type="text"
              placeholder={currentFolderId ? "Cerca in questa cartella..." : "Cerca lezioni e cartelle..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-800"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-blue-700">
              {itemsToShow.length} risultati trovati
            </p>
          )}
        </div>
      )}

      {/* Vista file manager con drag & drop */}
      <div className="card">
        {itemsToShow.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentFolderId ? 'Cartella vuota' : searchTerm ? 'Nessun risultato' : 'Nessun elemento'}
            </h3>
            <p className="text-gray-500">
              {currentFolderId 
                ? 'Trascina qui delle lezioni per organizzarle.'
                : searchTerm 
                  ? 'Modifica la ricerca per vedere più risultati.'
                  : 'Carica il tuo primo file audio o crea una cartella.'
              }
            </p>
            

          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {itemsToShow.map((item) => {
              // Se è una cartella
              if ('color' in item) {
                const folder = item as Folder
                const folderFiles = audioFiles.filter(f => f.folderId === folder.id)
                
                return (
                  <div 
                    key={folder.id}
                    className={`bg-white border-2 ${
                      draggedFile ? 'border-dashed border-blue-400 bg-blue-50' : 'border-gray-200'
                    } rounded-lg p-4 hover:bg-gray-50 transition-all cursor-pointer group relative`}
                  >
                    {editingFolder?.id === folder.id ? (
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-lg ${folder.color} flex items-center justify-center mb-3`}>
                          <FolderIcon className="h-6 w-6 text-white" />
                        </div>
                        <input
                          type="text"
                          value={editingFolder.name}
                          onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                          className="text-sm font-medium text-gray-900 text-center bg-white border border-gray-300 rounded px-2 py-1 w-full mb-2"
                          onKeyPress={(e) => e.key === 'Enter' && handleEditFolderSave()}
                          onBlur={handleEditFolderSave}
                          autoFocus
                        />
                        <div className="flex space-x-1">
                          <button 
                            onClick={handleEditFolderSave}
                            className="text-green-600 hover:text-green-800 text-xs"
                          >
                            ✓
                          </button>
                          <button 
                            onClick={handleEditFolderCancel}
                            className="text-gray-600 hover:text-gray-800 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div 
                          onClick={() => handleFolderClick(folder.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, folder.id)}
                          className="flex flex-col items-center text-center"
                        >
                          <div className={`w-12 h-12 rounded-lg ${folder.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                            <FolderIcon className="h-6 w-6 text-white" />
                          </div>
                          <h4 className="text-sm font-medium text-gray-900 truncate w-full">
                            {folder.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {folderFiles.length} {folderFiles.length === 1 ? 'file' : 'file'}
                          </p>
                        </div>
                        
                        {/* Menu azioni cartella */}
                        <Menu as="div" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Menu.Button 
                            className="flex items-center text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <EllipsisHorizontalIcon className="h-4 w-4" />
                          </Menu.Button>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                              <div className="py-1">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleFolderClick(folder.id)}
                                      className={`${
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      } group flex items-center w-full px-4 py-2 text-sm`}
                                    >
                                      <FolderIcon className="mr-3 h-5 w-5 text-gray-400" />
                                      Apri cartella
                                    </button>
                                  )}
                                </Menu.Item>
                                
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleEditFolderStart(folder)}
                                      className={`${
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      } group flex items-center w-full px-4 py-2 text-sm`}
                                    >
                                      <PencilIcon className="mr-3 h-5 w-5 text-gray-400" />
                                      Rinomina
                                    </button>
                                  )}
                                </Menu.Item>
                                
                                <div className="border-t border-gray-100 my-1"></div>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleDeleteFolderClick(folder)}
                                      className={`${
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      } group flex items-center w-full px-4 py-2 text-sm`}
                                    >
                                      <TrashIcon className="mr-3 h-5 w-5 text-gray-400" />
                                      Elimina cartella
                                    </button>
                                  )}
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </>
                    )}
                    
                    {draggedFile && !editingFolder && (
                      <div className="absolute inset-0 bg-blue-100 bg-opacity-80 rounded-lg flex items-center justify-center">
                        <span className="text-blue-700 font-medium text-sm">
                          Rilascia qui
                        </span>
                      </div>
                    )}
                  </div>
                )
              } 
              // Se è un file
              else {
                const file = item as AudioFile
                
                return (
                  <div 
                    key={file.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, file)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors group cursor-move ${
                      draggedFile?.id === file.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center min-w-0 flex-1">
                          <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-2 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            {file.status === 'READY' ? (
                              <Link 
                                href={`/lesson/${file.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-blue-600 block truncate"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {file.fileName}
                              </Link>
                            ) : (
                              <span className="text-sm font-medium text-gray-400 block truncate cursor-not-allowed">
                                {file.fileName}
                              </span>
                            )}
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(file.status)}`}>
                              {getStatusIcon(file.status)}
                              {getStatusText(file.status)}
                            </span>
                          </div>
                        </div>
                        <Menu as="div" className="relative ml-2">
                          <Menu.Button 
                            className="flex items-center text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <EllipsisHorizontalIcon className="h-5 w-5" />
                          </Menu.Button>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                              <div className="py-1">
                                <Menu.Item disabled={file.status !== 'READY'}>
                                  {({ active }) => (
                                    file.status === 'READY' ? (
                                      <Link
                                        href={`/lesson/${file.id}`}
                                        className={`${
                                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                        } group flex items-center px-4 py-2 text-sm`}
                                      >
                                        <EyeIcon className="mr-3 h-5 w-5 text-gray-400" />
                                        Visualizza
                                      </Link>
                                    ) : (
                                      <span className="text-gray-400 group flex items-center px-4 py-2 text-sm cursor-not-allowed">
                                        <EyeIcon className="mr-3 h-5 w-5 text-gray-300" />
                                        Elaborazione in corso...
                                      </span>
                                    )
                                  )}
                                </Menu.Item>
                                
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      className={`${
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      } group flex items-center w-full px-4 py-2 text-sm`}
                                    >
                                      <ArrowDownTrayIcon className="mr-3 h-5 w-5 text-gray-400" />
                                      Download Audio
                                    </button>
                                  )}
                                </Menu.Item>

                                {folders.length > 0 && (
                                  <>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                                      Sposta in cartella
                                    </div>
                                    {/* Mostra "Rimuovi dalla cartella" solo se il file è già in una cartella */}
                                    {file.folderId && (
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => onMoveLessonToFolder(file.id, undefined)}
                                            className={`${
                                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                            } group flex items-center w-full px-4 py-2 text-sm`}
                                          >
                                            <FolderIcon className="mr-3 h-5 w-5 text-gray-400" />
                                            Rimuovi dalla cartella
                                          </button>
                                        )}
                                      </Menu.Item>
                                    )}
                                    {/* Mostra solo le cartelle diverse da quella corrente */}
                                    {folders
                                      .filter(folder => folder.id !== file.folderId)
                                      .map((folder) => (
                                      <Menu.Item key={folder.id}>
                                        {({ active }) => (
                                          <button
                                            onClick={() => onMoveLessonToFolder(file.id, folder.id)}
                                            className={`${
                                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                            } group flex items-center w-full px-4 py-2 text-sm`}
                                          >
                                            <div className={`w-3 h-3 rounded mr-3 ${folder.color}`} />
                                            {folder.name}
                                          </button>
                                        )}
                                      </Menu.Item>
                                    ))}
                                  </>
                                )}

                                <div className="border-t border-gray-100 my-1"></div>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleDeleteClick(file)}
                                      className={`${
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      } group flex items-center w-full px-4 py-2 text-sm`}
                                    >
                                      <TrashIcon className="mr-3 h-5 w-5 text-gray-400" />
                                      Elimina
                                    </button>
                                  )}
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Durata:</span>
                          <span>{formatDuration(file.durationSeconds)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Data:</span>
                          <span>{formatDate(file.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            })}
          </div>
        ) : (
          /* Vista Lista */
          <div className="overflow-visible">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durata
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Azioni</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {itemsToShow.map((item) => {
                    // Se è una cartella
                    if ('color' in item) {
                      const folder = item as Folder
                      const folderFiles = audioFiles.filter(f => f.folderId === folder.id)
                      
                      return (
                        <tr 
                          key={folder.id}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, folder.id)}
                          className={`hover:bg-gray-50 cursor-pointer ${
                            draggedFile ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingFolder?.id === folder.id ? (
                              <div className="flex items-center">
                                <div className={`w-4 h-4 rounded ${folder.color} mr-3`} />
                                <FolderIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <input
                                  type="text"
                                  value={editingFolder.name}
                                  onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                                  className="text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 mr-2"
                                  onKeyPress={(e) => e.key === 'Enter' && handleEditFolderSave()}
                                  onBlur={handleEditFolderSave}
                                  autoFocus
                                />
                                <button 
                                  onClick={handleEditFolderSave}
                                  className="text-green-600 hover:text-green-800 mr-1"
                                >
                                  ✓
                                </button>
                                <button 
                                  onClick={handleEditFolderCancel}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div 
                                onClick={() => handleFolderClick(folder.id)}
                                className="flex items-center"
                              >
                                <div className={`w-4 h-4 rounded ${folder.color} mr-3`} />
                                <FolderIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <div className="text-sm font-medium text-gray-900">
                                  {folder.name}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Cartella
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            -
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              {folderFiles.length} file
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(folder.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {editingFolder?.id === folder.id ? (
                              <span className="text-gray-400">Editing...</span>
                            ) : (
                              <Menu as="div" className="relative inline-block text-left">
                                <Menu.Button 
                                  className="flex items-center text-gray-400 hover:text-gray-600"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <EllipsisHorizontalIcon className="h-5 w-5" />
                                </Menu.Button>
                                <Transition
                                  as={Fragment}
                                  enter="transition ease-out duration-100"
                                  enterFrom="transform opacity-0 scale-95"
                                  enterTo="transform opacity-100 scale-100"
                                  leave="transition ease-in duration-75"
                                  leaveFrom="transform opacity-100 scale-100"
                                  leaveTo="transform opacity-0 scale-95"
                                >
                                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                    <div className="py-1">
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => handleFolderClick(folder.id)}
                                            className={`${
                                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                            } group flex items-center w-full px-4 py-2 text-sm`}
                                          >
                                            <FolderIcon className="mr-3 h-5 w-5 text-gray-400" />
                                            Apri cartella
                                          </button>
                                        )}
                                      </Menu.Item>
                                      
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => handleEditFolderStart(folder)}
                                            className={`${
                                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                            } group flex items-center w-full px-4 py-2 text-sm`}
                                          >
                                            <PencilIcon className="mr-3 h-5 w-5 text-gray-400" />
                                            Rinomina
                                          </button>
                                        )}
                                      </Menu.Item>
                                      
                                      <div className="border-t border-gray-100 my-1"></div>
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => handleDeleteFolderClick(folder)}
                                            className={`${
                                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                            } group flex items-center w-full px-4 py-2 text-sm`}
                                          >
                                            <TrashIcon className="mr-3 h-5 w-5 text-gray-400" />
                                            Elimina cartella
                                          </button>
                                        )}
                                      </Menu.Item>
                                    </div>
                                  </Menu.Items>
                                </Transition>
                              </Menu>
                            )}
                          </td>
                        </tr>
                      )
                    } 
                    // Se è un file
                    else {
                      const file = item as AudioFile
                      
                      return (
                        <tr 
                          key={file.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, file)}
                          onDragEnd={handleDragEnd}
                          className={`hover:bg-gray-50 ${
                            draggedFile?.id === file.id ? 'opacity-50' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-3" />
                              <div>
                                {file.status === 'READY' ? (
                                  <Link 
                                    href={`/lesson/${file.id}`}
                                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {file.fileName}
                                  </Link>
                                ) : (
                                  <span className="text-sm font-medium text-gray-400 cursor-not-allowed">
                                    {file.fileName}
                                  </span>
                                )}
                                <div className="text-sm text-gray-500">
                                  {file.language.toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Audio
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDuration(file.durationSeconds)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(file.status)}`}>
                              {getStatusIcon(file.status)}
                              {getStatusText(file.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(file.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Menu as="div" className="relative inline-block text-left">
                              <Menu.Button className="flex items-center text-gray-400 hover:text-gray-600">
                                <EllipsisHorizontalIcon className="h-5 w-5" />
                              </Menu.Button>
                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                              >
                                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                  <div className="py-1">
                                    <Menu.Item disabled={file.status !== 'READY'}>
                                      {({ active }) => (
                                        file.status === 'READY' ? (
                                          <Link
                                            href={`/lesson/${file.id}`}
                                            className={`${
                                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                            } group flex items-center px-4 py-2 text-sm`}
                                          >
                                            <EyeIcon className="mr-3 h-5 w-5 text-gray-400" />
                                            Visualizza
                                          </Link>
                                        ) : (
                                          <span className="text-gray-400 group flex items-center px-4 py-2 text-sm cursor-not-allowed">
                                            <EyeIcon className="mr-3 h-5 w-5 text-gray-300" />
                                            Elaborazione in corso...
                                          </span>
                                        )
                                      )}
                                    </Menu.Item>
                                    
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          className={`${
                                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                          } group flex items-center w-full px-4 py-2 text-sm`}
                                        >
                                          <ArrowDownTrayIcon className="mr-3 h-5 w-5 text-gray-400" />
                                          Download Audio
                                        </button>
                                      )}
                                    </Menu.Item>

                                    {folders.length > 0 && (
                                      <>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                                          Sposta in cartella
                                        </div>
                                        {/* Mostra "Nessuna cartella" solo se il file è già in una cartella */}
                                        {file.folderId && (
                                          <Menu.Item>
                                            {({ active }) => (
                                              <button
                                                onClick={() => onMoveLessonToFolder(file.id, undefined)}
                                                className={`${
                                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                } group flex items-center w-full px-4 py-2 text-sm`}
                                              >
                                                <FolderIcon className="mr-3 h-5 w-5 text-gray-400" />
                                                Rimuovi dalla cartella
                                              </button>
                                            )}
                                          </Menu.Item>
                                        )}
                                        {/* Mostra solo le cartelle diverse da quella corrente */}
                                        {folders
                                          .filter(folder => folder.id !== file.folderId)
                                          .map((folder) => (
                                          <Menu.Item key={folder.id}>
                                            {({ active }) => (
                                              <button
                                                onClick={() => onMoveLessonToFolder(file.id, folder.id)}
                                                className={`${
                                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                } group flex items-center w-full px-4 py-2 text-sm`}
                                              >
                                                <div className={`w-3 h-3 rounded mr-3 ${folder.color}`} />
                                                {folder.name}
                                              </button>
                                            )}
                                          </Menu.Item>
                                        ))}
                                      </>
                                    )}

                                    <div className="border-t border-gray-100 my-1"></div>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => handleDeleteClick(file)}
                                          className={`${
                                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                          } group flex items-center w-full px-4 py-2 text-sm`}
                                        >
                                          <TrashIcon className="mr-3 h-5 w-5 text-gray-400" />
                                          Elimina
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </div>
                                </Menu.Items>
                              </Transition>
                            </Menu>
                          </td>
                        </tr>
                      )
                    }
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {itemsToShow.map((item) => {
                // Se è una cartella
                if ('color' in item) {
                  const folder = item as Folder
                  const folderFiles = audioFiles.filter(f => f.folderId === folder.id)
                  
                  return (
                    <div 
                      key={folder.id}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, folder.id)}
                      className={`bg-white border border-gray-200 rounded-lg p-4 cursor-pointer ${
                        draggedFile ? 'border-dashed border-blue-400 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      {editingFolder?.id === folder.id ? (
                        <div>
                          <div className="flex items-center mb-2">
                            <div className={`w-4 h-4 rounded ${folder.color} mr-3`} />
                            <FolderIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <input
                              type="text"
                              value={editingFolder.name}
                              onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                              className="text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 flex-1"
                              onKeyPress={(e) => e.key === 'Enter' && handleEditFolderSave()}
                              onBlur={handleEditFolderSave}
                              autoFocus
                            />
                          </div>
                          <div className="flex justify-center space-x-2">
                            <button 
                              onClick={handleEditFolderSave}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              ✓ Salva
                            </button>
                            <button 
                              onClick={handleEditFolderCancel}
                              className="text-gray-600 hover:text-gray-800 text-sm"
                            >
                              ✕ Annulla
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div 
                            onClick={() => handleFolderClick(folder.id)}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center min-w-0 flex-1">
                              <div className={`w-4 h-4 rounded ${folder.color} mr-3`} />
                              <FolderIcon className="h-5 w-5 text-gray-400 mr-2" />
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {folder.name}
                              </h3>
                            </div>
                            <div className="ml-4 flex items-center space-x-2">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                {folderFiles.length} file
                              </span>
                              <Menu as="div" className="relative">
                                <Menu.Button 
                                  className="flex items-center text-gray-400 hover:text-gray-600"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <EllipsisHorizontalIcon className="h-5 w-5" />
                                </Menu.Button>
                                <Transition
                                  as={Fragment}
                                  enter="transition ease-out duration-100"
                                  enterFrom="transform opacity-0 scale-95"
                                  enterTo="transform opacity-100 scale-100"
                                  leave="transition ease-in duration-75"
                                  leaveFrom="transform opacity-100 scale-100"
                                  leaveTo="transform opacity-0 scale-95"
                                >
                                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                    <div className="py-1">
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => handleFolderClick(folder.id)}
                                            className={`${
                                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                            } group flex items-center w-full px-4 py-2 text-sm`}
                                          >
                                            <FolderIcon className="mr-3 h-5 w-5 text-gray-400" />
                                            Apri cartella
                                          </button>
                                        )}
                                      </Menu.Item>
                                      
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => handleEditFolderStart(folder)}
                                            className={`${
                                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                            } group flex items-center w-full px-4 py-2 text-sm`}
                                          >
                                            <PencilIcon className="mr-3 h-5 w-5 text-gray-400" />
                                            Rinomina
                                          </button>
                                        )}
                                      </Menu.Item>
                                      
                                      <div className="border-t border-gray-100 my-1"></div>
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => handleDeleteFolderClick(folder)}
                                            className={`${
                                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                            } group flex items-center w-full px-4 py-2 text-sm`}
                                          >
                                            <TrashIcon className="mr-3 h-5 w-5 text-gray-400" />
                                            Elimina cartella
                                          </button>
                                        )}
                                      </Menu.Item>
                                    </div>
                                  </Menu.Items>
                                </Transition>
                              </Menu>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-xs text-gray-500">
                            <div className="flex justify-between">
                              <span>Tipo:</span>
                              <span>Cartella</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Creata:</span>
                              <span>{formatDate(folder.createdAt)}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )
                } 
                // Se è un file
                else {
                  const file = item as AudioFile
                  
                  return (
                    <div 
                      key={file.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, file)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white border border-gray-200 rounded-lg p-4 ${
                        draggedFile?.id === file.id ? 'opacity-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-2">
                            <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                            {file.status === 'READY' ? (
                              <Link 
                                href={`/lesson/${file.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {file.fileName}
                              </Link>
                            ) : (
                              <span className="text-sm font-medium text-gray-400 truncate cursor-not-allowed">
                                {file.fileName}
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-xs text-gray-500">
                            <div className="flex justify-between">
                              <span>Tipo:</span>
                              <span>Audio ({file.language.toUpperCase()})</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Durata:</span>
                              <span>{formatDuration(file.durationSeconds)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Stato:</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(file.status)}`}>
                                {getStatusIcon(file.status)}
                                {getStatusText(file.status)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Data:</span>
                              <span>{formatDate(file.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Menu as="div" className="relative ml-3">
                          <Menu.Button className="flex items-center text-gray-400 hover:text-gray-600">
                            <EllipsisHorizontalIcon className="h-5 w-5" />
                          </Menu.Button>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                              <div className="py-1">
                                <Menu.Item disabled={file.status !== 'READY'}>
                                  {({ active }) => (
                                    file.status === 'READY' ? (
                                      <Link
                                        href={`/lesson/${file.id}`}
                                        className={`${
                                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                        } group flex items-center px-4 py-2 text-sm`}
                                      >
                                        <EyeIcon className="mr-3 h-5 w-5 text-gray-400" />
                                        Visualizza
                                      </Link>
                                    ) : (
                                      <span className="text-gray-400 group flex items-center px-4 py-2 text-sm cursor-not-allowed">
                                        <EyeIcon className="mr-3 h-5 w-5 text-gray-300" />
                                        Elaborazione in corso...
                                      </span>
                                    )
                                  )}
                                </Menu.Item>
                                
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      className={`${
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      } group flex items-center w-full px-4 py-2 text-sm`}
                                    >
                                      <ArrowDownTrayIcon className="mr-3 h-5 w-5 text-gray-400" />
                                      Download
                                    </button>
                                  )}
                                </Menu.Item>

                                {folders.length > 0 && (
                                  <>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                                      Sposta in cartella
                                    </div>
                                    {/* Mostra "Rimuovi dalla cartella" solo se il file è già in una cartella */}
                                    {file.folderId && (
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => onMoveLessonToFolder(file.id, undefined)}
                                            className={`${
                                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                            } group flex items-center w-full px-4 py-2 text-sm`}
                                          >
                                            <FolderIcon className="mr-3 h-5 w-5 text-gray-400" />
                                            Rimuovi dalla cartella
                                          </button>
                                        )}
                                      </Menu.Item>
                                    )}
                                    {/* Mostra solo le cartelle diverse da quella corrente */}
                                    {folders
                                      .filter(folder => folder.id !== file.folderId)
                                      .map((folder) => (
                                      <Menu.Item key={folder.id}>
                                        {({ active }) => (
                                          <button
                                            onClick={() => onMoveLessonToFolder(file.id, folder.id)}
                                            className={`${
                                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                            } group flex items-center w-full px-4 py-2 text-sm`}
                                          >
                                            <div className={`w-3 h-3 rounded mr-3 ${folder.color}`} />
                                            {folder.name}
                                          </button>
                                        )}
                                      </Menu.Item>
                                    ))}
                                  </>
                                )}

                                <div className="border-t border-gray-100 my-1"></div>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleDeleteClick(file)}
                                      className={`${
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      } group flex items-center w-full px-4 py-2 text-sm`}
                                    >
                                      <TrashIcon className="mr-3 h-5 w-5 text-gray-400" />
                                      Elimina
                                    </button>
                                  )}
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    </div>
                  )
                }
              })}
            </div>
          </div>
        )}

        {/* Area drop per rimuovere file dalle cartelle - SOLO quando siamo DENTRO una cartella */}
        {currentFolderId && draggedFile && viewMode === 'grid' && (
          <div 
            className="mt-6 p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center hover:bg-gray-100 transition-colors"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, undefined)}
          >
            <FolderIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-600">
              Rilascia qui per spostare fuori dalla cartella
            </p>
          </div>
        )}

        {/* Area drop per vista lista - SOLO quando siamo DENTRO una cartella */}
        {currentFolderId && draggedFile && viewMode === 'list' && (
          <div 
            className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center hover:bg-gray-100 transition-colors"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, undefined)}
          >
            <div className="flex items-center justify-center space-x-2">
              <FolderIcon className="h-6 w-6 text-gray-400" />
              <p className="text-gray-600 font-medium">
                Rilascia qui per spostare fuori dalla cartella
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nuova Cartella */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-96 shadow-lg rounded-md bg-white">
            <div className="text-center">
              <FolderIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Nuova Cartella
              </h3>
              
              <div className="space-y-4 text-left">
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
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colore
                  </label>
                  <div className="flex justify-center space-x-2">
                    {FOLDER_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewFolderColor(color)}
                        className={`w-8 h-8 rounded ${color} ${
                          newFolderColor === color ? 'ring-2 ring-gray-400' : ''
                        } hover:scale-110 transition-transform`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crea Cartella
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal conferma eliminazione cartella */}
      {deleteFolderConfirm.show && deleteFolderConfirm.folder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <TrashIcon className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Elimina Cartella
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Sei sicuro di voler eliminare la cartella "{deleteFolderConfirm.folder.name}"? 
                <br /><br />
                <strong>Attenzione:</strong> Verranno eliminati anche tutti i {audioFiles.filter(f => f.folderId === deleteFolderConfirm.folder!.id).length} file contenuti nella cartella.
                <br /><br />
                Questa azione non può essere annullata.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleCancelDeleteFolder}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Annulla
                </button>
                <button
                  onClick={handleConfirmDeleteFolder}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Elimina Tutto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal di conferma eliminazione file */}
      {deleteConfirm.show && deleteConfirm.file && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <TrashIcon className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Elimina Lezione
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Sei sicuro di voler eliminare "{deleteConfirm.file.fileName}"? 
                Questa azione non può essere annullata.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Annulla
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}