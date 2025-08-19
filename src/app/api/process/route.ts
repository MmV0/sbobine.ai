import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getOpenAIConfig, PROMPTS } from '@/config/api'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('audio') as File
    const language = formData.get('language') as string || 'it'
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'File audio non trovato' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utente richiesto' },
        { status: 400 }
      )
    }

    // Genera un ID per il job
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log(`Avvio processo completo per job ${jobId}`)

    // Avvia il processo asincrono
    processAudioFileAsync(jobId, file, language, userId)

    // Ritorna immediatamente l'ID del job
    return NextResponse.json({
      success: true,
      data: {
        jobId: jobId,
        status: 'PROCESSING',
        message: 'Elaborazione avviata. Controlla lo stato del job.',
        estimatedTime: Math.round((file.size / (1024 * 1024)) * 2) // ~2 minuti per MB
      }
    })

  } catch (error) {
    console.error('Errore durante l\'avvio del processo:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// Processo asincrono per elaborare il file audio
async function processAudioFileAsync(
  jobId: string,
  file: File,
  language: string,
  userId: string
) {
  try {
    console.log(`[${jobId}] Inizio elaborazione file: ${file.name}`)
    
    // Simula il salvataggio dello stato del job
    await updateJobStatus(jobId, 'TRANSCRIBING', 25)

    // Step 1: Trascrizione diretta (senza fetch interno)
    console.log(`[${jobId}] Avvio trascrizione...`)
    const transcriptionResult = await processTranscription(file, language)
    console.log(`[${jobId}] Trascrizione completata`)

    await updateJobStatus(jobId, 'SUMMARIZING', 50)

    // Step 2: Generazione sintesi strutturata
    console.log(`[${jobId}] Avvio generazione sintesi...`)
    const summaryResult = await processSummary(transcriptionResult.cleanText, language)
    console.log(`[${jobId}] Sintesi completata`)

    await updateJobStatus(jobId, 'ELABORATING', 60)

    // Step 3: Generazione rielaborato
    console.log(`[${jobId}] Avvio rielaborazione...`)
    const elaborationResult = await processElaboration(transcriptionResult.cleanText, language)
    console.log(`[${jobId}] Rielaborazione completata`)

    await updateJobStatus(jobId, 'GENERATING_MAP', 75)

    // Step 4: Generazione mappa concettuale
    console.log(`[${jobId}] Avvio mappa concettuale...`)
    const conceptMapResult = await processConceptMap(transcriptionResult.cleanText, language)
    console.log(`[${jobId}] Mappa concettuale completata`)

    await updateJobStatus(jobId, 'GENERATING_QUIZ', 85)

    // Step 5: Generazione quiz
    console.log(`[${jobId}] Avvio generazione quiz...`)
    const quizResult = await processQuiz(transcriptionResult.cleanText, language)
    console.log(`[${jobId}] Quiz completato`)

    // Step 3: Salva risultato finale
    const finalResult = {
      jobId,
      userId,
      audioFile: {
        id: generateId(),
        fileName: file.name,
        fileSize: file.size,
        duration: transcriptionResult.duration,
        language: language,
        status: 'READY'
      },
      transcription: transcriptionResult,
      summary: summaryResult,
      elaboration: elaborationResult,
      conceptMap: conceptMapResult,
      quiz: quizResult,
      completedAt: new Date().toISOString()
    }

    await updateJobStatus(jobId, 'COMPLETED', 100, finalResult)
    console.log(`[${jobId}] Processo completato con successo`)

  } catch (error) {
    console.error(`[${jobId}] Errore durante l'elaborazione:`, error)
    await updateJobStatus(jobId, 'ERROR', 0, null, error.message)
  }
}

// Simula il salvataggio dello stato del job (in produzione useresti un database)
async function updateJobStatus(
  jobId: string, 
  status: string, 
  progress: number, 
  result?: any, 
  error?: string
) {
  // In produzione, salveresti questo in un database
  console.log(`[${jobId}] Status: ${status}, Progress: ${progress}%`)
  
  // Per la demo, potresti salvare in un file o in memoria
  // Qui simulo il salvataggio
  const jobData = {
    jobId,
    status,
    progress,
    result,
    error,
    updatedAt: new Date().toISOString()
  }
  
  // Salva in memoria per questa demo (in produzione usa Redis/Database)
  if (typeof global !== 'undefined') {
    (global as any).jobStatus = (global as any).jobStatus || {}
    ;(global as any).jobStatus[jobId] = jobData
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Funzioni helper per elaborazione diretta
async function processTranscription(file: File, language: string) {
  try {
    const config = getOpenAIConfig()
    const openai = new OpenAI({
      apiKey: config.apiKey,
    })

    console.log(`Processando trascrizione per: ${file.name}`)

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: config.transcriptionModel,
      language: language,
      response_format: 'json',
      temperature: 0.2,
    })

    // Pulizia del testo
    const cleanText = cleanTranscriptionText(transcription.text)

    return {
      id: generateId(),
      rawText: transcription.text,
      cleanText: cleanText,
      language: language,
      duration: estimateDuration(file.size),
      modelUsed: config.transcriptionModel,
      wordCount: cleanText.split(' ').length,
      createdAt: new Date().toISOString()
    }

  } catch (error: any) {
    console.error('Errore trascrizione:', error)
    
    // Se non c'è la chiave API o fallisce, usa dati mock
    if (error.code === 'invalid_api_key' || !process.env.OPENAI_API_KEY) {
      console.log('Usando dati mock per trascrizione')
      return {
        id: generateId(),
        rawText: 'Questa è una trascrizione di esempio generata dalla modalità demo.',
        cleanText: 'Questa è una trascrizione di esempio generata dalla modalità demo. Il contenuto reale verrebbe trascritto utilizzando Whisper di OpenAI.',
        language: language,
        duration: estimateDuration(file.size),
        modelUsed: 'demo-mode',
        wordCount: 25,
        createdAt: new Date().toISOString()
      }
    }
    
    throw error
  }
}

async function processSummary(transcriptionText: string, language: string) {
  const config = getOpenAIConfig()
  
  try {
    const openai = new OpenAI({
      apiKey: config.apiKey,
    })

    console.log('Generando riassunto...')

    const prompt = PROMPTS.summarization + transcriptionText

    const completion = await openai.chat.completions.create({
      model: config.completionModel,
      messages: [
        {
          role: 'system',
          content: 'Sei un assistente specializzato nella creazione di riassunti strutturati per lezioni universitarie. Rispondi sempre in italiano e SOLO in formato JSON valido, senza testo aggiuntivo.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature
      // Rimosso response_format per compatibilità con GPT-4 standard
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('Risposta vuota da OpenAI')
    }

    console.log('Risposta GPT:', responseText.substring(0, 200) + '...')

    // Prova a estrarre JSON dalla risposta
    let summaryData
    try {
      // Rimuovi blocchi markdown se presenti
      let cleanedResponse = responseText.trim()
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      summaryData = JSON.parse(cleanedResponse)
    } catch (parseError) {
      // Se fallisce, cerca di estrarre JSON da una risposta più lunga
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          summaryData = JSON.parse(jsonMatch[0])
        } catch (secondParseError) {
          console.error('Errore parsing JSON:', secondParseError)
          throw new Error('Risposta OpenAI non in formato JSON valido')
        }
      } else {
        console.error('Nessun JSON trovato nella risposta:', responseText)
        throw new Error('Nessun JSON trovato nella risposta OpenAI')
      }
    }

    const validatedSummary = validateSummaryStructure(summaryData)

    return {
      id: generateId(),
      summaryText: generateTextSummary(validatedSummary),
      sections: validatedSummary,
      modelUsed: config.completionModel,
      style: 'structured',
      language: language,
      wordCount: responseText.split(' ').length,
      tokensUsed: completion.usage?.total_tokens || 0,
      createdAt: new Date().toISOString()
    }

  } catch (error: any) {
    console.error('Errore riassunto:', error)
    
    // Se non c'è la chiave API o fallisce, usa dati mock
    if (error.code === 'invalid_api_key' || !process.env.OPENAI_API_KEY) {
      console.log('Usando dati mock per riassunto')
      return {
        id: generateId(),
        summaryText: 'Riassunto di esempio generato dalla modalità demo',
        sections: {
          overview: 'Questo è un riassunto di esempio generato dalla modalità demo per testare l\'interfaccia utente.',
          keyConcepts: ['Concetto demo 1', 'Concetto demo 2', 'Concetto demo 3'],
          definitions: [
            { term: 'Demo', definition: 'Dimostrazione del funzionamento dell\'applicazione' }
          ],
          dates: [
            { date: '2024', event: 'Anno di sviluppo dell\'applicazione Sbobine' }
          ],
          qna: [
            { question: 'Cos\'è la modalità demo?', answer: 'Una modalità che simula i risultati senza utilizzare le API reali' }
          ]
        },
        modelUsed: 'demo-mode',
        style: 'structured',
        language: language,
        wordCount: 50,
        tokensUsed: 0,
        createdAt: new Date().toISOString()
      }
    }
    
    throw error
  }
}

// Funzioni di utilità (duplicate dalle altre API)
function cleanTranscriptionText(text: string): string {
  return text
    .replace(/\b(uhm|eh|ah|mm|hmm)\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/([.!?])\s*([a-z])/g, '$1 $2')
    .replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
    .trim()
}

function estimateDuration(fileSize: number): number {
  return Math.round((fileSize / (1024 * 1024)) * 60)
}

function validateSummaryStructure(data: any) {
  return {
    overview: data.overview || 'Riassunto non disponibile',
    keyConcepts: Array.isArray(data.keyConcepts) ? data.keyConcepts.slice(0, 8) : [],
    definitions: Array.isArray(data.definitions) 
      ? data.definitions.filter((def: any) => def.term && def.definition).slice(0, 10)
      : [],
    dates: Array.isArray(data.dates)
      ? data.dates.filter((date: any) => date.date && date.event).slice(0, 10)
      : [],
    qna: Array.isArray(data.qna)
      ? data.qna.filter((qa: any) => qa.question && qa.answer).slice(0, 8)
      : []
  }
}

function generateTextSummary(sections: any): string {
  let summary = sections.overview + '\n\n'
  
  if (sections.keyConcepts.length > 0) {
    summary += 'Concetti principali:\n'
    summary += sections.keyConcepts.map((concept: string, i: number) => `${i + 1}. ${concept}`).join('\n')
    summary += '\n\n'
  }
  
  if (sections.definitions.length > 0) {
    summary += 'Definizioni chiave:\n'
    summary += sections.definitions.map((def: any) => `• ${def.term}: ${def.definition}`).join('\n')
    summary += '\n\n'
  }
  
  return summary.trim()
}

// Funzione helper per rielaborazione
async function processElaboration(transcriptionText: string, language: string) {
  const config = getOpenAIConfig()
  
  try {
    const openai = new OpenAI({
      apiKey: config.apiKey,
    })

    const prompt = PROMPTS.elaboration + transcriptionText

    const completion = await openai.chat.completions.create({
      model: config.completionModel,
      messages: [
        {
          role: 'system',
          content: 'Sei uno studente universitario esperto che rielabora le lezioni in modo chiaro e organizzato per facilitare lo studio. Scrivi in italiano con stile discorsivo ma ben strutturato.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.maxTokens,
      temperature: 0.4,
    })

    const elaboratedText = completion.choices[0]?.message?.content || ''

    return {
      id: generateId(),
      elaboratedText: elaboratedText,
      modelUsed: config.completionModel,
      createdAt: new Date().toISOString()
    }

  } catch (error: any) {
    console.error('Errore rielaborazione:', error)
    
    if (error.code === 'invalid_api_key' || !config.apiKey) {
      return {
        id: generateId(),
        elaboratedText: `# Rielaborazione della Lezione (Demo)

Questa è una rielaborazione di esempio che mostra come uno studente potrebbe riorganizzare i contenuti della lezione per studiare meglio.

## Punti Principali
- Primo concetto importante con spiegazione chiara
- Secondo argomento con esempi pratici
- Collegamenti tra i vari temi trattati

## Approfondimenti
La lezione copre aspetti fondamentali che sono essenziali per comprendere l'argomento. Ogni concetto si collega logicamente al successivo, creando un percorso di apprendimento coerente.

## Note per lo Studio
- Rivedere le definizioni principali
- Praticare con esempi simili
- Collegare con lezioni precedenti`,
        modelUsed: 'demo-mode',
        createdAt: new Date().toISOString()
      }
    }
    
    throw error
  }
}

// Funzione helper per mappa concettuale
async function processConceptMap(transcriptionText: string, language: string) {
  const config = getOpenAIConfig()
  
  try {
    const openai = new OpenAI({
      apiKey: config.apiKey,
    })

    const prompt = PROMPTS.conceptMap + transcriptionText

    const completion = await openai.chat.completions.create({
      model: config.completionModel,
      messages: [
        {
          role: 'system',
          content: 'Sei un esperto di mappe concettuali e pedagogia. Crea mappe concettuali chiare e ben strutturate che aiutino lo studio. Rispondi SOLO in formato JSON valido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.maxTokens,
      temperature: 0.3,
    })

    const responseText = completion.choices[0]?.message?.content || '{}'

    let conceptMapData
    try {
      // Rimuovi blocchi markdown se presenti
      let cleanedResponse = responseText.trim()
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      conceptMapData = JSON.parse(cleanedResponse)
    } catch (parseError) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      conceptMapData = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    }

    const validatedMap = {
      centralTopic: conceptMapData.centralTopic || 'Argomento della Lezione',
      nodes: Array.isArray(conceptMapData.nodes) 
        ? conceptMapData.nodes.filter((node: any) => node.id && node.label).slice(0, 12)
        : [],
      connections: Array.isArray(conceptMapData.connections)
        ? conceptMapData.connections.filter((conn: any) => conn.from && conn.to).slice(0, 15)
        : []
    }

    return {
      id: generateId(),
      centralTopic: validatedMap.centralTopic,
      nodes: validatedMap.nodes,
      connections: validatedMap.connections,
      modelUsed: config.completionModel,
      createdAt: new Date().toISOString()
    }

  } catch (error: any) {
    console.error('Errore mappa concettuale:', error)
    
    if (error.code === 'invalid_api_key' || !config.apiKey) {
      return {
        id: generateId(),
        centralTopic: "Argomento della Lezione (Demo)",
        nodes: [
          { id: "central", label: "Argomento Principale", type: "main", description: "Tema centrale della lezione" },
          { id: "concept1", label: "Primo Concetto", type: "secondary", description: "Primo argomento trattato" },
          { id: "concept2", label: "Secondo Concetto", type: "secondary", description: "Secondo argomento importante" },
          { id: "detail1", label: "Dettaglio 1", type: "detail", description: "Approfondimento del primo concetto" },
          { id: "detail2", label: "Dettaglio 2", type: "detail", description: "Approfondimento del secondo concetto" }
        ],
        connections: [
          { from: "central", to: "concept1", label: "include", strength: "strong" },
          { from: "central", to: "concept2", label: "include", strength: "strong" },
          { from: "concept1", to: "detail1", label: "approfondito in", strength: "medium" },
          { from: "concept2", to: "detail2", label: "approfondito in", strength: "medium" }
        ],
        modelUsed: 'demo-mode',
        createdAt: new Date().toISOString()
      }
    }
    
    throw error
  }
}

// Funzione helper per quiz
async function processQuiz(transcriptionText: string, language: string) {
  const config = getOpenAIConfig()
  
  try {
    const openai = new OpenAI({
      apiKey: config.apiKey,
    })

    const prompt = PROMPTS.quiz + transcriptionText

    const completion = await openai.chat.completions.create({
      model: config.completionModel,
      messages: [
        {
          role: 'system',
          content: 'Sei un professore universitario esperto nella creazione di quiz educativi. Crea domande equilibrate, chiare e pedagogicamente valide. Rispondi SOLO in formato JSON valido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.maxTokens,
      temperature: 0.3,
    })

    const responseText = completion.choices[0]?.message?.content || '{}'

    let quizData
    try {
      // Rimuovi blocchi markdown se presenti
      let cleanedResponse = responseText.trim()
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      quizData = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.log('Errore parsing JSON quiz:', parseError)
      console.log('Response text:', responseText)
      
      try {
        // Prova a estrarre il JSON dal testo
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          // Pulisci il JSON da possibili caratteri malformati
          let cleanJson = jsonMatch[0]
          // Rimuovi trailing commas che possono causare errori
          cleanJson = cleanJson.replace(/,(\s*[}\]])/g, '$1')
          quizData = JSON.parse(cleanJson)
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (secondParseError) {
        console.log('Errore secondo tentativo parsing:', secondParseError)
        quizData = {}
      }
    }

    const questions = Array.isArray(quizData.questions) 
      ? quizData.questions.filter((q: any) => 
          q.question && 
          Array.isArray(q.options) && 
          q.options.length >= 4 &&
          q.correct &&
          q.explanation
        ).slice(0, 10)
      : []

    return {
      id: generateId(),
      instructions: quizData.instructions || 'Rispondi alle seguenti domande sulla lezione.',
      questions: questions,
      modelUsed: config.completionModel,
      createdAt: new Date().toISOString()
    }

  } catch (error: any) {
    console.error('Errore quiz:', error)
    
    if (error.code === 'invalid_api_key' || !config.apiKey) {
      return {
        id: generateId(),
        instructions: "Quiz di verifica sulla lezione. Seleziona la risposta corretta per ogni domanda.",
        questions: [
          {
            id: 1,
            question: "Qual è l'argomento principale trattato nella lezione?",
            options: [
              "A) Primo argomento di esempio",
              "B) Argomento principale della lezione", 
              "C) Terzo argomento correlato",
              "D) Argomento non trattato"
            ],
            correct: "B",
            explanation: "L'argomento principale è quello discusso più approfonditamente durante la lezione.",
            difficulty: "easy",
            topic: "Concetti generali"
          }
        ],
        modelUsed: 'demo-mode',
        createdAt: new Date().toISOString()
      }
    }
    
    throw error
  }
}
