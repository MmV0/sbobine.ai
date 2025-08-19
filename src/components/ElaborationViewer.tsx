'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Elaboration } from '@/types'
import ReactMarkdown from 'react-markdown'
import dynamic from 'next/dynamic'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import TurndownService from 'turndown'
import { Converter } from 'showdown'

// Importa dinamicamente ReactQuill per evitare problemi SSR
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface ElaborationViewerProps {
  elaboration: Elaboration
}

export default function ElaborationViewer({ elaboration }: ElaborationViewerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(elaboration.elaboratedText)
  const [htmlContent, setHtmlContent] = useState('')
  const [showInstructions, setShowInstructions] = useState(() => {
    return !localStorage.getItem('elaboration_instructions_hidden')
  })

  // Inizializza i convertitori
  const markdownToHtml = new Converter()
  const htmlToMarkdown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
  })

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'blockquote'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  }

  const formats = [
    'header', 'bold', 'italic', 'underline',
    'list', 'bullet', 'indent', 'link', 'blockquote', 
    'color', 'background', 'align'
  ]

  const handleStartEditing = () => {
    // Converte il markdown in HTML per l'editor
    const html = markdownToHtml.makeHtml(content)
    setHtmlContent(html)
    setIsEditing(true)
  }

  const handleSave = () => {
    // Converte l'HTML dell'editor in markdown
    const markdown = htmlToMarkdown.turndown(htmlContent)
    setContent(markdown)
    // TODO: Implementare salvataggio nel localStorage o backend
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Ripristina il contenuto originale
    setHtmlContent('')
    setIsEditing(false)
  }

  const hideInstructions = () => {
    setShowInstructions(false)
    localStorage.setItem('elaboration_instructions_hidden', 'true')
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Rielaborato</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-gray-400 hover:text-gray-600"
            title={showInstructions ? "Nascondi suggerimenti" : "Mostra suggerimenti"}
          >
            <InformationCircleIcon className="h-5 w-5" />
          </button>
          {!isEditing ? (
            <button
              onClick={handleStartEditing}
              className="btn-secondary text-sm"
            >
              Modifica
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="btn-primary text-sm"
              >
                Salva
              </button>
              <button
                onClick={handleCancel}
                className="btn-secondary text-sm"
              >
                Annulla
              </button>
            </div>
          )}

        </div>
      </div>
      
      {showInstructions && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">📝</span>
            </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Sbobina Rielaborata</h3>
                <p className="text-blue-800 text-sm">
                  Questa è una versione rielaborata della lezione, scritta come farebbe uno studente 
                  per organizzare meglio i contenuti per lo studio. Puoi modificarla cliccando "Modifica".
                </p>
              </div>
            </div>
            <button
              onClick={hideInstructions}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}



      {/* Contenuto elaborato */}
      {isEditing ? (
        <div className="elaboration-editor-container">
          <ReactQuill
            theme="snow"
            value={htmlContent}
            onChange={setHtmlContent}
            modules={modules}
            formats={formats}
            placeholder="Inizia a scrivere il tuo rielaborato..."
          />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown 
              className="text-gray-900 leading-relaxed"
              components={{
                h1: ({children}) => <h1 className="text-xl font-bold text-gray-900 mt-6 mb-3">{children}</h1>,
                h2: ({children}) => <h2 className="text-lg font-semibold text-gray-900 mt-5 mb-2">{children}</h2>,
                h3: ({children}) => <h3 className="text-base font-medium text-gray-900 mt-4 mb-2">{children}</h3>,
                p: ({children}) => <p className="mb-3 leading-relaxed">{children}</p>,
                ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                li: ({children}) => <li className="ml-2">{children}</li>,
                strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                em: ({children}) => <em className="italic">{children}</em>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      )}


    </div>
  )
}
