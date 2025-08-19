import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getOpenAIConfig, PROMPTS } from '@/config/api'

export async function POST(request: NextRequest) {
  try {
    console.log('Ricevuta richiesta di mappa concettuale')
    
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

    console.log(`Generazione mappa concettuale per testo di ${transcriptionText.length} caratteri`)

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

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('Risposta vuota da OpenAI')
    }

    // Parse della risposta JSON
    let conceptMapData
    try {
      conceptMapData = JSON.parse(responseText)
    } catch (parseError) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        conceptMapData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Risposta OpenAI non in formato JSON valido')
      }
    }

    // Validazione struttura
    const validatedMap = validateConceptMapStructure(conceptMapData)

    const result = {
      id: generateId(),
      centralTopic: validatedMap.centralTopic,
      nodes: validatedMap.nodes,
      connections: validatedMap.connections,
      modelUsed: config.completionModel,
      language: language,
      tokensUsed: completion.usage?.total_tokens || 0,
      createdAt: new Date().toISOString()
    }

    console.log(`Mappa concettuale completata: ${result.tokensUsed} tokens utilizzati`)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Errore durante la generazione della mappa concettuale:', error)
    
    if (error.code === 'invalid_api_key' || !process.env.OPENAI_API_KEY) {
      console.log('Usando dati mock per mappa concettuale')
      return NextResponse.json({
        success: true,
        data: {
          id: generateId(),
          centralTopic: "Argomento della Lezione (Demo)",
          nodes: [
            { id: "central", label: "Argomento Principale", type: "main", description: "Tema centrale della lezione" },
            { id: "concept1", label: "Primo Concetto", type: "secondary", description: "Primo argomento trattato" },
            { id: "concept2", label: "Secondo Concetto", type: "secondary", description: "Secondo argomento importante" },
            { id: "detail1", label: "Dettaglio 1", type: "detail", description: "Approfondimento del primo concetto" },
            { id: "detail2", label: "Dettaglio 2", type: "detail", description: "Approfondimento del secondo concetto" },
            { id: "example1", label: "Esempio Pratico", type: "detail", description: "Esempio applicativo" }
          ],
          connections: [
            { from: "central", to: "concept1", label: "include", strength: "strong" },
            { from: "central", to: "concept2", label: "include", strength: "strong" },
            { from: "concept1", to: "detail1", label: "approfondito in", strength: "medium" },
            { from: "concept2", to: "detail2", label: "approfondito in", strength: "medium" },
            { from: "concept1", to: "example1", label: "esempio di", strength: "weak" },
            { from: "concept2", to: "example1", label: "applicato in", strength: "weak" }
          ],
          modelUsed: 'demo-mode',
          language: 'it',
          tokensUsed: 0,
          createdAt: new Date().toISOString()
        }
      })
    }
    
    return NextResponse.json(
      { error: 'Errore interno del server durante la generazione della mappa concettuale' },
      { status: 500 }
    )
  }
}

function validateConceptMapStructure(data: any) {
  return {
    centralTopic: data.centralTopic || 'Argomento della Lezione',
    nodes: Array.isArray(data.nodes) 
      ? data.nodes.filter((node: any) => node.id && node.label).slice(0, 12)
      : [],
    connections: Array.isArray(data.connections)
      ? data.connections.filter((conn: any) => conn.from && conn.to).slice(0, 15)
      : []
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
