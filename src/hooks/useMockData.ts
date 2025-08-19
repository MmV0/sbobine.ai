'use client'

import { useState, useEffect } from 'react'
import { AudioFile, Transcription, Summary, JobStatus, Elaboration, ConceptMap, Quiz, Folder } from '@/types'
import { v4 as uuidv4 } from 'uuid'

// Cartelle di esempio
const SAMPLE_FOLDERS: Folder[] = [
  {
    id: 'folder1',
    name: 'Matematica',
    color: 'bg-blue-500',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'folder2',
    name: 'Storia',
    color: 'bg-red-500',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z'
  },
  {
    id: 'folder3',
    name: 'Fisica',
    color: 'bg-green-500',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z'
  }
]



// Dati di esempio per la demo
const SAMPLE_DATA: AudioFile[] = [
  {
    id: '1',
    userId: '1',
    fileName: 'Lezione di Matematica - Derivate.mp3',
    fileUrl: '/demo/math-lesson.mp3',
    durationSeconds: 1800, // 30 minuti
    status: 'READY',
    language: 'it',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:45:00Z',
    folderId: 'folder1'
  },
  {
    id: '2',
    userId: '1',
    fileName: 'Storia Contemporanea - Prima Guerra Mondiale.m4a',
    fileUrl: '/demo/history-lesson.m4a',
    durationSeconds: 2400, // 40 minuti
    status: 'READY',
    language: 'it',
    createdAt: '2024-01-14T14:15:00Z',
    updatedAt: '2024-01-14T14:35:00Z',
    folderId: 'folder2'
  },
  {
    id: '3',
    userId: '1',
    fileName: 'Fisica Quantistica - Principi Base.wav',
    fileUrl: '/demo/physics-lesson.wav',
    durationSeconds: 3600, // 60 minuti
    status: 'PROCESSING',
    language: 'it',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
    folderId: 'folder3'
  },
]

export function useMockData() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)

    useEffect(() => {
    // Simula il caricamento dei dati
    const timer = setTimeout(() => {
      // Carica AudioFiles con migrazione automatica
      const savedData = localStorage.getItem('sbobine_audio_files')
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData) as AudioFile[]
          
          // Migra i dati esistenti aggiungendo folderId se mancante
          const migratedData = parsedData.map(file => ({
            ...file,
            folderId: file.folderId || undefined
          }))
          
          setAudioFiles(migratedData)
          // Salva i dati migrati
          localStorage.setItem('sbobine_audio_files', JSON.stringify(migratedData))
        } catch (error) {
          console.error('useMockData: Errore parsing localStorage, usando dati sample')
          setAudioFiles(SAMPLE_DATA)
          localStorage.setItem('sbobine_audio_files', JSON.stringify(SAMPLE_DATA))
        }
      } else {
        setAudioFiles(SAMPLE_DATA)
        localStorage.setItem('sbobine_audio_files', JSON.stringify(SAMPLE_DATA))
      }

      // Carica Folders
      const savedFolders = localStorage.getItem('sbobine_folders')
      if (savedFolders) {
        setFolders(JSON.parse(savedFolders))
      } else {
        setFolders(SAMPLE_FOLDERS)
        localStorage.setItem('sbobine_folders', JSON.stringify(SAMPLE_FOLDERS))
      }

      setLoading(false)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  const addAudioFile = (file: Omit<AudioFile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFile: AudioFile = {
      ...file,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      folderId: file.folderId || undefined,
    }

    const updatedFiles = [newFile, ...audioFiles]
    
    setAudioFiles(updatedFiles)
    localStorage.setItem('sbobine_audio_files', JSON.stringify(updatedFiles))
    
    return newFile
  }

  const updateAudioFile = (id: string, updates: Partial<AudioFile>) => {
    // Verifica se il file esiste
    const fileExists = audioFiles.find(file => file.id === id)
    
    if (!fileExists) {
      console.error('useMockData: File non trovato! ID:', id)
      return // Non fare nulla se il file non esiste
    }
    
    const updatedFiles = audioFiles.map(file =>
      file.id === id
        ? { ...file, ...updates, updatedAt: new Date().toISOString() }
        : file
    )
    
    setAudioFiles(updatedFiles)
    localStorage.setItem('sbobine_audio_files', JSON.stringify(updatedFiles))
  }

  const deleteAudioFile = (id: string) => {
    const updatedFiles = audioFiles.filter(file => file.id !== id)
    setAudioFiles(updatedFiles)
    localStorage.setItem('sbobine_audio_files', JSON.stringify(updatedFiles))
  }

  const refreshData = () => {
    const savedData = localStorage.getItem('sbobine_audio_files')
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      setAudioFiles(parsedData)
    }
  }

  const getTranscription = (audioFileId: string): Transcription | null => {
    // Controlla prima nei dati reali salvati
    const realTranscriptions = JSON.parse(localStorage.getItem('sbobine_transcriptions') || '{}')
    if (realTranscriptions[audioFileId]) {
      return realTranscriptions[audioFileId]
    }

    // Fallback ai dati mock per la demo
    const transcriptions = {
      '1': {
        id: 't1',
        audioFileId: '1',
        rawText: 'Benvenuti alla lezione di oggi sulle derivate. Oggi parleremo dei concetti fondamentali del calcolo differenziale...',
        cleanText: 'Benvenuti alla lezione di oggi sulle derivate. Oggi parleremo dei concetti fondamentali del calcolo differenziale e vedremo come applicare le regole di derivazione.',
        modelUsed: 'whisper-large-v3',
        createdAt: '2024-01-15T10:32:00Z',
        updatedAt: '2024-01-15T10:40:00Z',
      },
      '2': {
        id: 't2',
        audioFileId: '2',
        rawText: 'La Prima Guerra Mondiale, conosciuta anche come Grande Guerra, fu un conflitto globale che ebbe luogo dal 1914 al 1918...',
        cleanText: 'La Prima Guerra Mondiale, conosciuta anche come Grande Guerra, fu un conflitto globale che ebbe luogo dal 1914 al 1918. Le cause del conflitto furono molteplici e complesse.',
        modelUsed: 'whisper-large-v3',
        createdAt: '2024-01-14T14:18:00Z',
        updatedAt: '2024-01-14T14:30:00Z',
      },
    }
    
    return transcriptions[audioFileId as keyof typeof transcriptions] || null
  }

  const getSummary = (transcriptionId: string): Summary | null => {
    // Controlla prima nei dati reali salvati
    const realSummaries = JSON.parse(localStorage.getItem('sbobine_summaries') || '{}')
    if (realSummaries[transcriptionId]) {
      return realSummaries[transcriptionId]
    }

    // Fallback ai dati mock per la demo
    const summaries = {
      't1': {
        id: 's1',
        transcriptionId: 't1',
        summaryText: 'Riassunto della lezione sulle derivate matematiche',
        modelUsed: 'gpt-4',
        style: 'structured',
        createdAt: '2024-01-15T10:42:00Z',
        sections: {
          overview: 'Questa lezione introduce i concetti fondamentali del calcolo differenziale, concentrandosi sulle derivate e le loro applicazioni pratiche.',
          keyConcepts: [
            'Definizione di derivata',
            'Regole di derivazione',
            'Derivata di funzioni composite',
            'Applicazioni geometriche delle derivate'
          ],
          definitions: [
            {
              term: 'Derivata',
              definition: 'Il limite del rapporto incrementale di una funzione quando l\'incremento tende a zero'
            },
            {
              term: 'Regola della catena',
              definition: 'Metodo per derivare funzioni composite'
            }
          ],
          dates: [
            {
              date: '1665',
              event: 'Newton sviluppa il calcolo differenziale'
            }
          ],
          qna: [
            {
              question: 'Cos\'è una derivata?',
              answer: 'È il tasso di variazione istantaneo di una funzione in un punto'
            },
            {
              question: 'Come si calcola la derivata di x^n?',
              answer: 'Utilizzando la regola della potenza: d/dx(x^n) = n*x^(n-1)'
            }
          ]
        }
      },
      't2': {
        id: 's2',
        transcriptionId: 't2',
        summaryText: 'Riassunto della lezione sulla Prima Guerra Mondiale',
        modelUsed: 'gpt-4',
        style: 'structured',
        createdAt: '2024-01-14T14:32:00Z',
        sections: {
          overview: 'Panoramica completa della Prima Guerra Mondiale, delle sue cause, sviluppi e conseguenze.',
          keyConcepts: [
            'Cause del conflitto',
            'Alleanze militari',
            'Guerra di trincea',
            'Conseguenze del conflitto'
          ],
          definitions: [
            {
              term: 'Grande Guerra',
              definition: 'Nome alternativo della Prima Guerra Mondiale'
            },
            {
              term: 'Guerra di trincea',
              definition: 'Tipo di combattimento caratterizzato da posizioni statiche e fortificate'
            }
          ],
          dates: [
            {
              date: '28 giugno 1914',
              event: 'Assassinio dell\'arciduca Francesco Ferdinando'
            },
            {
              date: '1° settembre 1939',
              event: 'Inizio della Seconda Guerra Mondiale'
            }
          ],
          qna: [
            {
              question: 'Quando iniziò la Prima Guerra Mondiale?',
              answer: 'Il conflitto iniziò nel 1914 e terminò nel 1918'
            },
            {
              question: 'Quali furono le principali alleanze?',
              answer: 'La Triplice Alleanza e la Triplice Intesa'
            }
          ]
        }
      }
    }

    return summaries[transcriptionId as keyof typeof summaries] || null
  }

  const saveTranscription = (audioFileId: string, transcription: Transcription) => {
    const existingTranscriptions = JSON.parse(localStorage.getItem('sbobine_transcriptions') || '{}')
    existingTranscriptions[audioFileId] = transcription
    localStorage.setItem('sbobine_transcriptions', JSON.stringify(existingTranscriptions))
  }

  const saveSummary = (transcriptionId: string, summary: Summary) => {
    const existingSummaries = JSON.parse(localStorage.getItem('sbobine_summaries') || '{}')
    existingSummaries[transcriptionId] = summary
    localStorage.setItem('sbobine_summaries', JSON.stringify(existingSummaries))
  }

  const getElaboration = (transcriptionId: string): Elaboration | null => {
    // Controlla prima nei dati reali salvati
    const realElaborations = JSON.parse(localStorage.getItem('sbobine_elaborations') || '{}')
    if (realElaborations[transcriptionId]) {
      return realElaborations[transcriptionId]
    }

    // Fallback ai dati mock per la demo
    const elaborations = {
      't1': {
        id: 'e1',
        transcriptionId: 't1',
        elaboratedText: `# Sbobina: Derivate Matematiche

Oggi abbiamo affrontato uno degli argomenti più importanti del calcolo differenziale: **le derivate**.

## Cosa sono le derivate?
Le derivate rappresentano il tasso di variazione istantaneo di una funzione. In pratica, ci dicono quanto velocemente cambia una funzione in un determinato punto.

## Concetti chiave da ricordare:

### 1. Definizione geometrica
- La derivata di una funzione in un punto è il coefficiente angolare della retta tangente alla curva in quel punto
- È il limite del rapporto incrementale quando l'incremento tende a zero

### 2. Regole principali di derivazione
- **Regola della potenza**: d/dx(x^n) = n*x^(n-1)
- **Regola del prodotto**: (fg)' = f'g + fg'
- **Regola del quoziente**: (f/g)' = (f'g - fg')/g²
- **Regola della catena**: per funzioni composite

### 3. Applicazioni pratiche
Le derivate sono fondamentali per:
- Trovare massimi e minimi di funzioni
- Studiare il comportamento di una funzione
- Risolvere problemi di ottimizzazione
- Analizzare velocità e accelerazione in fisica

## Note per l'esame
- Memorizzare le regole base
- Esercitarsi con funzioni composite
- Capire l'interpretazione geometrica
- Collegare sempre teoria e applicazioni`,
        modelUsed: 'demo-mode',
        createdAt: '2024-01-15T10:43:00Z',
      },
      't2': {
        id: 'e2',
        transcriptionId: 't2',
        elaboratedText: `# Prima Guerra Mondiale

La Grande Guerra (1914-1918) è stato uno dei conflitti più devastanti della storia umana.

## Premesse del conflitto

### Clima politico europeo
L'Europa di inizio '900 era caratterizzata da:
- Forti tensioni nazionalistiche
- Corsa agli armamenti
- Sistema di alleanze complesso

### Le alleanze
- **Triplice Alleanza**: Germania, Austria-Ungheria, Italia
- **Triplice Intesa**: Francia, Russia, Gran Bretagna

## Lo scoppio della guerra

### L'evento scatenante
- **28 giugno 1914**: Assassinio dell'arciduca Francesco Ferdinando a Sarajevo
- L'Austria-Ungheria dichiara guerra alla Serbia
- Il sistema di alleanze fa scattare il conflitto europeo

### Caratteristiche del conflitto
- **Guerra di trincea**: posizioni statiche sul fronte occidentale
- **Guerra totale**: coinvolgimento di tutta la popolazione
- **Nuove tecnologie**: gas, mitragliatrici, aerei

## Conseguenze
- Crollo degli imperi centrali
- Nascita di nuovi stati
- Crisi economica post-bellica
- Premesse per la Seconda Guerra Mondiale

## Collegamenti storici
Questo conflitto segna il passaggio dal mondo ottocentesco a quello moderno, preparando il terreno per i drammatici eventi del Novecento.`,
        modelUsed: 'demo-mode',
        createdAt: '2024-01-14T14:33:00Z',
      }
    }

    return elaborations[transcriptionId as keyof typeof elaborations] || null
  }

  const getConceptMap = (transcriptionId: string): ConceptMap | null => {
    // Controlla prima nei dati reali salvati
    const realConceptMaps = JSON.parse(localStorage.getItem('sbobine_concept_maps') || '{}')
    if (realConceptMaps[transcriptionId]) {
      return realConceptMaps[transcriptionId]
    }

    // Fallback ai dati mock per la demo
    const conceptMaps = {
      't1': {
        id: 'cm1',
        transcriptionId: 't1',
        centralTopic: 'Derivate Matematiche',
        nodes: [
          { id: 'central', label: 'Derivate', type: 'main' as const, description: 'Concetto centrale del calcolo differenziale' },
          { id: 'definition', label: 'Definizione', type: 'secondary' as const, description: 'Limite del rapporto incrementale' },
          { id: 'geometric', label: 'Interpretazione Geometrica', type: 'secondary' as const, description: 'Retta tangente alla curva' },
          { id: 'rules', label: 'Regole di Derivazione', type: 'secondary' as const, description: 'Formule per calcolare derivate' },
          { id: 'power_rule', label: 'Regola della Potenza', type: 'detail' as const, description: 'd/dx(x^n) = n*x^(n-1)' },
          { id: 'chain_rule', label: 'Regola della Catena', type: 'detail' as const, description: 'Per funzioni composite' },
          { id: 'applications', label: 'Applicazioni', type: 'secondary' as const, description: 'Usi pratici delle derivate' }
        ],
        connections: [
          { from: 'central', to: 'definition', label: 'definita come', strength: 'strong' as const },
          { from: 'central', to: 'geometric', label: 'interpretata come', strength: 'strong' as const },
          { from: 'central', to: 'rules', label: 'calcolata con', strength: 'strong' as const },
          { from: 'rules', to: 'power_rule', label: 'include', strength: 'medium' as const },
          { from: 'rules', to: 'chain_rule', label: 'include', strength: 'medium' as const },
          { from: 'central', to: 'applications', label: 'utilizzata in', strength: 'medium' as const }
        ],
        modelUsed: 'demo-mode',
        createdAt: '2024-01-15T10:44:00Z',
      },
      't2': {
        id: 'cm2',
        transcriptionId: 't2',
        centralTopic: 'Prima Guerra Mondiale',
        nodes: [
          { id: 'central', label: 'Prima Guerra Mondiale', type: 'main' as const, description: 'Conflitto globale 1914-1918' },
          { id: 'causes', label: 'Cause', type: 'secondary' as const, description: 'Tensioni che portarono al conflitto' },
          { id: 'alliances', label: 'Alleanze', type: 'secondary' as const, description: 'Sistema di alleanze europee' },
          { id: 'trigger', label: 'Evento Scatenante', type: 'secondary' as const, description: 'Assassinio Francesco Ferdinando' },
          { id: 'warfare', label: 'Tipo di Guerra', type: 'secondary' as const, description: 'Guerra di trincea e totale' },
          { id: 'consequences', label: 'Conseguenze', type: 'secondary' as const, description: 'Cambiamenti post-bellici' },
          { id: 'triple_alliance', label: 'Triplice Alleanza', type: 'detail' as const, description: 'Germania, Austria, Italia' },
          { id: 'triple_entente', label: 'Triplice Intesa', type: 'detail' as const, description: 'Francia, Russia, Regno Unito' }
        ],
        connections: [
          { from: 'causes', to: 'central', label: 'portarono a', strength: 'strong' as const },
          { from: 'alliances', to: 'causes', label: 'contribuirono alle', strength: 'medium' as const },
          { from: 'trigger', to: 'central', label: 'scatenò', strength: 'strong' as const },
          { from: 'central', to: 'warfare', label: 'caratterizzata da', strength: 'medium' as const },
          { from: 'central', to: 'consequences', label: 'produsse', strength: 'strong' as const },
          { from: 'alliances', to: 'triple_alliance', label: 'include', strength: 'strong' as const },
          { from: 'alliances', to: 'triple_entente', label: 'include', strength: 'strong' as const }
        ],
        modelUsed: 'demo-mode',
        createdAt: '2024-01-14T14:34:00Z',
      }
    }

    return conceptMaps[transcriptionId as keyof typeof conceptMaps] || null
  }

  const getQuiz = (transcriptionId: string): Quiz | null => {
    // Controlla prima nei dati reali salvati
    const realQuizzes = JSON.parse(localStorage.getItem('sbobine_quizzes') || '{}')
    if (realQuizzes[transcriptionId]) {
      return realQuizzes[transcriptionId]
    }

    // Fallback ai dati mock per la demo
    const quizzes = {
      't1': {
        id: 'q1',
        transcriptionId: 't1',
        instructions: 'Verifica la tua comprensione della lezione sulle derivate matematiche.',
        questions: [
          {
            id: 1,
            question: 'Cosa rappresenta geometricamente la derivata di una funzione in un punto?',
            options: [
              'A) L\'area sotto la curva',
              'B) Il coefficiente angolare della retta tangente',
              'C) L\'ascissa del punto di massimo',
              'D) Il valore della funzione in quel punto'
            ],
            correct: 'B',
            explanation: 'La derivata in un punto rappresenta geometricamente il coefficiente angolare (o pendenza) della retta tangente alla curva in quel punto.',
            difficulty: 'easy' as const,
            topic: 'Interpretazione geometrica'
          },
          {
            id: 2,
            question: 'Qual è la derivata di x³ usando la regola della potenza?',
            options: [
              'A) x²',
              'B) 3x²',
              'C) 3x³',
              'D) x³/3'
            ],
            correct: 'B',
            explanation: 'Applicando la regola della potenza d/dx(x^n) = n*x^(n-1), otteniamo d/dx(x³) = 3*x² = 3x².',
            difficulty: 'medium' as const,
            topic: 'Regole di derivazione'
          },
          {
            id: 3,
            question: 'La regola della catena si usa per derivare:',
            options: [
              'A) Funzioni costanti',
              'B) Funzioni lineari',
              'C) Funzioni composite',
              'D) Funzioni inverse'
            ],
            correct: 'C',
            explanation: 'La regola della catena è il metodo specifico per derivare funzioni composite, ossia funzioni della forma f(g(x)).',
            difficulty: 'medium' as const,
            topic: 'Regole avanzate'
          }
        ],
        modelUsed: 'demo-mode',
        createdAt: '2024-01-15T10:45:00Z',
      },
      't2': {
        id: 'q2',
        transcriptionId: 't2',
        instructions: 'Test sulla Prima Guerra Mondiale per verificare la comprensione dei concetti principali.',
        questions: [
          {
            id: 1,
            question: 'Quando iniziò la Prima Guerra Mondiale?',
            options: [
              'A) 1913',
              'B) 1914',
              'C) 1915',
              'D) 1916'
            ],
            correct: 'B',
            explanation: 'La Prima Guerra Mondiale iniziò nel 1914, scatenata dall\'assassinio dell\'arciduca Francesco Ferdinando.',
            difficulty: 'easy' as const,
            topic: 'Date storiche'
          },
          {
            id: 2,
            question: 'Quali paesi facevano parte della Triplice Alleanza?',
            options: [
              'A) Francia, Russia, Regno Unito',
              'B) Germania, Austria-Ungheria, Italia',
              'C) Stati Uniti, Francia, Italia',
              'D) Germania, Russia, Austria-Ungheria'
            ],
            correct: 'B',
            explanation: 'La Triplice Alleanza era formata da Germania, Austria-Ungheria e Italia, contrapposta alla Triplice Intesa.',
            difficulty: 'medium' as const,
            topic: 'Alleanze militari'
          },
          {
            id: 3,
            question: 'Quale evento scatenò la Prima Guerra Mondiale?',
            options: [
              'A) L\'invasione del Belgio',
              'B) L\'affondamento del Lusitania',
              'C) L\'assassinio di Francesco Ferdinando',
              'D) La dichiarazione di guerra della Germania'
            ],
            correct: 'C',
            explanation: 'L\'assassinio dell\'arciduca Francesco Ferdinando a Sarajevo il 28 giugno 1914 fu l\'evento scatenante che portò allo scoppio della guerra.',
            difficulty: 'medium' as const,
            topic: 'Cause del conflitto'
          }
        ],
        modelUsed: 'demo-mode',
        createdAt: '2024-01-14T14:35:00Z',
      }
    }

    return quizzes[transcriptionId as keyof typeof quizzes] || null
  }

  // Funzioni per gestire cartelle
  const createFolder = (name: string, color: string) => {
    const newFolder: Folder = {
      id: uuidv4(),
      name,
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const updatedFolders = [...folders, newFolder]
    setFolders(updatedFolders)
    localStorage.setItem('sbobine_folders', JSON.stringify(updatedFolders))
    return newFolder
  }

  const updateFolder = (id: string, updates: Partial<Omit<Folder, 'id' | 'createdAt'>>) => {
    const updatedFolders = folders.map(folder => 
      folder.id === id 
        ? { ...folder, ...updates, updatedAt: new Date().toISOString() }
        : folder
    )
    setFolders(updatedFolders)
    localStorage.setItem('sbobine_folders', JSON.stringify(updatedFolders))
  }

  const deleteFolder = (id: string) => {
    // Rimuovi la cartella dalle lezioni prima di eliminare
    const updatedFiles = audioFiles.map(file => 
      file.folderId === id ? { ...file, folderId: undefined } : file
    )
    setAudioFiles(updatedFiles)
    localStorage.setItem('sbobine_audio_files', JSON.stringify(updatedFiles))

    // Elimina la cartella
    const updatedFolders = folders.filter(folder => folder.id !== id)
    setFolders(updatedFolders)
    localStorage.setItem('sbobine_folders', JSON.stringify(updatedFolders))
  }



  const moveLessonToFolder = (lessonId: string, folderId?: string) => {
    const updatedFiles = audioFiles.map(file => 
      file.id === lessonId ? { ...file, folderId } : file
    )
    setAudioFiles(updatedFiles)
    localStorage.setItem('sbobine_audio_files', JSON.stringify(updatedFiles))
  }

  return {
    audioFiles,
    folders,
    loading,
    addAudioFile,
    updateAudioFile,
    deleteAudioFile,
    refreshData,
    getTranscription,
    getSummary,
    getElaboration,
    getConceptMap,
    getQuiz,
    saveTranscription,
    saveSummary,
    // Funzioni cartelle
    createFolder,
    updateFolder,
    deleteFolder,
    moveLessonToFolder,
  }
}
