import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getOpenAIConfig, PROMPTS } from '@/config/api'

export async function POST(request: NextRequest) {
  try {
    console.log('Ricevuta richiesta di quiz')
    
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

    console.log(`Generazione quiz per testo di ${transcriptionText.length} caratteri`)

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

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('Risposta vuota da OpenAI')
    }

    // Parse della risposta JSON
    let quizData
    try {
      quizData = JSON.parse(responseText)
    } catch (parseError) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Risposta OpenAI non in formato JSON valido')
      }
    }

    // Validazione struttura
    const validatedQuiz = validateQuizStructure(quizData)

    const result = {
      id: generateId(),
      instructions: validatedQuiz.instructions,
      questions: validatedQuiz.questions,
      modelUsed: config.completionModel,
      language: language,
      tokensUsed: completion.usage?.total_tokens || 0,
      createdAt: new Date().toISOString()
    }

    console.log(`Quiz completato: ${result.tokensUsed} tokens utilizzati`)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Errore durante la generazione del quiz:', error)
    
    if (error.code === 'invalid_api_key' || !process.env.OPENAI_API_KEY) {
      console.log('Usando dati mock per quiz')
      return NextResponse.json({
        success: true,
        data: {
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
            },
            {
              id: 2,
              question: "Quale tra questi è un concetto chiave della lezione?",
              options: [
                "A) Concetto non rilevante",
                "B) Tema secondario",
                "C) Concetto chiave importante",
                "D) Argomento di altra materia"
              ],
              correct: "C",
              explanation: "I concetti chiave sono quelli fondamentali per comprendere l'argomento.",
              difficulty: "medium",
              topic: "Concetti principali"
            },
            {
              id: 3,
              question: "Come si applica praticamente quanto spiegato?",
              options: [
                "A) Non ha applicazioni pratiche",
                "B) Solo in contesti teorici",
                "C) Attraverso esempi concreti",
                "D) Unicamente in laboratorio"
              ],
              correct: "C",
              explanation: "Gli esempi concreti aiutano a comprendere l'applicazione pratica dei concetti teorici.",
              difficulty: "medium",
              topic: "Applicazioni pratiche"
            }
          ],
          modelUsed: 'demo-mode',
          language: 'it',
          tokensUsed: 0,
          createdAt: new Date().toISOString()
        }
      })
    }
    
    return NextResponse.json(
      { error: 'Errore interno del server durante la generazione del quiz' },
      { status: 500 }
    )
  }
}

function validateQuizStructure(data: any) {
  const questions = Array.isArray(data.questions) 
    ? data.questions.filter((q: any) => 
        q.question && 
        Array.isArray(q.options) && 
        q.options.length >= 4 &&
        q.correct &&
        q.explanation
      ).slice(0, 10)
    : []

  return {
    instructions: data.instructions || 'Rispondi alle seguenti domande sulla lezione.',
    questions: questions
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
