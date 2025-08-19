import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getOpenAIConfig, PROMPTS } from '@/config/api'

export async function POST(request: NextRequest) {
  try {
    console.log('Ricevuta richiesta di rielaborazione')
    
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

    console.log(`Generazione rielaborato per testo di ${transcriptionText.length} caratteri`)

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
      temperature: 0.4, // Leggermente più creativo per la rielaborazione
    })

    const elaboratedText = completion.choices[0]?.message?.content
    if (!elaboratedText) {
      throw new Error('Risposta vuota da OpenAI')
    }

    const result = {
      id: generateId(),
      elaboratedText: elaboratedText,
      modelUsed: config.completionModel,
      language: language,
      wordCount: elaboratedText.split(' ').length,
      tokensUsed: completion.usage?.total_tokens || 0,
      createdAt: new Date().toISOString()
    }

    console.log(`Rielaborazione completata: ${result.tokensUsed} tokens utilizzati`)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Errore durante la rielaborazione:', error)
    
    if (error.code === 'invalid_api_key' || !process.env.OPENAI_API_KEY) {
      console.log('Usando dati mock per rielaborazione')
      return NextResponse.json({
        success: true,
        data: {
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
- Collegare con lezioni precedenti

*Questa è una versione demo. Con una chiave API OpenAI configurata, otterresti una rielaborazione personalizzata basata sul contenuto reale della tua lezione.*`,
          modelUsed: 'demo-mode',
          language: 'it',
          wordCount: 150,
          tokensUsed: 0,
          createdAt: new Date().toISOString()
        }
      })
    }
    
    return NextResponse.json(
      { error: 'Errore interno del server durante la rielaborazione' },
      { status: 500 }
    )
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
