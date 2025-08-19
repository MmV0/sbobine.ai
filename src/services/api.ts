export interface TranscriptionJob {
  jobId: string
  status: 'PROCESSING' | 'TRANSCRIBING' | 'SUMMARIZING' | 'ELABORATING' | 'GENERATING_MAP' | 'GENERATING_QUIZ' | 'COMPLETED' | 'ERROR'
  progress: number
  result?: {
    audioFile: any
    transcription: any
    summary: any
    elaboration: any
    conceptMap: any
    quiz: any
  }
  error?: string
  estimatedTime?: number
}

export class AudioProcessingAPI {
  private static baseUrl = '/api'

  // Avvia il processo di elaborazione completo
  static async processAudioFile(
    file: File, 
    language: string, 
    userId: string
  ): Promise<TranscriptionJob> {
    const formData = new FormData()
    formData.append('audio', file)
    formData.append('language', language)
    formData.append('userId', userId)

    const response = await fetch(`${this.baseUrl}/process`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Errore durante l\'elaborazione')
    }

    const result = await response.json()
    return result.data
  }

  // Controlla lo stato di un job
  static async getJobStatus(jobId: string): Promise<TranscriptionJob> {
    const response = await fetch(`${this.baseUrl}/job/${jobId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Errore durante il recupero dello stato')
    }

    const result = await response.json()
    return result.data
  }

  // Solo trascrizione
  static async transcribeAudio(file: File, language: string): Promise<any> {
    const formData = new FormData()
    formData.append('audio', file)
    formData.append('language', language)

    const response = await fetch(`${this.baseUrl}/transcribe`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Errore durante la trascrizione')
    }

    const result = await response.json()
    return result.data
  }

  // Solo riassunto
  static async generateSummary(transcriptionText: string, language: string = 'it'): Promise<any> {
    const response = await fetch(`${this.baseUrl}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transcriptionText,
        language
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Errore durante la generazione del riassunto')
    }

    const result = await response.json()
    return result.data
  }

  // Polling per monitorare lo stato di un job
  static async pollJobStatus(
    jobId: string,
    onUpdate: (job: TranscriptionJob) => void,
    maxAttempts: number = 60,
    intervalMs: number = 5000
  ): Promise<TranscriptionJob> {
    let attempts = 0

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++
          const job = await this.getJobStatus(jobId)
          onUpdate(job)

          if (job.status === 'COMPLETED') {
            resolve(job)
            return
          }

          if (job.status === 'ERROR') {
            reject(new Error(job.error || 'Errore durante l\'elaborazione'))
            return
          }

          if (attempts >= maxAttempts) {
            reject(new Error('Timeout: elaborazione troppo lunga'))
            return
          }

          // Continua il polling
          setTimeout(poll, intervalMs)

        } catch (error) {
          reject(error)
        }
      }

      poll()
    })
  }
}

export default AudioProcessingAPI
