import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getOpenAIConfig, PROMPTS } from '@/config/api'

export async function POST(request: NextRequest) {
  try {
    console.log('Ricevuta richiesta di riassunto')
    
    const config = getOpenAIConfig()
    const openai = new OpenAI({
      apiKey: config.apiKey,
    })

    const { transcriptionText, language = 'it' } = await request.json()

    if (!transcriptionText || typeof transcriptionText !== 'string') {
      return NextResponse.json(
        { error: 'Testo di trascrizione mancante o non valido' },
        { status: 400 }
      )
    }

    if (transcriptionText.length < 50) {
      return NextResponse.json(
        { error: 'Testo troppo breve per generare un riassunto significativo' },
        { status: 400 }
      )
    }

    console.log(`Generazione riassunto per testo di ${transcriptionText.length} caratteri`)

    // Prompt per la generazione del riassunto
    const prompt = PROMPTS.summarization + transcriptionText

    // Chiamata a GPT-4 per il riassunto
    console.log('Avvio generazione riassunto con GPT-4...')
    const completion = await openai.chat.completions.create({
      model: config.completionModel,
      messages: [
        {
          role: 'system',
          content: 'Sei un assistente specializzato nella creazione di riassunti strutturati per lezioni universitarie. Rispondi sempre in italiano e in formato JSON valido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      // response_format: { type: 'json_object' } // Rimosso per compatibilità
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('Risposta vuota da OpenAI')
    }

    console.log('Riassunto generato, parsing JSON...')

    // Parse della risposta JSON
    let summaryData
    try {
      summaryData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Errore parsing JSON:', parseError)
      throw new Error('Risposta OpenAI non in formato JSON valido')
    }

    // Validazione della struttura del riassunto
    const validatedSummary = validateSummaryStructure(summaryData)

    const result = {
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

    console.log(`Riassunto completato: ${result.tokensUsed} tokens utilizzati`)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Errore durante la generazione del riassunto:', error)
    
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

    if (error.code === 'context_length_exceeded') {
      return NextResponse.json(
        { error: 'Testo troppo lungo per essere processato. Prova con un file più breve.' },
        { status: 413 }
      )
    }

    return NextResponse.json(
      { error: 'Errore interno del server durante la generazione del riassunto' },
      { status: 500 }
    )
  }
}

// Funzioni di utilità
function validateSummaryStructure(data: any) {
  const defaultStructure = {
    overview: '',
    keyConcepts: [],
    definitions: [],
    dates: [],
    qna: []
  }

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

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
