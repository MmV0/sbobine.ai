export const API_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    transcriptionModel: 'whisper-1',
    completionModel: 'gpt-4o-mini', // Usa gpt-4o-mini che supporta JSON mode
    maxTokens: 4000,
    temperature: 0.3
  },
  upload: {
    maxFileSize: 200 * 1024 * 1024, // 200MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg'],
    uploadDir: 'uploads'
  },
  job: {
    timeout: 5 * 60 * 1000, // 5 minuti
    retryAttempts: 3,
    retryDelay: 1000
  }
}

export const PROMPTS = {
  summarization: `Analizza la seguente trascrizione di una lezione e crea un riassunto strutturato in formato JSON con le seguenti sezioni:

1. "overview": Una panoramica generale della lezione (2-3 frasi)
2. "keyConcepts": Array dei concetti chiave (massimo 8 elementi)
3. "definitions": Array di oggetti con "term" e "definition" per i termini importanti
4. "dates": Array di oggetti con "date" e "event" per date/eventi importanti
5. "qna": Array di oggetti con "question" e "answer" per domande e risposte estratte

Mantieni un tono accademico e concentrati sui contenuti più rilevanti per lo studio.

Trascrizione da analizzare:
`,

  elaboration: `Trasforma la seguente trascrizione di lezione in una sbobina studentesca rielaborata. 
Scrivi come farebbe uno studente attento che riorganizza i contenuti per studiare meglio:

- Utilizza un linguaggio chiaro e diretto
- Riorganizza le informazioni in modo logico
- Aggiungi collegamenti tra concetti
- Includi esempi e chiarimenti
- Mantieni uno stile discorsivo ma organizzato
- Usa bullet points e sottosezioni quando utile

Trascrizione da rielaborare:
`,

  conceptMap: `Crea una mappa concettuale della seguente lezione in formato JSON con questa struttura:

{
  "centralTopic": "Argomento principale",
  "nodes": [
    {
      "id": "unique_id",
      "label": "Concetto",
      "type": "main|secondary|detail",
      "description": "Breve spiegazione"
    }
  ],
  "connections": [
    {
      "from": "node_id",
      "to": "node_id", 
      "label": "tipo di relazione",
      "strength": "strong|medium|weak"
    }
  ]
}

Crea una mappa con 8-12 nodi collegati logicamente. Usa relazioni come: "è parte di", "causa", "esempio di", "si applica a", ecc.

Trascrizione da mappare:
`,

  quiz: `Crea un quiz a scelta multipla sulla seguente lezione. Formato JSON:

{
  "instructions": "Istruzioni per il quiz",
  "questions": [
    {
      "id": 1,
      "question": "Domanda chiara e specifica",
      "options": [
        "A) Prima opzione",
        "B) Seconda opzione", 
        "C) Terza opzione",
        "D) Quarta opzione"
      ],
      "correct": "A",
      "explanation": "Spiegazione della risposta corretta",
      "difficulty": "easy|medium|hard",
      "topic": "argomento specifico"
    }
  ]
}

Crea 8-10 domande di difficoltà variabile che coprano tutti i concetti principali. Includi domande su definizioni, applicazioni e collegamenti tra concetti.

Trascrizione per il quiz:
`
}

export const getOpenAIConfig = () => {
  const apiKey = process.env.OPENAI_API_KEY
  
  return {
    apiKey: apiKey || '',
    ...API_CONFIG.openai
  }
}
