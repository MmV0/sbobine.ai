export interface AudioFile {
  id: string
  userId: string
  fileName: string
  fileUrl: string
  durationSeconds: number
  status: 'UPLOADED' | 'PROCESSING' | 'TRANSCRIBED' | 'SUMMARIZING' | 'READY' | 'ERROR'
  language: string
  createdAt: string
  updatedAt: string
  folderId?: string
}

export interface Transcription {
  id: string
  audioFileId: string
  rawText: string
  cleanText: string
  modelUsed: string
  createdAt: string
  updatedAt: string
}

export interface Summary {
  id: string
  transcriptionId: string
  summaryText: string
  modelUsed: string
  style: string
  createdAt: string
  sections: {
    overview: string
    keyConcepts: string[]
    definitions: { term: string; definition: string }[]
    dates: { date: string; event: string }[]
    qna: { question: string; answer: string }[]
  }
}

export interface Elaboration {
  id: string
  transcriptionId: string
  elaboratedText: string
  modelUsed: string
  createdAt: string
}

export interface ConceptMap {
  id: string
  transcriptionId: string
  centralTopic: string
  nodes: {
    id: string
    label: string
    type: 'main' | 'secondary' | 'detail'
    description: string
  }[]
  connections: {
    from: string
    to: string
    label: string
    strength: 'strong' | 'medium' | 'weak'
  }[]
  modelUsed: string
  createdAt: string
}

export interface Quiz {
  id: string
  transcriptionId: string
  instructions: string
  questions: {
    id: number
    question: string
    options: string[]
    correct: string
    explanation: string
    difficulty: 'easy' | 'medium' | 'hard'
    topic: string
  }[]
  modelUsed: string
  createdAt: string
}

export interface Folder {
  id: string
  name: string
  color: string
  createdAt: string
  updatedAt: string
}



export interface Annotation {
  id: string
  transcriptionId: string
  userId: string
  content: string
  position: number
  timestamp?: number
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  userId: string
  audioFileId: string
  amount: number
  currency: string
  paymentMethod: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  createdAt: string
  updatedAt: string
}

export interface JobStatus {
  id: string
  audioFileId: string
  status: AudioFile['status']
  progress: number
  currentStep: string
  error?: string
  estimatedCompletion?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}
