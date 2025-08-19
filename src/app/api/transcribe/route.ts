import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getOpenAIConfig } from '@/config/api'

export async function POST(request: NextRequest) {
  try {
    console.log('Ricevuta richiesta di trascrizione')
    
    // Verifica che la chiave API sia configurata
    const config = getOpenAIConfig()
    const openai = new OpenAI({
      apiKey: config.apiKey,
    })

    // Estrai il file dalla richiesta
    const formData = await request.formData()
    const file = formData.get('audio') as File
    const language = formData.get('language') as string || 'it'

    if (!file) {
      return NextResponse.json(
        { error: 'File audio non trovato' },
        { status: 400 }
      )
    }

    console.log(`Processando file: ${file.name}, dimensione: ${file.size} bytes`)

    // Verifica dimensione file
    if (file.size > 200 * 1024 * 1024) { // 200MB
      return NextResponse.json(
        { error: 'File troppo grande. Massimo 200MB.' },
        { status: 400 }
      )
    }

    // Verifica tipo file
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg']
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      return NextResponse.json(
        { error: 'Tipo di file non supportato. Usa MP3, WAV, M4A, AAC o OGG.' },
        { status: 400 }
      )
    }

    // Trascrizione con Whisper
    console.log('Avvio trascrizione con Whisper...')
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: config.transcriptionModel,
      language: language,
      response_format: 'json',
      temperature: 0.2,
    })

    console.log('Trascrizione completata')

    // Pulizia del testo
    const cleanText = cleanTranscriptionText(transcription.text)

    const result = {
      id: generateId(),
      rawText: transcription.text,
      cleanText: cleanText,
      language: language,
      duration: estimateDuration(file.size),
      modelUsed: config.transcriptionModel,
      wordCount: cleanText.split(' ').length,
      createdAt: new Date().toISOString()
    }

    console.log(`Trascrizione completata: ${result.wordCount} parole`)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Errore durante la trascrizione:', error)
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'Quota API OpenAI esaurita. Contatta l\'amministratore.' },
        { status: 429 }
      )
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Chiave API OpenAI non valida.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Errore interno del server durante la trascrizione' },
      { status: 500 }
    )
  }
}

// Funzioni di utilità
function cleanTranscriptionText(text: string): string {
  return text
    // Rimuovi filler words comuni
    .replace(/\b(uhm|eh|ah|mm|hmm)\b/gi, '')
    // Rimuovi spazi multipli
    .replace(/\s+/g, ' ')
    // Migliora la punteggiatura
    .replace(/([.!?])\s*([a-z])/g, '$1 $2')
    // Capitalizza inizio frasi
    .replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
    .trim()
}

function estimateDuration(fileSize: number): number {
  // Stima approssimativa: ~1MB per minuto di audio MP3 a 128kbps
  return Math.round((fileSize / (1024 * 1024)) * 60)
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
