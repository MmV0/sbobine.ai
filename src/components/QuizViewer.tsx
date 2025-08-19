'use client'

import React, { useState } from 'react'
import { Quiz } from '@/types'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

interface QuizViewerProps {
  quiz: Quiz
}

export default function QuizViewer({ quiz }: QuizViewerProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showInstructions, setShowInstructions] = useState(() => {
    return !localStorage.getItem('quiz_instructions_hidden')
  })

  const handleAnswerSelect = (questionId: number, answer: string) => {
    if (submitted) return
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = () => {
    setSubmitted(true)
    setShowResults(true)
  }

  const handleReset = () => {
    setSelectedAnswers({})
    setShowResults(false)
    setSubmitted(false)
  }

  const getScore = () => {
    let correct = 0
    quiz.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correct) {
        correct++
      }
    })
    return { correct, total: quiz.questions.length }
  }

  const score = getScore()
  const scorePercentage = Math.round((score.correct / score.total) * 100)

  const hideInstructions = () => {
    setShowInstructions(false)
    localStorage.setItem('quiz_instructions_hidden', 'true')
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Quiz di Verifica</h2>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-gray-400 hover:text-gray-600"
          title={showInstructions ? "Nascondi istruzioni" : "Mostra istruzioni"}
        >
          <InformationCircleIcon className="h-5 w-5" />
        </button>
      </div>

      {showInstructions && (
        <div className="bg-indigo-50 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">❓</span>
              </div>
              <div>
                <h3 className="font-medium text-indigo-900 mb-2">Istruzioni</h3>
                <p className="text-indigo-800 text-sm">
                  {quiz.instructions}
                </p>
                {!submitted && (
                  <p className="text-indigo-700 text-xs mt-2">
                    Seleziona una risposta per ogni domanda e poi premi "Invia Risposte".
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={hideInstructions}
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}



      {/* Risultato */}
      {showResults && (
        <div className="mb-6 p-4 rounded-lg bg-gray-50 border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Risultato</h3>
            <div className={`text-2xl font-bold ${getScoreColor(scorePercentage)}`}>
              {score.correct}/{score.total} ({scorePercentage}%)
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="btn-secondary text-sm"
            >
              Riprova Quiz
            </button>
          </div>
        </div>
      )}

      {/* Domande */}
      <div className="space-y-6">
        {quiz.questions.map((question, questionIndex) => {
          const isCorrect = selectedAnswers[question.id] === question.correct
          const hasAnswered = selectedAnswers[question.id] !== undefined
          
          return (
            <div
              key={question.id}
              className={`p-4 rounded-lg border-2 ${
                showResults 
                  ? hasAnswered 
                    ? isCorrect 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-gray-50'
                  : 'border-gray-200'
              }`}
            >
              {/* Header domanda */}
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-base font-medium text-gray-900">
                  {questionIndex + 1}. {question.question}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty === 'easy' ? 'Facile' : question.difficulty === 'medium' ? 'Media' : 'Difficile'}
                  </span>
                  {showResults && hasAnswered && (
                    <span className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '✓ Corretto' : '✗ Sbagliato'}
                    </span>
                  )}
                </div>
              </div>

              {/* Opzioni */}
              <div className="space-y-2 mb-4">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selectedAnswers[question.id] === option.charAt(0)
                  const isCorrectOption = option.charAt(0) === question.correct
                  
                  return (
                    <button
                      key={optionIndex}
                      onClick={() => handleAnswerSelect(question.id, option.charAt(0))}
                      disabled={submitted}
                      className={`w-full text-left p-3 rounded border transition-colors ${
                        submitted
                          ? isCorrectOption
                            ? 'border-green-500 bg-green-100 text-green-800'
                            : isSelected && !isCorrectOption
                              ? 'border-red-500 bg-red-100 text-red-800'
                              : 'border-gray-200 bg-gray-50 text-gray-600'
                          : isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{option.charAt(0)}</span>
                      <span className="ml-2">{option.substring(3)}</span>
                    </button>
                  )
                })}
              </div>

              {/* Spiegazione */}
              {showResults && hasAnswered && question.explanation && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <h5 className="text-sm font-medium text-blue-900 mb-1">Spiegazione:</h5>
                  <p className="text-sm text-blue-800">{question.explanation}</p>
                </div>
              )}

              {/* Topic */}
              {question.topic && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Argomento: {question.topic}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottone invio */}
      {!submitted && Object.keys(selectedAnswers).length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Invia Risposte ({Object.keys(selectedAnswers).length}/{quiz.questions.length})
          </button>
        </div>
      )}


    </div>
  )
}
